import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { ScreenTitle } from '@/components/onboarding/ScreenTitle';
import { OptionRow } from '@/components/onboarding/OptionRow';
import { IconBox } from '@/components/onboarding/IconBox';
import {
  useOnboardingStore,
  type Reason,
} from '@/store/onboardingStore';
import { colors, spacing } from '@/constants/theme';

type ReasonItem = {
  id: Reason;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  titleKey: string;
  descKey: string;
};

const REASONS: ReasonItem[] = [
  {
    id: 'work',
    icon: 'briefcase',
    iconColor: '#8B5A3C',
    iconBg: '#F5EFE8',
    titleKey: 'onboarding.reasonWorkTitle',
    descKey: 'onboarding.reasonWorkDesc',
  },
  {
    id: 'travel',
    icon: 'airplane',
    iconColor: colors.blue,
    iconBg: colors.blueLight,
    titleKey: 'onboarding.reasonTravelTitle',
    descKey: 'onboarding.reasonTravelDesc',
  },
  {
    id: 'exam',
    icon: 'create',
    iconColor: '#E0A800',
    iconBg: '#FFF6DD',
    titleKey: 'onboarding.reasonExamTitle',
    descKey: 'onboarding.reasonExamDesc',
  },
  {
    id: 'social',
    icon: 'chatbubble',
    iconColor: '#7C5CD3',
    iconBg: 'rgba(124,92,211,0.10)',
    titleKey: 'onboarding.reasonSocialTitle',
    descKey: 'onboarding.reasonSocialDesc',
  },
];

export default function ReasonScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const reason = useOnboardingStore((s) => s.reason);
  const setReason = useOnboardingStore((s) => s.setReason);

  return (
    <OnboardingScreen
      progress={0.2}
      ctaLabel={t('common.continue')}
      ctaDisabled={!reason}
      onCtaPress={() => router.push('/(auth)/onboarding/industry')}
      onSkip={() => router.push('/(auth)/onboarding/industry')}
    >
      <ScreenTitle
        title={t('onboarding.reasonTitle')}
        subtitle={t('onboarding.reasonSubtitle')}
      />
      <View style={styles.list}>
        {REASONS.map((r) => (
          <OptionRow
            key={r.id}
            selected={reason === r.id}
            onPress={() => setReason(r.id)}
            title={t(r.titleKey)}
            description={t(r.descKey)}
            leading={
              <IconBox bg={r.iconBg}>
                <Ionicons name={r.icon} size={24} color={r.iconColor} />
              </IconBox>
            }
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: 10,
  },
});
