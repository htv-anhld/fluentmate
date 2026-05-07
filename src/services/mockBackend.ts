import { storage } from './storage';
import { SCENARIOS } from '@/constants/scenarios';
import {
  MOCK_DAILY_REPORT,
  MOCK_STREAK,
  CONTINUE_LIST,
} from '@/constants/mockData';
import { sm2Update } from '@/utils/sm2';
import type {
  CEFRLevel,
  ConversationTurn,
  DailyReport,
  Scenario,
  ScenarioCategory,
  SessionReport,
  SkillRadar,
  VocabularyItem,
} from '@/types';

const MOCK_KEY = 'mock-backend.v1';
const NETWORK_DELAY_MS = 250;

type MockState = {
  sessions: Array<{
    id: string;
    scenarioId: string;
    startedAt: number;
    endedAt?: number;
    turns: ConversationTurn[];
    settings?: unknown;
  }>;
  vocabulary: VocabularyItem[];
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
    weekDays: boolean[];
  };
  dailyReports: Record<string, DailyReport>;
  generatedScenarios: Scenario[];
  grammarProgress: Record<string, { phase: number; correct: number; total: number }>;
};

function defaultState(): MockState {
  return {
    sessions: [],
    vocabulary: seedVocabulary(),
    streak: {
      currentStreak: MOCK_STREAK.currentStreak,
      longestStreak: MOCK_STREAK.longestStreak,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      weekDays: [...MOCK_STREAK.weekDays],
    },
    dailyReports: {
      [MOCK_DAILY_REPORT.date]: MOCK_DAILY_REPORT,
    },
    generatedScenarios: [],
    grammarProgress: {
      'gr-1': { phase: 1, correct: 4, total: 10 },
    },
  };
}

function loadState(): MockState {
  const raw = storage.getString(MOCK_KEY);
  if (!raw) return defaultState();
  try {
    return JSON.parse(raw) as MockState;
  } catch {
    return defaultState();
  }
}

function saveState(s: MockState) {
  storage.set(MOCK_KEY, JSON.stringify(s));
}

function seedVocabulary(): VocabularyItem[] {
  const today = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const seed: VocabularyItem[] = [
    {
      id: 'v-1',
      english: "I appreciate your help",
      vietnamese: 'Cảm ơn bạn đã giúp',
      ipa: '/aɪ əˈpriːʃieɪt jɔːr help/',
      contextSentence: "I appreciate your help with the report.",
      easiness: 2.5,
      intervalDays: 1,
      repetitions: 0,
      nextReviewAt: today - day,
    },
    {
      id: 'v-2',
      english: 'Could you walk me through it?',
      vietnamese: 'Bạn giải thích lại được không?',
      ipa: '/kʊd juː wɔːk miː θruː ɪt/',
      easiness: 2.4,
      intervalDays: 2,
      repetitions: 1,
      nextReviewAt: today - 30 * 60 * 1000,
    },
    {
      id: 'v-3',
      english: "Let me get back to you",
      vietnamese: 'Để tôi phản hồi sau',
      ipa: '/lɛt miː ɡɛt bæk tə juː/',
      easiness: 2.6,
      intervalDays: 1,
      repetitions: 0,
      nextReviewAt: today,
    },
    {
      id: 'v-4',
      english: "I'm on the same page",
      vietnamese: 'Tôi cũng nghĩ vậy',
      ipa: '/aɪm ɒn ðə seɪm peɪdʒ/',
      easiness: 2.5,
      intervalDays: 4,
      repetitions: 2,
      nextReviewAt: today + 4 * day,
    },
  ];
  return seed;
}

const SAMPLE_AI_REPLIES = [
  'Sure! What size?',
  'For here or to go?',
  "Great. That'll be $4.50.",
  "Anything else for you today?",
];

function uid(): string {
  return Math.random().toString(36).slice(2, 11);
}

function delay<T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function pathMatch(
  pattern: string,
  path: string,
): Record<string, string> | null {
  const ps = pattern.split('/');
  const xs = path.split('/');
  if (ps.length !== xs.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i]!;
    const x = xs[i]!;
    if (p.startsWith(':')) {
      params[p.slice(1)] = decodeURIComponent(x);
    } else if (p !== x) {
      return null;
    }
  }
  return params;
}

