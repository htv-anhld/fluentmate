/**
 * claim-account — Supabase Edge Function (Deno)
 *
 * Upgrade an auto-generated dev account (dev-xxx@nokasoft.com) to a real
 * email + password. Uses the Supabase Admin API with `email_confirm: true`
 * so the new email is applied immediately, instead of going to `email_change`
 * and waiting for a confirmation link (which a dev project can't send).
 *
 * The caller MUST be authenticated — we read the user id from the JWT.
 *
 * Required secrets:
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (auto-injected on deploy)
 */

// @ts-expect-error Deno-runtime imports.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-expect-error Deno-runtime imports.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Body = { email: string; password: string };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return jsonResponse({ error: 'Supabase env not available' }, 500);
    }

    // Identify caller from the Authorization header.
    const authHeader = req.headers.get('Authorization') ?? '';
    const accessToken = authHeader.replace(/^Bearer\s+/i, '');
    if (!accessToken) {
      return jsonResponse({ error: 'Missing access token' }, 401);
    }

    const userClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const { data: u, error: uErr } = await userClient.auth.getUser(accessToken);
    if (uErr || !u.user) {
      return jsonResponse({ error: 'Unauthorized', detail: uErr?.message }, 401);
    }
    const uid = u.user.id;

    const body: Body = await req.json();
    if (!body.email || !EMAIL_RE.test(body.email)) {
      return jsonResponse({ error: 'Invalid email' }, 400);
    }
    if (!body.password || body.password.length < 8) {
      return jsonResponse({ error: 'Password must be at least 8 characters' }, 400);
    }

    // Admin client — service role, bypasses RLS + email confirmation flow.
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // Reject if the requested email is already taken by ANOTHER user.
    const { data: existing } = await admin.auth.admin.listUsers();
    const taken = existing?.users?.find(
      (x: { id: string; email?: string | null }) =>
        x.email?.toLowerCase() === body.email.toLowerCase() && x.id !== uid,
    );
    if (taken) {
      return jsonResponse({ error: 'Email already in use' }, 409);
    }

    // Apply both email + password atomically. `email_confirm: true` skips the
    // email-change confirmation flow, so the new email is live immediately.
    const { error: upErr } = await admin.auth.admin.updateUserById(uid, {
      email: body.email,
      password: body.password,
      email_confirm: true,
    });
    if (upErr) {
      return jsonResponse({ error: 'Update failed', detail: upErr.message }, 500);
    }

    // Mirror the email into public.users so profile lookups stay consistent.
    await admin
      .from('users')
      .upsert({ id: uid, email: body.email, updated_at: new Date().toISOString() });

    return jsonResponse({ ok: true, email: body.email });
  } catch (err) {
    return jsonResponse({ error: 'unhandled', detail: String(err) }, 500);
  }
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
