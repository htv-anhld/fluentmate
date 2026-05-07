import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { ScreenTitle } from '@/components/onboarding/ScreenTitle';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radius, spacing, typography } from '@/constants/theme';

const DURATIONS = [5, 10, 15, 20, 30] as const;
const TIMES = ['7:00', '8:00', '12:00', '18:00', '20:00', '21:00'];

export default function ScheduleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const dailyMinutes = useOnboardingStore((s) => s.dailyMinutes);
  const reminderTime = useOnboardingStore((s) => s.reminderTime);
  const setDailyMinutes = useOnboardingStore((s) => s.setDailyMinutes);
  const setReminderTime = useOnboardingStore((s) => s.setReminderTime);

  return (
    <OnboardingScreen
      progress={0.85}
      ctaLabel={t('common.continue')}
      onCtaPress={() => router.push('/(auth)/onboarding/coach')}
      onSkip={() => router.push('/(auth)/onboarding/coach')}
    >
      <ScreenTitle
        title={t('onboarding.scheduleTitle')}
        subtitle={t('onboarding.scheduleSubtitle')}
      />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {t('onboarding.scheduleSectionDuration')}
        </Text>
        <View style={styles.durationRow}>
          {DURATIONS.map((d) => {
            const sel = dailyMinutes === d;
            return (
              <Pressable
                key={d}
                onPress={() => setDailyMinutes(d)}
                style={[
                  styles.durationTile,
                  {
                    backgroundColor: sel ? colors.orangeSoft : colors.card,
                    borderColor: sel ? colors.orange : colors.line,
                    borderWidth: sel ? 1.5 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.durationNum,
                    { color: sel ? colors.orange : colors.ink },
                  ]}
                >
                  {d}
                </Text>
                <Text
                  style={[
                    styles.durationUnit,
                    { color: sel ? colors.orange : colors.ink2 },
                  ]}
                >
                  {t('common.minutes')}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {t('onboarding.scheduleSectionTime')}
        </Text>
        <View style={styles.timeGrid}>
          {TIMES.map((tm) => {
            const sel = reminderTime === tm;
            return (
              <Pressable
                key={tm}
                onPress={() => setReminderTime(tm)}
                style={[
                  styles.timeTile,
                  {
                    backgroundColor: sel ? colors.blueLight : colors.card,
                    borderColor: sel ? colors.blue : colors.line,
                    borderWidth: sel ? 1.5 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.timeText,
                    { color: sel ? colors.blueDark : colors.ink },
                  ]}
                >
                  {tm}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.tip}>
        <Ionicons name="bulb" size={18} color="#E0A800" />
        <Text style={styles.tipText}>{t('onboarding.scheduleTip')}</Text>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
  },
  sectionLabel: {
    ...typography.micro,
    color: colors.muted,
    marginBottom: 10,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationTile: {
    flex: 1,
    aspectRatio: 1 / 1.05,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationNum: {
    fontSize: 20,
    fontWeight: '700',
  },
  durationUnit: {
    ...typography.small,
    marginTop: 2,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeTile: {
    width: '31%',
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    ...typography.h3,
  },
  tip: {
    marginHorizontal: spacing.xxl,
    marginTop: spacing.xl,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.blueLight,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  tipText: {
    ...typography.small,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 18,
    flex: 1,
  },
});
