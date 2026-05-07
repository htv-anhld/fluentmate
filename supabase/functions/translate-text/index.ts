/**
 * translate-text — Supabase Edge Function (Deno)
 *
 * Translates between English and Vietnamese via Google Gemini.
 * - If `targetLang` is provided AND differs from detected source → translate to it.
 * - If `targetLang` is missing OR equals source → translate to the OTHER language.
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

type Body = {
  text: string;
  targetLang?: 'vi' | 'en';
};

const TRANSLATE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    sourceLang: { type: 'string', enum: ['en', 'vi'] },
    targetLang: { type: 'string', enum: ['en', 'vi'] },
    translation: { type: 'string' },
  },
  required: ['sourceLang', 'targetLang', 'translation'],
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';

  try {
    if (!GEMINI_API_KEY) {
      return jsonResponse({ error: 'GEMINI_API_KEY not configured' }, 500);
    }

    const body = (await req.json()) as Body;
    if (!body.text) {
      return jsonResponse({ error: 'Missing text' }, 400);
    }

    const LABEL: Record<string, string> = {
      vi: 'Vietnamese (tiếng Việt)',
      en: 'English',
    };
    const targetHint = body.targetLang
      ? `User requested target language: ${LABEL[body.targetLang]}.
- If the source language is the SAME as the requested target, translate to the OTHER language instead (so the button is always useful).
- Otherwise translate to the requested target.`
      : 'Translate to the OTHER language (English ↔ Vietnamese).';

    const systemPrompt = `You are a translator between English and Vietnamese.
Detect the source language of the input text.
${targetHint}
Preserve tone, slang, and punctuation. Keep it natural.

Return ONLY a single JSON object that matches the schema with these fields:
- sourceLang: "en" or "vi" (the detected source language of the input)
- targetLang: "en" or "vi" (the language you translated INTO; must differ from sourceLang)
- translation: the translated text in targetLang

The "translation" field MUST be in the targetLang, NEVER the same as the input.`;

    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: body.text }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 512,
            responseMimeType: 'application/json',
            responseSchema: TRANSLATE_RESPONSE_SCHEMA,
          },
        }),
      },
    );

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('[translate-text] Gemini error', apiRes.status, errText);
      return jsonResponse(
        { error: 'Gemini API error', detail: errText, status: apiRes.status },
        502,
      );
    }

    const data = await apiRes.json();
    const parts: Array<{ text?: string }> =
      data?.candidates?.[0]?.content?.parts ?? [];
    const jsonText = parts.map((p) => p.text ?? '').join('').trim();

    if (!jsonText) {
      console.error(
        '[translate-text] Gemini returned no text',
        JSON.stringify(data).slice(0, 500),
      );
      return jsonResponse({ translation: '', error: 'No content' }, 502);
    }

    try {
      const parsed = JSON.parse(jsonText) as {
        sourceLang?: string;
        targetLang?: string;
        translation?: string;
      };
      return jsonResponse(
        {
          translation: parsed.translation ?? '',
          sourceLang: parsed.sourceLang,
          targetLang: parsed.targetLang,
        },
        200,
      );
    } catch (e) {
      console.error('[translate-text] parse failed', e, jsonText.slice(0, 500));
      return jsonResponse({ translation: '', error: 'Parse failed' }, 502);
    }
  } catch (err) {
    console.error('[translate-text] unhandled', err);
    return jsonResponse({ error: 'unhandled', detail: String(err) }, 500);
  }
});

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
