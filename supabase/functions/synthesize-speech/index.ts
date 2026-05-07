/**
 * synthesize-speech — Supabase Edge Function (Deno)
 *
 * Generates audio from text via ElevenLabs Turbo v2.5.
 * Returns base64-encoded MP3 so the mobile app can write it to a file
 * and play with Audio.Sound (expo-av).
 *
 * Required secret:
 *   ELEVENLABS_API_KEY=sk_...
 *
 * Deploy:
 *   supabase functions deploy synthesize-speech
 *
 * Invoke:
 *   supabase.functions.invoke('synthesize-speech', {
 *     body: { text, voiceId: 'EXAVITQu4vr4xnSDxMaL' }
 *   })
 */

// @ts-expect-error Deno-runtime imports.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const MODEL_ID = Deno.env.get('ELEVENLABS_MODEL') ?? 'eleven_turbo_v2_5';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Body = {
  text: string;
  /** ElevenLabs voice id (raw, not our internal id). */
  voiceId: string;
  stability?: number;
  similarityBoost?: number;
};

function bytesToBase64(bytes: Uint8Array): string {
  // Encode in chunks to avoid call-stack overflow on large arrays.
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, Math.min(i + chunk, bytes.length)),
    );
  }
  return btoa(binary);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    if (!ELEVENLABS_API_KEY) {
      return jsonResponse({ error: 'ELEVENLABS_API_KEY not configured' }, 500);
    }

    const body = (await req.json()) as Body;
    if (!body.text || !body.voiceId) {
      return jsonResponse({ error: 'Missing text or voiceId' }, 400);
    }

    const elRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${body.voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: body.text,
          model_id: MODEL_ID,
          voice_settings: {
            stability: body.stability ?? 0.5,
            similarity_boost: body.similarityBoost ?? 0.75,
          },
        }),
      },
    );

    if (!elRes.ok) {
      const errText = await elRes.text();
      return jsonResponse(
        {
          error: 'ElevenLabs error',
          detail: errText,
          status: elRes.status,
        },
        502,
      );
    }

    const buf = new Uint8Array(await elRes.arrayBuffer());
    const audioBase64 = bytesToBase64(buf);

    return jsonResponse({ audioBase64, mimeType: 'audio/mpeg' }, 200);
  } catch (err) {
    return jsonResponse({ error: 'unhandled', detail: String(err) }, 500);
  }
});

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
