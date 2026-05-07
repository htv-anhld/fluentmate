import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/useUserStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { getStoredEmail } from '@/services/authService';

export default function Index() {
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);
  const onboardingEmail = useOnboardingStore((s) => s.email);
  const storedEmail = getStoredEmail();

  if (onboardingCompleted) {
    return <Redirect href="/(tabs)/today" />;
  }

  // Returning user — has signed up before but session was reset.
  // Send them to login so they don't have to redo onboarding.
  if (storedEmail || onboardingEmail) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(auth)/onboarding/welcome" />;
}