type Req = {
  method: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
};

function recommendScenario(_state: MockState, level?: string): Scenario {
  const lvlOrder: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2'];
  const target = (level as CEFRLevel) ?? 'B1';
  const sorted = [...SCENARIOS].sort((a, b) => {
    const da = Math.abs(lvlOrder.indexOf(a.level) - lvlOrder.indexOf(target));
    const db = Math.abs(lvlOrder.indexOf(b.level) - lvlOrder.indexOf(target));
    return da - db;
  });
  return sorted[0]!;
}

function buildSessionReport(
  session: MockState['sessions'][number],
): SessionReport {
  const userTurns = session.turns.filter((t) => t.role === 'user');
  const fluencyScore =
    userTurns.length === 0
      ? 0
      : Math.round(
          userTurns.reduce((s, t) => s + (t.fluencyScore ?? 0), 0) /
            userTurns.length,
        );
  return {
    sessionId: session.id,
    durationSec: Math.max(
      1,
      Math.floor(
        ((session.endedAt ?? Date.now()) - session.startedAt) / 1000,
      ),
    ),
    wordsSpoken: userTurns.reduce(
      (s, t) => s + t.text.split(/\s+/).filter(Boolean).length,
      0,
    ),
    turnsCount: session.turns.length,
    fluencyScore,
    topPhrases: ["I'd like a latte", 'For here, please'],
    topMistakes: [],
    bestSentence: userTurns.at(-1)?.text,
    date: new Date(session.startedAt).toISOString().slice(0, 10),
  };
}

