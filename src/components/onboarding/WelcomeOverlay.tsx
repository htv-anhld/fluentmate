import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MascotCircle } from './MascotCircle';
import { PrimaryCTA } from './PrimaryCTA';
import { useUserStore } from '@/store/useUserStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radius, spacing, typography } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onStart: () => void;
};

const COACH_NAME_KEY: Record<string, string> = {
  onion: 'onboarding.coachOnionName',
  luna: 'onboarding.coachLunaName',
  max: 'onboarding.coachMaxName',
  momo: 'onboarding.coachMomoName',
};

const GOAL_LABEL_KEY: Record<string, string> = {
  g50: 'onboarding.goalLabelG50',
  g200: 'onboarding.goalLabelG200',
  ielts: 'onboarding.goalLabelIelts',
  work: 'onboarding.goalLabelWork',
};

const INDUSTRY_KEY: Record<string, string> = {
  tech: 'onboarding.industryTech',
  office: 'onboarding.industryOffice',
  edu: 'onboarding.industryEdu',
  med: 'onboarding.industryMed',
  fin: 'onboarding.industryFin',
  sale: 'onboarding.industrySale',
  travel: 'onboarding.industryTravel',
  mkt: 'onboarding.industryMkt',
  manuf: 'onboarding.industryManuf',
  student: 'onboarding.industryStudent',
  fnb: 'onboarding.industryFnb',
  other: 'onboarding.industryOther',
};

export function WelcomeOverlay({ visible, onClose, onStart }: Props) {
  const { t } = useTranslation();
  const onboarding = useOnboardingStore();
  const userProfile = useUserStore((s) => s.profile);

  const summary: { label: string; value: string }[] = [
    {
      label: t('onboarding.welcomeOverlayLevel'),
      value: onboarding.testLevel ?? userProfile.level ?? '—',
    },
    {
      label: t('onboarding.welcomeOverlayGoal'),
      value:
        onboarding.goal && GOAL_LABEL_KEY[onboarding.goal]
          ? t(GOAL_LABEL_KEY[onboarding.goal]!)
          : '—',
    },
    {
      label: t('onboarding.welcomeOverlayIndustry'),
      value:
        onboarding.industry && INDUSTRY_KEY[onboarding.industry]
          ? t(INDUSTRY_KEY[onboarding.industry]!)
          : '—',
    },
    {
      label: t('onboarding.welcomeOverlayCoach'),
      value: COACH_NAME_KEY[onboarding.coachId]
        ? t(COACH_NAME_KEY[onboarding.coachId]!)
        : t('onboarding.coachOnionName'),
    },
    {
      label: t('onboarding.welcomeOverlayDuration'),
      value: t('onboarding.welcomeOverlayDurationValue', {
        min: onboarding.dailyMinutes,
      }),
    },
    {
      label: t('onboarding.welcomeOverlayReminder'),
      value: onboarding.reminderTime,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.mascot}>
            <MascotCircle size={80} />
          </View>

          <Text style={styles.title}>
            {t('onboarding.welcomeOverlayTitle')}
            {'\n'}
            <Text style={styles.brand}>FluentMate!</Text>
          </Text>
          <Text style={styles.sub}>{t('onboarding.welcomeOverlaySub')}</Text>

          <View style={styles.grid}>
            {summary.map((s) => (
              <View key={s.label} style={styles.cell}>
                <Text style={styles.cellLabel}>{s.label}</Text>
                <Text style={styles.cellValue} numberOfLines={1}>
                  {s.value}
                </Text>
              </View>
            ))}
          </View>

          <PrimaryCTA
            label={t('onboarding.welcomeOverlayCta')}
            onPress={onStart}
          />

          <Pressable onPress={onClose} hitSlop={8} style={styles.closeArea}>
            <Text style={styles.closeText}>{t('common.close')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 50,
    elevation: 20,
  },
  mascot: { alignItems: 'center', marginBottom: 14 },
  title: {
    ...typography.h1,
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 26,
  },
  brand: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.blueDark,
    letterSpacing: -0.5,
    fontStyle: 'italic',
  },
  sub: {
    ...typography.small,
    color: colors.ink2,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  cell: {
    width: '48%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: '#fcfcfe',
    borderWidth: 1,
    borderColor: colors.line,
  },
  cellLabel: {
    ...typography.caption,
    color: colors.muted,
    fontWeight: '500',
    marginBottom: 4,
  },
  cellValue: {
    ...typography.h3,
    color: colors.ink,
    lineHeight: 18,
  },
  closeArea: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  closeText: {
    ...typography.small,
    color: colors.muted,
  },
});
