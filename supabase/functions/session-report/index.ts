/**
 * session-report — Supabase Edge Function (Deno)
 *
 * Reads session + turns from DB, asks Google Gemini for a structured evaluation,
 * persists session totals + bumps streak, returns the enriched report.
 *
 * Required secrets:
 *   GEMINI_API_KEY=...
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (auto-injected on deploy)
 */

// @ts-expect-error Deno-runtime imports.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-expect-error Deno-runtime imports.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const Deno: { env: { get(key: string): string | undefined } };

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Body = { sessionId: string };

const REPORT_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    fluencyScore: { type: 'integer' },
    pronunciationScore: { type: 'integer' },
    grammarScore: { type: 'integer' },
    vocabularyScore: { type: 'integer' },
    overallSummary: { type: 'string' },
    wordMistakes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          original: { type: 'string' },
          correction: { type: 'string' },
          explanationVi: { type: 'string' },
          type: {
            type: 'string',
            enum: [
              'tense',
              'article',
              'preposition',
              'word-order',
              'plural',
              'word-choice',
              'spelling',
              'other',
            ],
          },
        },
        required: ['original', 'correction', 'explanationVi', 'type'],
      },
    },
    mispronouncedWords: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          word: { type: 'string' },
          ipa: { type: 'string' },
          tipVi: { type: 'string' },
        },
        required: ['word', 'ipa', 'tipVi'],
      },
    },
    strengths: { type: 'array', items: { type: 'string' } },
    areasToImprove: { type: 'array', items: { type: 'string' } },
    bestSentence: { type: 'string' },
    encouragement: { type: 'string' },
  },
  required: [
    'fluencyScore',
    'pronunciationScore',
    'grammarScore',
    'vocabularyScore',
    'overallSummary',
    'wordMistakes',
    'mispronouncedWords',
    'strengths',
    'areasToImprove',
    'encouragement',
  ],
};

