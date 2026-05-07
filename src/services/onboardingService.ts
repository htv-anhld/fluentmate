import { api } from './api';
import type { CEFRLevel } from '@/types';

export type TestAnswer = {
  questionId: string;
  selected: string;
  correct: boolean;
};

export type TestResult = {
  level: CEFRLevel;
  score: number;
};

export const onboardingService = {
  submitTest: (answers: TestAnswer[]) =>
    api<TestResult>('/v1/onboarding/test', {
      method: 'POST',
      body: { answers },
    }),

  saveProfile: (profile: Record<string, unknown>) =>
    api<{ ok: true }>('/v1/onboarding/profile', {
      method: 'POST',
      body: profile,
    }),
};
