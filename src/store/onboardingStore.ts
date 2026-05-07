import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/services/storage';
import type {
  CEFRLevel,
  CoachPersonality,
  GoalType,
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

export type Reason = 'work' | 'travel' | 'exam' | 'social';
export type Industry =
  | 'tech'
  | 'office'
  | 'edu'
  | 'med'
  | 'fin'
  | 'sale'
  | 'travel'
  | 'mkt'
  | 'law'
  | 'manuf'
  | 'fnb'
  | 'student'
  | 'other';

export type GoalId = 'g50' | 'g200' | 'ielts' | 'work';

export type CoachId = 'onion' | 'luna' | 'max' | 'momo';

export type QuizAnswer = {
  questionId: string;
  selected: string;
  correct: boolean;
  difficulty: CEFRLevel;
};

export type OnboardingState = {
  language: 'vi' | 'en';
  reason: Reason | null;
  industry: Industry | null;
  interests: string[];
  quizAnswers: QuizAnswer[];
  testLevel: CEFRLevel | null;
  goal: GoalId | null;
  dailyMinutes: 5 | 10 | 15 | 20 | 30;
  reminderTime: string;
  coachId: CoachId;
  email: string;
  setLanguage: (l: OnboardingState['language']) => void;
  setReason: (r: Reason) => void;
  setIndustry: (i: Industry) => void;
  toggleInterest: (i: string) => void;
  recordQuizAnswer: (a: QuizAnswer) => void;
  setTestLevel: (l: CEFRLevel) => void;
  setGoal: (g: GoalId) => void;
  setDailyMinutes: (m: OnboardingState['dailyMinutes']) => void;
  setReminderTime: (t: string) => void;
  setCoach: (c: CoachId) => void;
  setEmail: (e: string) => void;
  reset: () => void;
  toGoalType: () => GoalType;
  toCoachPersonality: () => CoachPersonality;
};

const REASON_TO_GOAL: Record<Reason, GoalType> = {
  work: 'work',
  travel: 'travel',
  exam: 'exam',
  social: 'casual',
};

const COACH_TO_PERSONALITY: Record<CoachId, CoachPersonality> = {
  onion: 'mentor',
  luna: 'friend',
  max: 'strict',
  momo: 'funny',
};

const initialState = {
  language: 'vi' as const,
  reason: null,
  industry: null,
  interests: [] as string[],
  quizAnswers: [] as QuizAnswer[],
  testLevel: null,
  goal: null,
  dailyMinutes: 15 as const,
  reminderTime: '21:00',
  coachId: 'onion' as const,
  email: '',
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setLanguage: (language) => set({ language }),
      setReason: (reason) => set({ reason }),
      setIndustry: (industry) => set({ industry }),
      toggleInterest: (i) =>
        set((s) => {
          if (s.interests.includes(i)) {
            return { interests: s.interests.filter((x) => x !== i) };
          }
          if (s.interests.length >= 5) return s;
          return { interests: [...s.interests, i] };
        }),
      recordQuizAnswer: (a) =>
        set((s) => ({
          quizAnswers: [
            ...s.quizAnswers.filter((x) => x.questionId !== a.questionId),
            a,
          ],
        })),
      setTestLevel: (testLevel) => set({ testLevel }),
      setGoal: (goal) => set({ goal }),
      setDailyMinutes: (dailyMinutes) => set({ dailyMinutes }),
      setReminderTime: (reminderTime) => set({ reminderTime }),
      setCoach: (coachId) => set({ coachId }),
      setEmail: (email) => set({ email }),
      reset: () => set(initialState),
      toGoalType: () => {
        const r = get().reason;
        return r ? REASON_TO_GOAL[r] : 'casual';
      },
      toCoachPersonality: () => COACH_TO_PERSONALITY[get().coachId],
    }),
    {
      name: 'onboarding-store',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
