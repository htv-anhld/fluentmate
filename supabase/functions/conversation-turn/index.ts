/**
 * conversation-turn — Supabase Edge Function (Deno)
 *
 * Generates AI reply + grammar feedback via Google Gemini using forced
 * function calling for guaranteed structured output.
 *
 * Required secrets:
 *   GEMINI_API_KEY=...
 */

// @ts-expect-error Deno-runtime imports.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

declare const Deno: { env: { get(key: string): string | undefined } };

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Turn = { role: 'user' | 'ai'; text: string };
type Body = {
  scenarioId: string;
  userText: string;
  history: Turn[];
  scenarioTitle?: string;
  scenarioGoal?: string;
  level?: string;
  coachPersonality?: string;
  difficulty?: 'easier' | 'match' | 'push';
};

const SCENARIO_HINTS: Record<string, { title: string; goal: string }> = {
  'sc-coffee': {
    title: 'Order coffee at a café',
    goal: 'You are a friendly barista at a small café. Help the user order. Ask about size, milk, and for-here-or-to-go.',
  },
  'sc-meeting': {
    title: 'Daily standup',
    goal: 'You are a tech lead running a 5-min standup. Ask about progress, blockers, plans for today.',
  },
  'sc-airport': {
    title: 'Check-in at the airport',
    goal: 'You are an airline check-in agent. Ask about bags, seat preference, and remind about boarding.',
  },
  'sc-introduce': {
    title: 'Meet a new colleague',
    goal: 'You are a new colleague meeting the user for the first time. Make small talk about role, team, hobbies.',
  },
  'sc-restaurant': {
    title: 'Make a restaurant reservation',
    goal: 'You are a restaurant host taking a reservation. Ask date/time, party size, preferences.',
  },
  'sc-interview': {
    title: 'Job interview',
    goal: "You are an interviewer for a mobile dev role. Ask classic interview questions starting with 'tell me about yourself'.",
  },
  'sc-doctor': {
    title: 'At the doctor',
    goal: 'You are a friendly GP. Ask about symptoms, duration, severity. Give simple advice.',
  },
  'sc-presentation': {
    title: 'Pitch your idea',
    goal: 'You are a VC investor listening to a pitch. Ask about problem, market, business model.',
  },
};

const PERSONALITY_HINTS: Record<string, string> = {
  mentor:
    'Patient, encouraging. Explain mistakes kindly. Use phrases like "Great effort!", "Nice try."',
  friend:
    'Casual, warm, like chatting with a close friend. Use contractions, light humor, "No worries!"',
  strict:
    'Direct corrections. Push for accuracy. Phrases like "Try again with...", "Almost — focus on...".',
  funny:
    'Light, playful humor. Make small jokes related to the topic. Keep it kind, not sarcastic.',
};

const DIFFICULTY_HINTS: Record<string, string> = {
  easier: "Speak SLIGHTLY simpler than the user's level. Shorter sentences.",
  match: "Match the user's level. Natural conversation pace.",
  push: "Push slightly above the user's level. Use richer vocabulary, longer sentences.",
};

function buildSystemPrompt(b: Body): string {
  const sc = SCENARIO_HINTS[b.scenarioId] ?? {
    title: b.scenarioTitle ?? 'English practice',
    goal: b.scenarioGoal ?? 'Have a friendly English conversation.',
  };
  const personality = PERSONALITY_HINTS[b.coachPersonality ?? 'mentor'];
  const difficulty = DIFFICULTY_HINTS[b.difficulty ?? 'match'];
  const level = b.level ?? 'B1';

  return `You are an English conversation coach for a Vietnamese learner.
Stay fully in-character for the role-play scenario.

SCENARIO: ${sc.title}
ROLE: ${sc.goal}

LEVEL: ${level}
- A0/A1: keep replies under 15 words, simple grammar.
- A2: under 25 words, common vocabulary.
- B1: under 35 words, natural conversational English.
- B2+: full natural responses, use idioms occasionally.

DIFFICULTY: ${difficulty ?? DIFFICULTY_HINTS.match}

PERSONALITY: ${personality ?? PERSONALITY_HINTS.mentor}

You MUST call the \`provide_reply\` function with structured arguments.
Never reply in plain text — always use the function call.

In the function arguments:
- "text" is your spoken reply, fully in-character.
- "grammarIssues" should be empty [] if the user's last message was fine.
- For each grammar issue, provide a kind one-line Vietnamese explanation.
- "fluencyScore" is your judgement of the user's last message overall (0-100).
- "nativeRephrase" is OPTIONAL — only if you think a more natural rephrase helps.
- If user goes off-scenario, gently steer them back inside the "text" field.`;
}

