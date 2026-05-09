import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ProgressHeader } from '@/components/onboarding/ProgressHeader';
import { ScreenTitle } from '@/components/onboarding/ScreenTitle';
import { PrimaryCTA } from '@/components/onboarding/PrimaryCTA';
import { MascotCircle } from '@/components/onboarding/MascotCircle';
import { WelcomeOverlay } from '@/components/onboarding/WelcomeOverlay';
import { useUserStore } from '@/store/useUserStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { saveProfileToBackend } from '@/services/authService';
import { usePreferencesStore } from '@/store/preferencesStore';
import { queryClient } from '@/services/queryClient';
import { colors, radius, spacing, typography } from '@/constants/theme';

const FEATURE_KEYS = [
  'onboarding.paywallFeature1',
  'onboarding.paywallFeature2',
  'onboarding.paywallFeature3',
  'onboarding.paywallFeature4',
  'onboarding.paywallFeature5',
  'onboarding.paywallFeature6',
];

export default function PaywallScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [showWelcome, setShowWelcome] = useState(false);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const setUserProfile = useUserStore((s) => s.setProfile);
  const onboarding = useOnboardingStore.getState();

  const finalize = () => {
    setUserProfile({
      email: onboarding.email,
      level: onboarding.testLevel ?? 'A2',
      industry: onboarding.industry ?? '',
      interests: onboarding.interests,
      goalMinutesPerDay: onboarding.dailyMinutes,
      coachId: onboarding.coachId,
    });
    completeOnboarding();
    // Fire-and-forget — UI doesn't block on this; mock backend treats it as no-op.
    const prefs = usePreferencesStore.getState();
    saveProfileToBackend({
      email: onboarding.email,
      level: onboarding.testLevel ?? 'A2',
      goal: onboarding.toGoalType(),
      industry: onboarding.industry ?? '',
      interests: onboarding.interests,
      daily_goal_minutes: onboarding.dailyMinutes,
      reminder_time: onboarding.reminderTime,
      coach_personality: onboarding.toCoachPersonality(),
      voice_id: prefs.voiceId,
      speech_speed: prefs.speed,
      notification_prefs: prefs.notifications,
    }).catch(() => {});
  };

  const handleStart = () => {
    finalize();
    setShowWelcome(true);
  };

  const handleEnter = () => {
    setShowWelcome(false);
    // Drop any cache populated during onboarding under the anon JWT.
    queryClient.removeQueries();
    router.replace('/(tabs)/today');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ProgressHeader progress={1} showSkip={false} />
      <ScreenTitle
        title={t('onboarding.paywallTitle')}
        subtitle={t('onboarding.paywallSubtitle')}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.blue, colors.blueDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroLeft}>
            <Text style={styles.heroBrand}>FluentMate</Text>
            <Text style={styles.heroSub}>{t('onboarding.paywallTrialSub')}</Text>
          </View>
          <MascotCircle size={84} bg="rgba(255,255,255,0.18)" />
        </LinearGradient>

        <View style={styles.features}>
          {FEATURE_KEYS.map((k) => (
            <View key={k} style={styles.featureRow}>
              <View style={styles.featureCheck}>
                <Ionicons name="checkmark" size={14} color={colors.blueDark} />
              </View>
              <Text style={styles.featureText}>{t(k)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryCTA label={t('onboarding.paywallCta')} onPress={handleStart} />
      </View>

      <WelcomeOverlay
        visible={showWelcome}
        onClose={handleEnter}
        onStart={handleEnter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.card },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  hero: {
    borderRadius: radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: { flex: 1 },
  heroBrand: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.card,
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  heroSub: {
    ...typography.small,
    fontSize: 13,
    color: colors.card,
    marginTop: 14,
    opacity: 0.9,
  },
  features: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.sm,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    ...typography.body,
    fontSize: 14,
    color: colors.ink,
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
