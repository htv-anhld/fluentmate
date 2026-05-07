import type { CEFRLevel, ScenarioCategory } from '@/types';

export const queryKeys = {
  all: ['fluentmate'] as const,

  scenarios: {
    list: (filter?: { category?: ScenarioCategory; level?: CEFRLevel }) =>
      ['fluentmate', 'scenarios', 'list', filter ?? {}] as const,
    byId: (id: string) => ['fluentmate', 'scenarios', id] as const,
    recommended: (level?: CEFRLevel) =>
      ['fluentmate', 'scenarios', 'recommended', level ?? null] as const,
  },

  reports: {
    streak: () => ['fluentmate', 'reports', 'streak'] as const,
    daily: (date?: string) => ['fluentmate', 'reports', 'daily', date ?? 'today'] as const,
    weekly: (week?: string) => ['fluentmate', 'reports', 'weekly', week ?? 'now'] as const,
  },

  today: {
    continueList: () => ['fluentmate', 'today', 'continue'] as const,
  },

  conversations: {
    history: () => ['fluentmate', 'conversations', 'history'] as const,
  },

  vocabulary: {
    list: (params?: { due?: boolean }) =>
      ['fluentmate', 'vocabulary', 'list', params ?? {}] as const,
  },

  settings: () => ['fluentmate', 'settings'] as const,
} as const;
