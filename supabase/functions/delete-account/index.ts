/**
 * delete-account — Supabase Edge Function (Deno)
 *
 * Permanently deletes the calling user's account + all related data.
 * Required by Apple guideline 5.1.1(v) and Google Play "User-generated content"
 * policy: apps that let users create accounts MUST let them delete in-app.
 *
 * Cascade order (child rows first to satisfy any FKs that lack ON DELETE CASCADE):
 *   review_sessions → vocabulary → turns → sessions → daily_reports
 *   → streaks → public.users → auth.users
 *
 * The caller MUST be authenticated; we read the user id from the JWT.
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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return jsonResponse({ error: 'Supabase env not available' }, 500);
    }

    // Identify caller from JWT.
    const authHeader = req.headers.get('Authorization') ?? '';
    const accessToken = authHeader.replace(/^Bearer\s+/i, '');
    if (!accessToken) {
      return jsonResponse({ error: 'Missing access token' }, 401);
    }

    const userClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });
    const { data: u, error: uErr } = await userClient.auth.getUser(accessToken);
    if (uErr || !u.user) {
      return jsonResponse({ error: 'Unauthorized', detail: uErr?.message }, 401);
    }
    const uid = u.user.id;
    const callerEmail = u.user.email ?? '(no email)';
    console.log(`[delete-account] uid=${uid} email=${callerEmail}`);

    // Service-role client bypasses RLS for the cascade delete.
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // Delete child rows first. Errors are logged but don't abort — we want to
    // remove as much as possible and finish with the auth row at the end.
    const results: Record<string, string> = {};

    // turns has no user_id — delete via session_id IN (user's sessions).
    const { data: userSessions } = await admin
      .from('sessions')
      .select('id')
      .eq('user_id', uid);
    const sessionIds = (userSessions ?? []).map(
      (s: { id: string }) => s.id,
    );
    if (sessionIds.length > 0) {
      const { error } = await admin
        .from('turns')
        .delete()
        .in('session_id', sessionIds);
      results.turns = error ? `error: ${error.message}` : 'ok';
    } else {
      results.turns = 'no sessions';
    }

    // Tables keyed directly by user_id.
    const userIdTables = [
      'review_sessions',
      'vocabulary',
      'sessions',
      'daily_reports',
      'streaks',
    ];
    for (const table of userIdTables) {
      const { error } = await admin.from(table).delete().eq('user_id', uid);
      results[table] = error ? `error: ${error.message}` : 'ok';
    }

    // public.users keyed by id.
    {
      const { error } = await admin.from('users').delete().eq('id', uid);
      results.users = error ? `error: ${error.message}` : 'ok';
    }

    console.log(`[delete-account] table results:`, results);

    // Verify public.users is gone before proceeding.
    const { count: stillThere } = await admin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('id', uid);
    console.log(`[delete-account] public.users still has rows: ${stillThere}`);

    // Finally, delete the auth user (irreversible).
    const { error: authErr } = await admin.auth.admin.deleteUser(uid);
    if (authErr) {
      console.error(`[delete-account] auth delete failed: ${authErr.message}`);
      return jsonResponse(
        { error: 'auth delete failed', detail: authErr.message, partial: results, uid },
        500,
      );
    }

    console.log(`[delete-account] success uid=${uid}`);
    return jsonResponse({
      ok: true,
      uid,
      email: callerEmail,
      deletedTables: results,
      publicUsersRemaining: stillThere ?? 0,
    });
  } catch (err) {
    console.error(`[delete-account] unhandled:`, err);
    return jsonResponse({ error: 'unhandled', detail: String(err) }, 500);
  }
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
