import { View, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { ScreenTitle } from '@/components/onboarding/ScreenTitle';
import { OptionRow } from '@/components/onboarding/OptionRow';
import { IconBox } from '@/components/onboarding/IconBox';
import {
  useOnboardingStore,
  type GoalId,
} from '@/store/onboardingStore';
import { colors, spacing } from '@/constants/theme';

type GoalItem = {
  id: GoalId;
  iconNode: React.ReactNode;
  iconBg: string;
  titleKey: string;
  subKey: string;
  tag?: { labelKey: string; color: string };
};

const GOALS: GoalItem[] = [
  {
    id: 'g50',
    iconNode: <MaterialCommunityIcons name="sprout-outline" size={24} color="#3FBB58" />,
    iconBg: 'rgba(63,187,88,0.10)',
    titleKey: 'onboarding.goalG50Title',
    subKey: 'onboarding.goalG50Sub',
    tag: { labelKey: 'onboarding.goalG50Tag', color: colors.orange },
  },
  {
    id: 'g200',
    iconNode: <Ionicons name="leaf-outline" size={24} color="#1F8E3D" />,
    iconBg: 'rgba(31,142,61,0.10)',
    titleKey: 'onboarding.goalG200Title',
    subKey: 'onboarding.goalG200Sub',
  },
  {
    id: 'ielts',
    iconNode: <Ionicons name="scan-outline" size={24} color={colors.blueDark} />,
    iconBg: colors.blueLight,
    titleKey: 'onboarding.goalIeltsTitle',
    subKey: 'onboarding.goalIeltsSub',
  },
  {
    id: 'work',
    iconNode: <Ionicons name="rocket-outline" size={24} color={colors.orange} />,
    iconBg: colors.orangeSoft,
    titleKey: 'onboarding.goalWorkTitle',
    subKey: 'onboarding.goalWorkSub',
    tag: { labelKey: 'onboarding.goalWorkTag', color: colors.blue },
  },
];

export default function GoalScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const goal = useOnboardingStore((s) => s.goal);
  const setGoal = useOnboardingStore((s) => s.setGoal);

  return (
    <OnboardingScreen
      progress={0.75}
      ctaLabel={t('common.continue')}
      ctaDisabled={!goal}
      onCtaPress={() => router.push('/(auth)/onboarding/schedule')}
      onSkip={() => router.push('/(auth)/onboarding/schedule')}
    >
      <ScreenTitle
        title={t('onboarding.goalTitle')}
        subtitle={t('onboarding.goalSubtitle')}
      />
      <View style={styles.list}>
        {GOALS.map((g) => (
          <OptionRow
            key={g.id}
            selected={goal === g.id}
            onPress={() => setGoal(g.id)}
            title={t(g.titleKey)}
            description={t(g.subKey)}
            tag={
              g.tag
                ? {
                    label: t(g.tag.labelKey),
                    color: g.tag.color,
                    bg: `${g.tag.color}1A`,
                  }
                : undefined
            }
            leading={
              <IconBox bg={g.iconBg} size={44}>
                {g.iconNode}
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
