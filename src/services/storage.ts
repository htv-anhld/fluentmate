import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'fluentmate' });

export const StorageKeys = {
  AuthToken: 'auth.token',
  OnboardingCompleted: 'onboarding.completed',
  UserProfile: 'user.profile',
} as const;
