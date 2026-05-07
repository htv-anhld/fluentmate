import { api } from './api';
import { supabase, isSupabaseConfigured } from './supabase';
import { getDialog } from '@/constants/scenarioDialog';
import { usePreferencesStore } from '@/store/preferencesStore';
import type { ConversationSettings, SessionReport } from '@/types';

export type StartConversationResponse = {
  sessionId: string;
  greeting: { text: string; audioUrl?: string };
};

export type TurnResponse = {
  text: string;
  audioUrl?: string;
  feedback?: {
    grammarIssues: unknown[];
    pronunciationScore: number;
    fluencyScore: number;
    nativeRephrase?: string;
  };
};

export type HistoryItem = {
  sessionId: string;
  scenarioId: string;
  startedAt: number;
  endedAt?: number;
  turnsCount: number;
};

function greetingFor(scenarioId: string, title: string): string {
  const dialog = getDialog({ id: scenarioId, title });
  if (dialog.greeting && !dialog.greeting.startsWith("Let's start practicing")) {
    return dialog.greeting;
  }
  return `Hi! Let's practice "${title}". Ready when you are.`;
}

export const conversationService = {
  async start(
    scenarioId: string,
    settings?: Partial<ConversationSettings>,
  ): Promise<StartConversationResponse> {
    if (!isSupabaseConfigured) {
      return api('/v1/conversations/start', {
        method: 'POST',
        body: { scenarioId, settings },
      });
    }
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) throw new Error('Not authenticated');

    // Look up scenario for greeting
    const { data: sc } = await supabase
      .from('scenarios')
      .select('id, title, goal')
      .eq('id', scenarioId)
      .maybeSingle();

    const greetingText = greetingFor(
      scenarioId,
      sc?.title ?? 'this scenario',
    );

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        user_id: uid,
        scenario_id: sc ? scenarioId : null,
        settings: settings ?? null,
        turns_count: 1,
      })
      .select('id')
      .single();
    if (error) throw error;

    // Persist the greeting as the first AI turn
    await supabase.from('turns').insert({
      session_id: session.id,
      role: 'ai',
      text: greetingText,
    });

    return {
      sessionId: session.id,
      greeting: { text: greetingText },
    };
  },

  async turn(
    sessionId: string,
    userText: string,
    userAudioUrl?: string,
  ): Promise<TurnResponse> {
    if (!isSupabaseConfigured) {
      return api('/v1/conversations/turn', {
        method: 'POST',
        body: { sessionId, userText, userAudioUrl },
      });
    }
    // Get scenario id from session for context
    const { data: sess } = await supabase
      .from('sessions')
      .select('scenario_id')
      .eq('id', sessionId)
      .single();
    const scenarioId = (sess?.scenario_id as string | null) ?? '';

    // Look up scenario title + goal for richer prompt context
    let scenarioTitle: string | undefined;
    let scenarioGoal: string | undefined;
    if (scenarioId) {
      const { data: sc } = await supabase
        .from('scenarios')
        .select('title, goal')
        .eq('id', scenarioId)
        .maybeSingle();
      scenarioTitle = (sc?.title as string | null) ?? undefined;
      scenarioGoal = (sc?.goal as string | null) ?? undefined;
    }

    // Pull user profile for prompt context (level + coach personality)
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    let level: string | undefined;
    let coachPersonality: string | undefined;
    if (uid) {
      const { data: profile } = await supabase
        .from('users')
        .select('level, coach_personality')
        .eq('id', uid)
        .maybeSingle();
      level = (profile?.level as string | null) ?? undefined;
      coachPersonality =
        (profile?.coach_personality as string | null) ?? undefined;
    }

    // Build conversation history for AI context
    const { data: prevTurns } = await supabase
      .from('turns')
      .select('role, text')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    const history = ((prevTurns ?? []) as { role: string; text: string }[]).map(
      (t) => ({ role: t.role as 'user' | 'ai', text: t.text }),
    );

    // Try Edge Function (real Claude) first; fallback to scenario dialog
    let aiText: string;
    let fluencyScore = 70 + Math.floor(Math.random() * 20);
    let grammarIssues: unknown[] = [];

    try {
      const difficulty = usePreferencesStore.getState().difficulty;
      const { data: fnData, error: fnErr } = await supabase.functions.invoke(
        'conversation-turn',
        {
          body: {
            scenarioId,
            scenarioTitle,
            scenarioGoal,
            userText,
            history: [...history, { role: 'user', text: userText }],
            level,
            coachPersonality,
            difficulty,
          },
        },
      );
      if (fnErr) throw fnErr;
      const r = fnData as {
        text: string;
        feedback?: {
          grammarIssues?: unknown[];
          fluencyScore?: number;
        };
      };
      aiText = r.text;
      if (r.feedback?.fluencyScore != null) fluencyScore = r.feedback.fluencyScore;
      if (r.feedback?.grammarIssues) grammarIssues = r.feedback.grammarIssues;
    } catch {
      // Fallback: scenario-aware sample reply
      const dialog = getDialog({ id: scenarioId, title: scenarioTitle });
      const aiTurnsCount = history.filter((t) => t.role === 'ai').length;
      aiText = dialog.aiReplies[aiTurnsCount % dialog.aiReplies.length]!;
    }

    // Record user turn
    const { error: e1 } = await supabase.from('turns').insert({
      session_id: sessionId,
      role: 'user',
      text: userText,
      audio_url: userAudioUrl,
      fluency_score: fluencyScore,
      pronunciation_score: fluencyScore,
      grammar_issues: grammarIssues.length > 0 ? grammarIssues : null,
    });
    if (e1) throw e1;

    const { error: e2 } = await supabase
      .from('turns')
      .insert({ session_id: sessionId, role: 'ai', text: aiText });
    if (e2) throw e2;

    // Bump turn count
    await supabase
      .from('sessions')
      .update({ turns_count: history.length + 2 })
      .eq('id', sessionId);

    return {
      text: aiText,
      feedback: {
        grammarIssues,
        pronunciationScore: fluencyScore,
        fluencyScore,
      },
    };
  },

  async end(sessionId: string): Promise<SessionReport> {
    if (!isSupabaseConfigured) {
      return api('/v1/conversations/end', {
        method: 'POST',
        body: { sessionId },
      });
    }
    // Delegate to the session-report Edge Function which:
    //  - aggregates session stats
    //  - calls Claude (tool_use) for grammar mistakes + mispronounced words
    //  - persists session totals + bumps streak
    //  - returns the enriched SessionReport
    const { data, error } = await supabase.functions.invoke('session-report', {
      body: { sessionId },
    });
    if (error) throw error;
    return data as SessionReport;
  },

  async history(): Promise<{ data: HistoryItem[] }> {
    if (!isSupabaseConfigured) {
      return api('/v1/conversations/history');
    }
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) return { data: [] };

    const { data, error } = await supabase
      .from('sessions')
      .select('id, scenario_id, started_at, ended_at, turns_count')
      .eq('user_id', uid)
      .order('started_at', { ascending: false })
      .limit(20);
    if (error) throw error;

    type S = {
      id: string;
      scenario_id: string;
      started_at: string;
      ended_at: string | null;
      turns_count: number | null;
    };
    return {
      data: ((data ?? []) as S[]).map((r) => ({
        sessionId: r.id,
        scenarioId: r.scenario_id,
        startedAt: new Date(r.started_at).getTime(),
        endedAt: r.ended_at ? new Date(r.ended_at).getTime() : undefined,
        turnsCount: r.turns_count ?? 0,
      })),
    };
  },
};

async function bumpStreak() {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) return;

  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();

  if (!existing) {
    await supabase.from('streaks').insert({
      user_id: uid,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
    });
    return;
  }

  if (existing.last_active_date === today) return;

  // Treat as consecutive if last_active was yesterday, else reset
  const wasYesterday = existing.last_active_date
    ? Math.round(
        (new Date(today).getTime() -
          new Date(existing.last_active_date).getTime()) /
          (24 * 60 * 60 * 1000),
      ) === 1
    : false;
  const newCurrent = wasYesterday ? existing.current_streak + 1 : 1;
  const newLongest = Math.max(existing.longest_streak, newCurrent);

  await supabase
    .from('streaks')
    .update({
      current_streak: newCurrent,
      longest_streak: newLongest,
      last_active_date: today,
    })
    .eq('user_id', uid);
}