const REPLY_FUNCTION_DECL = {
  name: 'provide_reply',
  description:
    'Provide the AI coach reply with structured grammar/fluency feedback.',
  parameters: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'Your in-character spoken reply.',
      },
      grammarIssues: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            original: { type: 'string' },
            correction: { type: 'string' },
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
            explanationVi: {
              type: 'string',
              description: 'Short Vietnamese explanation of the issue.',
            },
          },
          required: ['original', 'correction', 'type', 'explanationVi'],
        },
      },
      fluencyScore: {
        type: 'integer',
        description: "Overall fluency score for the user's last message (0-100).",
      },
      nativeRephrase: {
        type: 'string',
        description:
          'Optional more natural way the user could have said it. Single sentence, no quotes.',
      },
    },
    required: ['text', 'grammarIssues', 'fluencyScore'],
  },
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  // Read env INSIDE handler so secret rotations apply immediately.
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';

  try {
    if (!GEMINI_API_KEY) {
      return jsonResponse({ error: 'GEMINI_API_KEY not configured' }, 500);
    }

    const body: Body = await req.json();
    if (!body.userText || !body.scenarioId) {
      return jsonResponse({ error: 'Missing userText or scenarioId' }, 400);
    }

    const systemPrompt = buildSystemPrompt(body);

    // Build Gemini "contents" from history + the new user text.
    // Gemini uses { role, parts: [{ text }] } where role is 'user' | 'model'.
    const contents = [
      ...(body.history ?? []).map((t) => ({
        role: t.role === 'ai' ? 'model' : 'user',
        parts: [{ text: t.text }],
      })),
      { role: 'user', parts: [{ text: body.userText }] },
    ];

    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          tools: [{ functionDeclarations: [REPLY_FUNCTION_DECL] }],
          toolConfig: {
            functionCallingConfig: {
              mode: 'ANY',
              allowedFunctionNames: ['provide_reply'],
            },
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      },
    );

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('[conversation-turn] Gemini error', apiRes.status, errText);
      return jsonResponse(
        { error: 'Gemini API error', detail: errText, status: apiRes.status },
        502,
      );
    }

    const data = await apiRes.json();

    type Part =
      | { text: string }
      | { functionCall: { name: string; args: Record<string, unknown> } };
    const parts: Part[] =
      data?.candidates?.[0]?.content?.parts ?? [];
    const fnCall = parts.find(
      (p): p is Extract<Part, { functionCall: unknown }> => 'functionCall' in p,
    );

    if (fnCall?.functionCall?.args) {
      const args = fnCall.functionCall.args as {
        text?: string;
        grammarIssues?: unknown[];
        fluencyScore?: number;
        nativeRephrase?: string;
      };
      return jsonResponse(
        {
          text: args.text ?? '',
          feedback: {
            grammarIssues: args.grammarIssues ?? [],
            fluencyScore: args.fluencyScore ?? 75,
            nativeRephrase: args.nativeRephrase,
          },
        },
        200,
      );
    }

    // Fallback: treat any text reply as plain output.
    const textPart = parts.find(
      (p): p is Extract<Part, { text: string }> => 'text' in p,
    );
    return jsonResponse(
      {
        text: textPart?.text?.trim() ?? '',
        feedback: { grammarIssues: [], fluencyScore: 75 },
      },
      200,
    );
  } catch (err) {
    console.error('[conversation-turn] unhandled', err);
    return jsonResponse({ error: 'unhandled', detail: String(err) }, 500);
  }
});

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
