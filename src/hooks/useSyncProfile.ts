import { useEffect, useRef } from 'react';
import { useOnboardingStore } from '@/store/onboardingStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useUserStore } from '@/store/useUserStore';
import { saveProfileToBackend } from '@/services/authService';

/**
 * Watches user-editable settings and pushes changes to public.users.
 * Debounced 600ms so rapid taps don't spam the network.
 *
 * Mounted once at the root layout; runs only after onboarding is finished.
 */
export function useSyncProfile() {
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);

  // Slices we care about — picked individually so unrelated changes don't trigger.
  const level = useUserStore((s) => s.profile.level);
  const email = useUserStore((s) => s.profile.email);
  const name = useUserStore((s) => s.profile.name);
  const interests = useOnboardingStore((s) => s.interests);
  const industry = useOnboardingStore((s) => s.industry);
  const reason = useOnboardingStore((s) => s.reason);
  const dailyMinutes = useOnboardingStore((s) => s.dailyMinutes);
  const reminderTime = useOnboardingStore((s) => s.reminderTime);
  const coachId = useOnboardingStore((s) => s.coachId);
  const voiceId = usePreferencesStore((s) => s.voiceId);
  const speed = usePreferencesStore((s) => s.speed);
  const notifications = usePreferencesStore((s) => s.notifications);
  const translationLanguage = usePreferencesStore((s) => s.translationLanguage);
  const appLanguage = usePreferencesStore((s) => s.appLanguage);

  const skipFirst = useRef(true);

  useEffect(() => {
    if (!onboardingCompleted) return;
    // Avoid syncing on initial mount (paywall already pushed).
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }

    const t = setTimeout(() => {
      const onboarding = useOnboardingStore.getState();
      void saveProfileToBackend({
        email,
        name,
        level,
        goal: onboarding.toGoalType(),
        industry: industry ?? '',
        interests,
        daily_goal_minutes: dailyMinutes,
        reminder_time: reminderTime,
        coach_personality: onboarding.toCoachPersonality(),
        voice_id: voiceId,
        speech_speed: speed,
        notification_prefs: notifications,
        translation_language: translationLanguage,
        app_language: appLanguage,
      });
    }, 600);

    return () => clearTimeout(t);
  }, [
    onboardingCompleted,
    level,
    email,
    name,
    interests,
    industry,
    reason,
    dailyMinutes,
    reminderTime,
    coachId,
    voiceId,
    speed,
    notifications,
    translationLanguage,
    appLanguage,
  ]);
}
