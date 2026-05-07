/**
 * transcribe-audio — Supabase Edge Function (Deno)
 *
 * Receives base64-encoded audio from the mobile app, forwards to Deepgram
 * Nova-3, returns the transcript.
 *
 * Required secret:
 *   DEEPGRAM_API_KEY=...
 *
 * Deploy:
 *   supabase functions deploy transcribe-audio
 *
 * Invoke:
 *   supabase.functions.invoke('transcribe-audio', {
 *     body: { audioBase64, mimeType: 'audio/m4a', languages: ['en'] }
 *   })
 */

// @ts-expect-error Deno-runtime imports.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const DEEPGRAM_API_KEY = Deno.env.get('DEEPGRAM_API_KEY');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Body = {
  audioBase64: string;
  mimeType?: string;
  languages?: string[];
  /**
   * Force a specific Deepgram language code (e.g. 'en', 'vi').
   * When set, disables auto-detection — gives much more accurate transcripts
   * since Deepgram won't mistake a noisy English clip for Italian etc.
   * Falls back to auto-detect when missing.
   */
  language?: string;
};

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    if (!DEEPGRAM_API_KEY) {
      return jsonResponse({ error: 'DEEPGRAM_API_KEY not configured' }, 500);
    }

    const body = (await req.json()) as Body;
    if (!body.audioBase64) {
      return jsonResponse({ error: 'Missing audioBase64' }, 400);
    }

    const audio = base64ToBytes(body.audioBase64);
    const mimeType = body.mimeType ?? 'audio/m4a';

    // Build Deepgram URL. Prefer a forced `language` (much better accuracy
    // than auto-detect — auto-detect will sometimes mis-identify a short
    // English clip as Italian/Portuguese etc.). Fall back to detect_language
    // only when no hint is provided.
    //
    // Model selection: nova-3 is tuned for English. For non-English (e.g. vi),
    // fall back to nova-2 which has broader language coverage.
    const isNonEnglish = body.language && body.language !== 'en';
    const params = new URLSearchParams({
      model: isNonEnglish ? 'nova-2-general' : 'nova-3',
      smart_format: 'true',
      punctuate: 'true',
    });
    if (body.language) {
      params.set('language', body.language);
    } else {
      params.set('detect_language', 'true');
    }

    const dgRes = await fetch(
      `https://api.deepgram.com/v1/listen?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': mimeType,
        },
        body: audio,
      },
    );

    if (!dgRes.ok) {
      const errText = await dgRes.text();
      return jsonResponse(
        { error: 'Deepgram error', detail: errText, status: dgRes.status },
        502,
      );
    }

    const data = await dgRes.json();
    const transcript: string =
      data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? '';
    const confidence: number =
      data?.results?.channels?.[0]?.alternatives?.[0]?.confidence ?? 0;
    const detectedLanguage: string =
      data?.results?.channels?.[0]?.detected_language ?? '';

    return jsonResponse({
      transcript: transcript.trim(),
      confidence,
      detectedLanguage,
    });
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
