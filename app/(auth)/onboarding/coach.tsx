import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { ScreenTitle } from '@/components/onboarding/ScreenTitle';
import { OptionRow } from '@/components/onboarding/OptionRow';
import {
  useOnboardingStore,
  type CoachId,
} from '@/store/onboardingStore';
import { colors, spacing } from '@/constants/theme';

type Coach = {
  id: CoachId;
  nameKey: string;
  emoji: string;
  emojiBg: string;
  tag: { labelKey: string; color: string; bg: string };
  descKey: string;
};

const COACHES: Coach[] = [
  {
    id: 'onion',
    nameKey: 'onboarding.coachOnionName',
    emoji: '🧅',
    emojiBg: '#FFF3E6',
    tag: {
      labelKey: 'onboarding.coachOnionTag',
      color: colors.orange,
      bg: 'rgba(255,140,66,0.10)',
    },
    descKey: 'onboarding.coachOnionDesc',
  },
  {
    id: 'luna',
    nameKey: 'onboarding.coachLunaName',
    emoji: '🌙',
    emojiBg: '#EDE8F8',
    tag: {
      labelKey: 'onboarding.coachLunaTag',
      color: '#7C5CD3',
      bg: 'rgba(124,92,211,0.10)',
    },
    descKey: 'onboarding.coachLunaDesc',
  },
  {
    id: 'max',
    nameKey: 'onboarding.coachMaxName',
    emoji: '🎯',
    emojiBg: '#E5EEF3',
    tag: {
      labelKey: 'onboarding.coachMaxTag',
      color: '#1F5673',
      bg: 'rgba(31,86,115,0.10)',
    },
    descKey: 'onboarding.coachMaxDesc',
  },
  {
    id: 'momo',
    nameKey: 'onboarding.coachMomoName',
    emoji: '🐵',
    emojiBg: '#F5F0E8',
    tag: {
      labelKey: 'onboarding.coachMomoTag',
      color: '#2F8C5C',
      bg: 'rgba(47,140,92,0.10)',
    },
    descKey: 'onboarding.coachMomoDesc',
  },
];

function CoachAvatar({ emoji, bg }: { emoji: string; bg: string }) {
  return (
    <View style={[styles.avatar, { backgroundColor: bg }]}>
      <Text style={styles.avatarEmoji}>{emoji}</Text>
    </View>
  );
}

export default function CoachScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const coachId = useOnboardingStore((s) => s.coachId);
  const setCoach = useOnboardingStore((s) => s.setCoach);

  return (
    <OnboardingScreen
      progress={0.92}
      ctaLabel={t('common.continue')}
      onCtaPress={() => router.push('/(auth)/onboarding/signup')}
      onSkip={() => router.push('/(auth)/onboarding/signup')}
    >
      <ScreenTitle
        title={t('onboarding.coachTitle')}
        subtitle={t('onboarding.coachSubtitle')}
      />
      <View style={styles.list}>
        {COACHES.map((c) => (
          <OptionRow
            key={c.id}
            selected={coachId === c.id}
            onPress={() => setCoach(c.id)}
            title={t(c.nameKey)}
            description={t(c.descKey)}
            tag={{ label: t(c.tag.labelKey), color: c.tag.color, bg: c.tag.bg }}
            leading={<CoachAvatar emoji={c.emoji} bg={c.emojiBg} />}
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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 32, lineHeight: 36 },
});