function aggregateDailyReport(state: MockState): DailyReport {
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = state.sessions.filter(
    (s) =>
      s.endedAt &&
      new Date(s.startedAt).toISOString().slice(0, 10) === today,
  );

  if (todaySessions.length === 0) {
    return state.dailyReports[today] ?? MOCK_DAILY_REPORT;
  }

  const totalSec = todaySessions.reduce(
    (sum, s) => sum + Math.floor(((s.endedAt ?? 0) - s.startedAt) / 1000),
    0,
  );
  const userTurns = todaySessions.flatMap((s) =>
    s.turns.filter((t) => t.role === 'user'),
  );
  const fluencyScore =
    userTurns.length === 0
      ? 70
      : Math.round(
          userTurns.reduce((s, t) => s + (t.fluencyScore ?? 70), 0) /
            userTurns.length,
        );

  const skills: SkillRadar = {
    pronunciation: clamp(fluencyScore - 5, 0, 100),
    grammar: clamp(fluencyScore - 8, 0, 100),
    vocabulary: clamp(fluencyScore + 3, 0, 100),
    fluency: fluencyScore,
    confidence: clamp(fluencyScore - 2, 0, 100),
  };

  return {
    date: today,
    totalMinutes: Math.max(1, Math.round(totalSec / 60)),
    sessionsCount: todaySessions.length,
    reviewedCardsCount: 0,
    fluencyScore,
    fluencyDelta: 4,
    newPhrases: ["I appreciate your help", "Could you walk me through it?"],
    recurringMistake:
      'Quên thêm "s" ở ngôi thứ 3 số ít (he/she/it) khi dùng thì hiện tại',
    bestSentence: userTurns.at(-1)?.text,
    weeklyTrend: [62, 65, 68, 72, 70, 75, fluencyScore],
    skills,
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export async function mockHandler<T>(path: string, req: Req): Promise<T> {
  const state = loadState();
  const cleanPath = path.split('?')[0]!.replace(/\/$/, '');
  const m = req.method.toUpperCase();

  // ── Scenarios ──────────────────────────────────────────
  if (m === 'GET' && cleanPath === '/v1/scenarios') {
    const cat = req.query?.category as ScenarioCategory | undefined;
    const lvl = req.query?.level as CEFRLevel | undefined;
    const all = [...SCENARIOS, ...state.generatedScenarios];
    const filtered = all.filter((s) => {
      if (cat && s.category !== cat) return false;
      if (lvl && s.level !== lvl) return false;
      return true;
    });
    return delay({ data: filtered, total: filtered.length }) as Promise<T>;
  }

  if (m === 'GET' && cleanPath === '/v1/scenarios/recommended') {
    const lvl = req.query?.level as string | undefined;
    return delay(recommendScenario(state, lvl)) as Promise<T>;
  }

  {
    const params = pathMatch('/v1/scenarios/:id', cleanPath);
    if (m === 'GET' && params) {
      const all = [...SCENARIOS, ...state.generatedScenarios];
      const found = all.find((s) => s.id === params.id);
      if (!found) throw apiErr(404, 'Scenario not found');
      return delay(found) as Promise<T>;
    }
  }

  if (m === 'POST' && cleanPath === '/v1/scenarios/generate') {
    const topic = (req.body as { topic?: string } | undefined)?.topic ?? 'Generated topic';
    const newScenario: Scenario = {
      id: `gen-${uid()}`,
      title: topic,
      titleVi: topic,
      category: 'social',
      level: 'B1',
      durationMin: 8,
      goal: 'AI-generated practice',
      iconEmoji: '✨',
      isGenerated: true,
      systemPrompt: '',
      keyPhrases: [],
    };
    state.generatedScenarios.push(newScenario);
    saveState(state);
    return delay(newScenario, 800) as Promise<T>;
  }

  // ── Conversations ──────────────────────────────────────
  if (m === 'POST' && cleanPath === '/v1/conversations/start') {
    const body = req.body as { scenarioId?: string };
    const sc = SCENARIOS.find((s) => s.id === body.scenarioId) ?? SCENARIOS[0]!;
    const session = {
      id: `s-${uid()}`,
      scenarioId: sc.id,
      startedAt: Date.now(),
      turns: [
        {
          id: uid(),
          role: 'ai' as const,
          text: greetingFor(sc),
          timestamp: Date.now(),
        },
      ],
    };
    state.sessions.push(session);
    saveState(state);
    return delay({
      sessionId: session.id,
      greeting: { text: session.turns[0]!.text },
    }) as Promise<T>;
  }

  if (m === 'POST' && cleanPath === '/v1/conversations/turn') {
    const body = req.body as { sessionId: string; userText: string };
    const session = state.sessions.find((s) => s.id === body.sessionId);
    if (!session) throw apiErr(404, 'Session not found');
    const userTurn: ConversationTurn = {
      id: uid(),
      role: 'user',
      text: body.userText,
      fluencyScore: 70 + Math.floor(Math.random() * 20),
      timestamp: Date.now(),
    };
    session.turns.push(userTurn);

    const aiText = SAMPLE_AI_REPLIES[
      session.turns.filter((t) => t.role === 'ai').length %
        SAMPLE_AI_REPLIES.length
    ]!;
    const aiTurn: ConversationTurn = {
      id: uid(),
      role: 'ai',
      text: aiText,
      timestamp: Date.now(),
    };
    session.turns.push(aiTurn);
    saveState(state);

    return delay({
      text: aiText,
      feedback: {
        grammarIssues: [],
        pronunciationScore: userTurn.fluencyScore,
        fluencyScore: userTurn.fluencyScore,
      },
    }) as Promise<T>;
  }

  if (m === 'POST' && cleanPath === '/v1/conversations/end') {
    const body = req.body as { sessionId: string };
    const session = state.sessions.find((s) => s.id === body.sessionId);
    if (!session) throw apiErr(404, 'Session not found');
    session.endedAt = Date.now();
    bumpStreak(state);
    saveState(state);
    return delay(buildSessionReport(session)) as Promise<T>;
  }

  if (m === 'GET' && cleanPath === '/v1/conversations/history') {
    const summaries = [...state.sessions]
      .reverse()
      .slice(0, 20)
      .map((s) => ({
        sessionId: s.id,
        scenarioId: s.scenarioId,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        turnsCount: s.turns.length,
      }));
    return delay({ data: summaries }) as Promise<T>;
  }

  // ── Reports ────────────────────────────────────────────
  if (m === 'GET' && cleanPath === '/v1/reports/streak') {
    return delay(state.streak) as Promise<T>;
  }

  if (m === 'GET' && cleanPath === '/v1/reports/daily') {
    return delay(aggregateDailyReport(state)) as Promise<T>;
  }

  if (m === 'GET' && cleanPath === '/v1/reports/weekly') {
    const daily = aggregateDailyReport(state);
    return delay({
      ...daily,
      weeklyTrend: daily.weeklyTrend,
    }) as Promise<T>;
  }

  if (m === 'GET' && cleanPath === '/v1/today/continue') {
    return delay(CONTINUE_LIST) as Promise<T>;
  }

  // ── Vocabulary ─────────────────────────────────────────
  if (m === 'GET' && cleanPath === '/v1/vocabulary') {
    const due = req.query?.due === true || req.query?.due === 'true';
    const now = Date.now();
    const items = due
      ? state.vocabulary.filter((v) => v.nextReviewAt <= now)
      : state.vocabulary;
    return delay({ data: items, total: items.length }) as Promise<T>;
  }

  if (m === 'POST' && cleanPath === '/v1/vocabulary') {
    const body = req.body as Partial<VocabularyItem>;
    const item: VocabularyItem = {
      id: `v-${uid()}`,
      english: body.english ?? '',
      vietnamese: body.vietnamese ?? '',
      ipa: body.ipa,
      contextSentence: body.contextSentence,
      easiness: 2.5,
      intervalDays: 1,
      repetitions: 0,
      nextReviewAt: Date.now(),
    };
    state.vocabulary.push(item);
    saveState(state);
    return delay(item) as Promise<T>;
  }

  {
    const params = pathMatch('/v1/vocabulary/:id/review', cleanPath);
    if (m === 'PUT' && params) {
      const body = req.body as { quality: number };
      const item = state.vocabulary.find((v) => v.id === params.id);
      if (!item) throw apiErr(404, 'Vocabulary not found');
      const updated = sm2Update(item, body.quality);
      Object.assign(item, updated);
      saveState(state);
      return delay(item) as Promise<T>;
    }
  }

  {
    const params = pathMatch('/v1/vocabulary/:id', cleanPath);
    if (m === 'DELETE' && params) {
      state.vocabulary = state.vocabulary.filter((v) => v.id !== params.id);
      saveState(state);
      return delay({ ok: true }) as Promise<T>;
    }
  }

  // ── Onboarding ─────────────────────────────────────────
  if (m === 'POST' && cleanPath === '/v1/onboarding/test') {
    const body = req.body as {
      answers: { questionId: string; selected: string; correct: boolean }[];
    };
    const correct = body.answers.filter((a) => a.correct).length;
    const lvl: CEFRLevel =
      correct <= 0
        ? 'A0'
        : correct === 1
          ? 'A1'
          : correct === 2
            ? 'A2'
            : correct >= 5
              ? 'B2'
              : 'B1';
    return delay({ level: lvl, score: correct }) as Promise<T>;
  }

  // ── Settings (mocked echo) ─────────────────────────────
  if (m === 'GET' && cleanPath === '/v1/settings') {
    return delay({}) as Promise<T>;
  }

  if (m === 'PUT' && cleanPath === '/v1/settings') {
    return delay(req.body) as Promise<T>;
  }

  throw apiErr(404, `Mock route not found: ${m} ${cleanPath}`);
}

function bumpStreak(state: MockState) {
  const today = new Date().toISOString().slice(0, 10);
  if (state.streak.lastActiveDate === today) return;
  state.streak.currentStreak += 1;
  state.streak.longestStreak = Math.max(
    state.streak.longestStreak,
    state.streak.currentStreak,
  );
  state.streak.lastActiveDate = today;
  // Mark today (end of week) as done
  state.streak.weekDays = state.streak.weekDays.map((_, i) =>
    i === state.streak.weekDays.length - 1
      ? true
      : state.streak.weekDays[i] ?? false,
  );
}

function greetingFor(scenario: Scenario): string {
  switch (scenario.id) {
    case 'sc-coffee':
      return 'Hi! Welcome to FluentMate. What would you like to order today?';
    case 'sc-meeting':
      return "Morning team — quick standup. What did you ship yesterday?";
    case 'sc-airport':
      return "Hi there. Are you checking in? May I see your passport?";
    default:
      return `Hi! Let's practice "${scenario.title}". Ready when you are.`;
  }
}

function apiErr(status: number, message: string): Error & { status: number } {
  const e = new Error(message) as Error & { status: number };
  e.status = status;
  return e;
}

/** Wipe mock state (call on user reset/sign-out). */
export function resetMockBackend() {
  storage.remove(MOCK_KEY);
}
