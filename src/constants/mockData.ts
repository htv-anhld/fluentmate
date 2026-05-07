import type { DailyReport, SkillRadar } from '@/types';

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  weekDays: boolean[];
};

export const MOCK_STREAK: StreakData = {
  currentStreak: 7,
  longestStreak: 14,
  weekDays: [true, true, true, true, true, true, true],
};

export const MOCK_TODAY_STATS = {
  minutesToday: 12,
  goalMinutes: 15,
  wordsLearned: 6,
  fluencyScore: 78,
};

export const MOCK_SKILL_RADAR: SkillRadar = {
  pronunciation: 72,
  grammar: 68,
  vocabulary: 81,
  fluency: 78,
  confidence: 70,
};

export const MOCK_DAILY_REPORT: DailyReport = {
  date: new Date().toISOString().slice(0, 10),
  totalMinutes: 12,
  sessionsCount: 2,
  reviewedCardsCount: 0,
  fluencyScore: 78,
  fluencyDelta: 4,
  newPhrases: [
    'I appreciate your help',
    'Could you walk me through it?',
    "Let me get back to you",
  ],
  recurringMistake:
    'Quên thêm "s" ở ngôi thứ 3 số ít (he/she/it) khi dùng thì hiện tại',
  bestSentence: "I'm happy to take this on if it helps the team move forward",
  weeklyTrend: [62, 65, 68, 72, 70, 75, 78],
  skills: MOCK_SKILL_RADAR,
};

export const QUICK_ACTIONS = [
  { id: 'talk', labelKey: 'today.quickTalk', icon: 'mic' as const, route: '/(tabs)/talk' },
  { id: 'review', labelKey: 'today.quickReview', icon: 'flash' as const, route: '/review' },
  { id: 'learn', labelKey: 'today.quickLearn', icon: 'compass' as const, route: '/(tabs)/learn' },
];

export const CONTINUE_LIST = [
  {
    id: 'gr-1',
    type: 'grammar' as const,
    title: 'Present Perfect',
    subtitle: 'Bài 3/8 · Còn 2 phút',
    progress: 0.4,
    icon: '📘',
    iconBg: 'rgba(155,125,255,0.10)',
    route: '/grammar/gr-1',
  },
  {
    id: 'sc-coffee',
    type: 'scenario' as const,
    title: 'Order coffee at a café',
    subtitle: 'Đã học 2 lần · Score 82',
    progress: 0.8,
    icon: '☕',
    iconBg: 'rgba(255,140,66,0.10)',
    route: '/conversation/sc-coffee',
  },
  {
    id: 'review',
    type: 'review' as const,
    title: '12 từ cần ôn',
    subtitle: 'Đến hạn hôm nay',
    progress: 0.0,
    icon: '🧠',
    iconBg: 'rgba(74,159,255,0.10)',
    route: '/review',
  },
];