function buildSystemPrompt(level: string, scenarioTitle: string): string {
  return `You are an English language coach analyzing a conversation a Vietnamese learner just finished.

LEARNER LEVEL: ${level}
SCENARIO: ${scenarioTitle}

You will see the full conversation transcript. Evaluate ONLY the USER's lines.

Goals:
1. Find concrete grammar / word-choice mistakes (with the exact original phrase + corrected phrase).
2. Identify words the user likely mispronounced or might struggle with based on what's in their transcript (e.g. words with /θ/, /ð/, ending consonants, vowel pairs). For each, give the IPA and a Vietnamese pronunciation tip.
3. Score fluency, pronunciation, grammar, vocabulary 0-100, calibrated to their level.
4. Write a kind 2-3 sentence Vietnamese summary, list 2-3 strengths and 2-3 areas to improve.
5. Pick the user's BEST sentence (in English).
6. End with a 1-line Vietnamese encouragement.

You MUST return ONLY a single JSON object that matches the provided schema.
Do not wrap it in markdown, do not add any commentary outside the JSON.
All Vietnamese fields must be in natural Vietnamese, never English.`;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  try {
    if (!GEMINI_API_KEY) {
      return jsonResponse({ error: 'GEMINI_API_KEY not configured' }, 500);
    }
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return jsonResponse({ error: 'Supabase env not available' }, 500);
    }

    const body: Body = await req.json();
    if (!body.sessionId) {
      return jsonResponse({ error: 'Missing sessionId' }, 400);
    }

    const supa = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    const { data: session, error: sErr } = await supa
      .from('sessions')
      .select('id, started_at, scenario_id, user_id')
      .eq('id', body.sessionId)
      .single();
    if (sErr || !session) {
      return jsonResponse(
        { error: 'session not found', detail: sErr?.message },
        404,
      );
    }

    let scenarioTitle = 'English practice';
    let level = 'B1';
    if (session.scenario_id) {
      const { data: sc } = await supa
        .from('scenarios')
        .select('title, level')
        .eq('id', session.scenario_id)
        .maybeSingle();
      if (sc) {
        scenarioTitle = sc.title ?? scenarioTitle;
        level = sc.level ?? level;
      }
    }

    const { data: turnRows, error: tErr } = await supa
      .from('turns')
      .select('role, text, fluency_score')
      .eq('session_id', body.sessionId)
      .order('created_at', { ascending: true });
    if (tErr) {
      return jsonResponse(
        { error: 'turns fetch failed', detail: tErr.message },
        500,
      );
    }

    type T = { role: string; text: string; fluency_score: number | null };
    const turns = (turnRows ?? []) as T[];
    const userTurns = turns.filter((t) => t.role === 'user');
    const transcript = turns
      .map((t) => `${t.role.toUpperCase()}: ${t.text}`)
      .join('\n');

    const startedAtMs = new Date(session.started_at).getTime();
    const endedAt = new Date().toISOString();
    const durationSec = Math.max(
      1,
      Math.floor((Date.now() - startedAtMs) / 1000),
    );
    const wordsSpoken = userTurns.reduce(
      (s, t) => s + t.text.split(/\s+/).filter(Boolean).length,
      0,
    );

    let report: Record<string, unknown> = {};
    try {
      const apiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: buildSystemPrompt(level, scenarioTitle) }],
            },
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Conversation transcript:\n\n${transcript || '(no turns)'}\n\nReturn the structured evaluation JSON now.`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 2048,
              responseMimeType: 'application/json',
              responseSchema: REPORT_RESPONSE_SCHEMA,
            },
          }),
        },
      );
      if (apiRes.ok) {
        const data = await apiRes.json();
        const parts: Array<{ text?: string }> =
          data?.candidates?.[0]?.content?.parts ?? [];
        const jsonText = parts.map((p) => p.text ?? '').join('').trim();
        if (jsonText) {
          try {
            report = JSON.parse(jsonText) as Record<string, unknown>;
          } catch (parseErr) {
            console.error(
              '[session-report] JSON parse failed',
              parseErr,
              'raw:',
              jsonText.slice(0, 500),
            );
          }
        } else {
          console.error(
            '[session-report] Gemini returned no text part',
            JSON.stringify(data).slice(0, 500),
          );
        }
      } else {
        const errText = await apiRes.text();
        console.error(
          '[session-report] Gemini error',
          apiRes.status,
          errText,
        );
      }
    } catch (err) {
      console.error('[session-report] gemini call failed', err);
    }

    const avgFluencyFromTurns =
      userTurns.length === 0
        ? 0
        : Math.round(
            userTurns.reduce((s, t) => s + Number(t.fluency_score ?? 0), 0) /
              userTurns.length,
          );

    const fluencyScore =
      typeof report.fluencyScore === 'number'
        ? report.fluencyScore
        : avgFluencyFromTurns;
    const pronunciationScore =
      typeof report.pronunciationScore === 'number'
        ? report.pronunciationScore
        : avgFluencyFromTurns;

    await supa
      .from('sessions')
      .update({
        ended_at: endedAt,
        duration_sec: durationSec,
        words_spoken: wordsSpoken,
        turns_count: turns.length,
        avg_fluency_score: fluencyScore,
        avg_pronunciation_score: pronunciationScore,
      })
      .eq('id', body.sessionId);

    if (session.user_id) {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const { data: streak } = await supa
          .from('streaks')
          .select('current_streak, longest_streak, last_active_date')
          .eq('user_id', session.user_id)
          .maybeSingle();
        if (streak) {
          const last = streak.last_active_date as string | null;
          const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .slice(0, 10);
          const newCurrent =
            last === today
              ? streak.current_streak
              : last === yesterday
                ? streak.current_streak + 1
                : 1;
          const newLongest = Math.max(
            streak.longest_streak ?? 0,
            newCurrent,
          );
          await supa
            .from('streaks')
            .update({
              current_streak: newCurrent,
              longest_streak: newLongest,
              last_active_date: today,
            })
            .eq('user_id', session.user_id);
        } else {
          await supa.from('streaks').insert({
            user_id: session.user_id,
            current_streak: 1,
            longest_streak: 1,
            last_active_date: today,
          });
        }
      } catch (_e) {
        /* swallow */
      }
    }

    return jsonResponse({
      sessionId: body.sessionId,
      durationSec,
      wordsSpoken,
      turnsCount: turns.length,
      fluencyScore,
      pronunciationScore,
      grammarScore: report.grammarScore ?? fluencyScore,
      vocabularyScore: report.vocabularyScore ?? fluencyScore,
      overallSummary: report.overallSummary ?? '',
      wordMistakes: report.wordMistakes ?? [],
      mispronouncedWords: report.mispronouncedWords ?? [],
      strengths: report.strengths ?? [],
      areasToImprove: report.areasToImprove ?? [],
      bestSentence:
        (report.bestSentence as string | undefined) ??
        userTurns.at(-1)?.text ??
        '',
      encouragement: report.encouragement ?? '',
      date: new Date().toISOString().slice(0, 10),
    });
  } catch (err) {
    console.error('[session-report] unhandled', err);
    return jsonResponse({ error: 'unhandled', detail: String(err) }, 500);
  }
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
