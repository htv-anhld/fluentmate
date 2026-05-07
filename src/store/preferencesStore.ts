import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/services/storage';
import type {
  AutoCorrectMode,
  ConversationDifficulty,
  ConversationSpeed,
  SubtitleMode,
} from '@/types';

const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};

export type NotificationPrefs = {
  reminders: boolean;
  weeklyReport: boolean;
  streakWarning: boolean;
  newScenarios: boolean;
};

export type AppLocale = 'vi' | 'en';

export type PreferencesState = {
  voiceId: string;
  speed: ConversationSpeed;
  showTranslation: boolean;
  difficulty: ConversationDifficulty;
  showSubtitle: SubtitleMode;
  autoCorrect: AutoCorrectMode;
  notifications: NotificationPrefs;
  /** Language to translate INTO when user taps the per-bubble translate button. */
  translationLanguage: AppLocale;
  /** Language for the app UI (i18n target). Reserved — strings not yet localized. */
  appLanguage: AppLocale;

  setVoice: (id: string) => void;
  setSpeed: (s: ConversationSpeed) => void;
  setShowTranslation: (v: boolean) => void;
  setDifficulty: (d: ConversationDifficulty) => void;
  setSubtitle: (m: SubtitleMode) => void;
  setAutoCorrect: (m: AutoCorrectMode) => void;
  setNotification: <K extends keyof NotificationPrefs>(
    key: K,
    value: NotificationPrefs[K],
  ) => void;
  setTranslationLanguage: (lang: AppLocale) => void;
  setAppLanguage: (lang: AppLocale) => void;
};

const initial = {
  voiceId: 'sarah',
  speed: 1.0 as ConversationSpeed,
  showTranslation: true,
  difficulty: 'match' as ConversationDifficulty,
  showSubtitle: 'always' as SubtitleMode,
  autoCorrect: 'end' as AutoCorrectMode,
  notifications: {
    reminders: true,
    weeklyReport: true,
    streakWarning: true,
    newScenarios: false,
  },
  translationLanguage: 'vi' as AppLocale,
  appLanguage: 'vi' as AppLocale,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...initial,
      setVoice: (voiceId) => set({ voiceId }),
      setSpeed: (speed) => set({ speed }),
      setShowTranslation: (showTranslation) => set({ showTranslation }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setSubtitle: (showSubtitle) => set({ showSubtitle }),
      setAutoCorrect: (autoCorrect) => set({ autoCorrect }),
      setNotification: (key, value) =>
        set((s) => ({ notifications: { ...s.notifications, [key]: value } })),
      setTranslationLanguage: (translationLanguage) =>
        set({ translationLanguage }),
      setAppLanguage: (appLanguage) => set({ appLanguage }),
    }),
    {
      name: 'preferences-store',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
