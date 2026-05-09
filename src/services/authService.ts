import { supabase, isSupabaseConfigured } from './supabase';
import { storage } from './storage';
import type { Session } from '@supabase/supabase-js';

const DEV_CRED_KEY = 'auth.dev-cred.v1';

type DevCred = { email: string; password: string };

/**
 * Ensure we have a Supabase auth session. Called on app launch.
 *
 * Strategy:
 *   1. Use existing session if persisted.
 *   2. Try anonymous sign-in (preferred — no PII).
 *   3. If anon disabled, fall back to email+password with auto-generated creds
 *      (relies on the dev auto_confirm_user trigger so signup is immediately usable).
 *      Same creds reused on next launch via MMKV.
 */
export async function ensureSession(): Promise<Session | null> {
  if (!isSupabaseConfigured) return null;

  const existing = await supabase.auth.getSession();
  if (existing.data.session) return existing.data.session;

  // 1) Try anonymous
  const anon = await supabase.auth.signInAnonymously();
  if (anon.data.session) return anon.data.session;

  if (anon.error?.code !== 'anonymous_provider_disabled') {
    // Different error — bubble up via console
    // eslint-disable-next-line no-console
    console.warn('[auth] anon sign-in failed:', anon.error?.message);
  }

  // 2) Email/password fallback
  const stored = readDevCred();
  if (stored) {
    const r = await supabase.auth.signInWithPassword(stored);
    if (r.data.session) return r.data.session;
    // Stored creds invalid — wipe and re-signup below
    storage.remove(DEV_CRED_KEY);
  }

  const cred = generateCred();
  const signup = await supabase.auth.signUp(cred);
  if (signup.error) {
    // eslint-disable-next-line no-console
    console.warn('[auth] dev signup failed:', signup.error.message);
    return null;
  }

  // The auto_confirm_user trigger marks the user confirmed → we can sign in immediately.
  // Some Supabase versions return a session straight from signUp; otherwise sign in explicitly.
  if (signup.data.session) {
    persistDevCred(cred);
    return signup.data.session;
  }

  const login = await supabase.auth.signInWithPassword(cred);
  if (login.data.session) {
    persistDevCred(cred);
    return login.data.session;
  }

  // eslint-disable-next-line no-console
  console.warn('[auth] dev login failed:', login.error?.message);
  return null;
}

/** Sign out but keep dev cred so the user can re-login from the Login screen. */
export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
  // Note: we keep DEV_CRED_KEY so login screen can offer one-tap re-entry.
}

/** Wipe everything for a true "use a different account" flow. */
export async function forgetDevice(): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
  storage.remove(DEV_CRED_KEY);
}

/** Sign in using stored dev credentials (one-tap return after logout). */
export async function signInWithStoredCred(): Promise<Session | null> {
  if (!isSupabaseConfigured) return null;
  const stored = readDevCred();
  if (!stored) return null;
  const r = await supabase.auth.signInWithPassword(stored);
  return r.data.session ?? null;
}

export function getStoredEmail(): string | null {
  return readDevCred()?.email ?? null;
}

/** Manual email + password sign-in (for users who want a different account). */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<Session | null> {
  if (!isSupabaseConfigured) return null;
  const r = await supabase.auth.signInWithPassword({ email, password });
  if (r.error) throw r.error;
  if (r.data.session) {
    persistDevCred({ email, password });
  }
  return r.data.session ?? null;
}

/**
 * Upgrade the current (auto-generated) dev session to a real account
 * with the user's chosen email + password.
 *
 * IMPORTANT: we call the `claim-account` Edge Function (service-role + admin
 * API) instead of `supabase.auth.updateUser` because the latter sends a
 * confirmation email — without an SMTP setup the new email gets stuck in
 * `auth.users.email_change` and the user can never log in with it.
 */
export async function upgradeAccount(
  email: string,
  password: string,
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { data, error } = await supabase.functions.invoke('claim-account', {
    body: { email, password },
  });
  if (error) throw error;
  if ((data as { error?: string })?.error) {
    throw new Error((data as { error: string }).error);
  }
  // Force a fresh sign-in with the new credentials. `refreshSession()` alone
  // can leave the JWT carrying the original `is_anonymous: true` claim — RLS
  // policies check that claim, so reads silently fail on the next screen until
  // the next app launch. signInWithPassword guarantees a non-anonymous token.
  const fresh = await supabase.auth.signInWithPassword({ email, password });
  if (fresh.error) {
    // Last-resort fallback so we don't lose the user's progress
    await supabase.auth.refreshSession().catch(() => {});
  }
  // Persist new creds so login screen can sign back in with them.
  persistDevCred({ email, password });
}

export async function saveProfileToBackend(profile: {
  email?: string;
  name?: string;
  level?: string;
  goal?: string;
  industry?: string;
  interests?: string[];
  daily_goal_minutes?: number;
  reminder_time?: string;
  coach_personality?: string;
  voice_id?: string;
  speech_speed?: number;
  notification_prefs?: Record<string, boolean>;
  translation_language?: 'vi' | 'en';
  app_language?: 'vi' | 'en';
}): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) return;

  const { error } = await supabase.from('users').upsert({
    id: uid,
    email: profile.email ?? u.user?.email ?? `${uid}@anonymous.fluentmate`,
    ...profile,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[auth] saveProfile failed:', error.message);
  }
}

// ── Helpers ────────────────────────────────────────────────
function generateCred(): DevCred {
  const id = Math.random().toString(36).slice(2, 11);
  const noise = Math.random().toString(36).slice(2, 8);
  return {
    email: `dev-${id}@nokasoft.com`,
    password: `Dev_${noise}_${Date.now().toString(36)}`,
  };
}

function readDevCred(): DevCred | null {
  const raw = storage.getString(DEV_CRED_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DevCred;
  } catch {
    return null;
  }
}

function persistDevCred(cred: DevCred) {
  storage.set(DEV_CRED_KEY, JSON.stringify(cred));
}
