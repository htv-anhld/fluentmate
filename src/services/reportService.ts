import { api } from './api';
import { supabase, isSupabaseConfigured } from './supabase';
import type { DailyReport, SkillRadar } from '@/types';
import type { CONTINUE_LIST } from '@/constants/mockData';

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  weekDays: boolean[];
};

export type ContinueItem = (typeof CONTINUE_LIST)[number];

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  weekDays: [false, false, false, false, false, false, false],
};

function emptyDaily(date = new Date().toISOString().slice(0, 10)): DailyReport {
  const skills: SkillRadar = {
    pronunciation: 0,
    grammar: 0,
    vocabulary: 0,
    fluency: 0,
    confidence: 0,
  };
  return {
    date,
    totalMinutes: 0,
    sessionsCount: 0,
    reviewedCardsCount: 0,
    fluencyScore: 0,
    fluencyDelta: 0,
    newPhrases: [],
    weeklyTrend: [0, 0, 0, 0, 0, 0, 0],
    skills,
  };
}

async function countReviewsForDay(uid: string, date: string): Promise<number> {
  const start = `${date}T00:00:00Z`;
  const end = `${date}T23:59:59Z`;
  const { count, error } = await supabase
    .from('review_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', uid)
    .gte('reviewed_at', start)
    .lte('reviewed_at', end);
  if (error) return 0;
  return count ?? 0;
}

/** Build week-day boolean[] (Mon..Sun) from an iso date string. */
function buildWeekDays(lastActive: string | null, current: number): boolean[] {
  if (!lastActive || current === 0) {
    return [false, false, false, false, false, false, false];
  }
  // Mark today as done; previous days based on streak count
  const todayDow = new Date().getDay(); // 0=Sun..6=Sat
  const monIndex = todayDow === 0 ? 6 : todayDow - 1;
  const week = [false, false, false, false, false, false, false];
  for (let i = 0; i <= Math.min(current - 1, monIndex); i++) {
    week[monIndex - i] = true;
  }
  return week;
}

export const reportService = {
  async streak(): Promise<StreakData> {
    if (!isSupabaseConfigured) {
      return api<StreakData>('/v1/reports/streak');
    }
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) return DEFAULT_STREAK;

    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', uid)
      .maybeSingle();

    if (error) throw error;
    if (!data) return DEFAULT_STREAK;

    return {
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastActiveDate: data.last_active_date ?? DEFAULT_STREAK.lastActiveDate,
      weekDays: buildWeekDays(data.last_active_date, data.current_streak),
    };
  },

  async daily(date?: string): Promise<DailyReport> {
    if (!isSupabaseConfigured) {
      return api<DailyReport>('/v1/reports/daily', { query: { date } });
    }
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    const target = date ?? new Date().toISOString().slice(0, 10);
    if (!uid) return emptyDaily(target);

    const { data, error } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('user_id', uid)
      .eq('date', target)
      .maybeSingle();

    if (error) throw error;
    const reviewedCardsCount = await countReviewsForDay(uid, target);
    if (!data) {
      // Derive on-the-fly from sessions for today (cron may not have run yet)
      const derived = await deriveDailyFromSessions(uid, target);
      return { ...derived, reviewedCardsCount };
    }

    return {
      date: data.date,
      totalMinutes: data.total_minutes ?? 0,
      sessionsCount: data.sessions_count ?? 0,
      reviewedCardsCount,
      fluencyScore: Number(data.fluency_score ?? 0),
      fluencyDelta: Number(data.fluency_delta ?? 0),
      newPhrases: (data.new_phrases as string[]) ?? [],
      recurringMistake:
        typeof data.recurring_mistake === 'string'
          ? data.recurring_mistake
          : (data.recurring_mistake as { description?: string })?.description,
      bestSentence: data.best_sentence ?? undefined,
      weeklyTrend:
        (data.weekly_trend as number[]) ?? [0, 0, 0, 0, 0, 0, 0],
      skills: emptyDaily().skills,
    };
  },

  async weekly(week?: string): Promise<DailyReport> {
    // Week aggregation: reuse daily for now (full week aggregation =
    // sum sessions across last 7 days). Backend cron should populate.
    return this.daily(week);
  },

  async continueList(): Promise<ContinueItem[]> {
    if (!isSupabaseConfigured) {
      return api<ContinueItem[]>('/v1/today/continue');
    }
    // Without backend continue logic, return last 3 sessions as resume candidates.
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) return [];

    const { data, error } = await supabase
      .from('sessions')
      .select('id, scenario_id, started_at, ended_at, scenarios(title_vi, icon_emoji)')
      .eq('user_id', uid)
      .order('started_at', { ascending: false })
      .limit(3);

    if (error) throw error;
    type Row = {
      id: string;
      scenario_id: string;
      started_at: string;
      ended_at: string | null;
      scenarios:
        | { title_vi: string | null; icon_emoji: string | null }
        | { title_vi: string | null; icon_emoji: string | null }[]
        | null;
    };
    const rows = ((data ?? []) as unknown) as Row[];
    return rows.map((r) => {
      const sc = Array.isArray(r.scenarios) ? r.scenarios[0] : r.scenarios;
      return {
        id: r.id,
        type: 'scenario' as const,
        title: sc?.title_vi ?? 'Phiên hội thoại',
        subtitle: r.ended_at ? 'Đã hoàn thành' : 'Đang dở',
        progress: r.ended_at ? 1 : 0.5,
        icon: sc?.icon_emoji ?? '💬',
        iconBg: 'rgba(74,159,255,0.10)',
        route: `/conversation/${r.scenario_id}` as const,
      };
    }) as ContinueItem[];
  },
};

async function deriveDailyFromSessions(
  uid: string,
  date: string,
): Promise<DailyReport> {
  const start = `${date}T00:00:00Z`;
  const end = `${date}T23:59:59Z`;
  const { data, error } = await supabase
    .from('sessions')
    .select('duration_sec, avg_fluency_score, words_spoken')
    .eq('user_id', uid)
    .gte('started_at', start)
    .lte('started_at', end);

  if (error) throw error;
  type S = {
    duration_sec: number | null;
    avg_fluency_score: number | null;
    words_spoken: number | null;
  };
  const rows = (data ?? []) as S[];
  if (rows.length === 0) return emptyDaily(date);

  const totalSec = rows.reduce((s, r) => s + (r.duration_sec ?? 0), 0);
  const avgFluency =
    rows.reduce((s, r) => s + Number(r.avg_fluency_score ?? 0), 0) / rows.length;

  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  return {
    ...emptyDaily(date),
    totalMinutes: Math.round(totalSec / 60),
    sessionsCount: rows.length,
    fluencyScore: clamp(Math.round(avgFluency)),
    skills: {
      pronunciation: clamp(Math.round(avgFluency - 5)),
      grammar: clamp(Math.round(avgFluency - 8)),
      vocabulary: clamp(Math.round(avgFluency + 3)),
      fluency: clamp(Math.round(avgFluency)),
      confidence: clamp(Math.round(avgFluency - 2)),
    },
  };
}
