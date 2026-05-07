import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/services/storage';
import type { UserProfile } from '@/types';

const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};

/** Onboarding-specific extras the canonical UserProfile doesn't carry. */
export type UserProfileExtras = {
  goalMinutesPerDay?: number;
  coachId?: string;
};

export type StoredProfile = Partial<UserProfile> & UserProfileExtras;

type UserState = {
  profile: StoredProfile;
  onboardingCompleted: boolean;
  setProfile: (patch: StoredProfile) => void;
  completeOnboarding: () => void;
  reset: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: {},
      onboardingCompleted: false,
      setProfile: (patch) =>
        set((state) => ({ profile: { ...state.profile, ...patch } })),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      reset: () => set({ profile: {}, onboardingCompleted: false }),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
