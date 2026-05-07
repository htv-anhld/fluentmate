import { api } from './api';
import type { UserProfile } from '@/types';
import type { PreferencesState } from '@/store/preferencesStore';

export type SettingsPayload = Partial<UserProfile> &
  Partial<Omit<PreferencesState, keyof Record<string, never>>>;

export const settingsService = {
  get: () => api<SettingsPayload>('/v1/settings'),

  update: (patch: SettingsPayload) =>
    api<SettingsPayload>('/v1/settings', { method: 'PUT', body: patch }),
};
