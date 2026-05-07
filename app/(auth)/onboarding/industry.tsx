import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { ScreenTitle } from '@/components/onboarding/ScreenTitle';
import { useOnboardingStore, type Industry } from '@/store/onboardingStore';
import { colors, radius, spacing, typography } from '@/constants/theme';

// Compute exact tile width so 3 columns + 2 gaps fit precisely.
// Avoids the percentage-rounding issue that wraps to 2 columns.
const COLUMNS = 3;
const GRID_PADDING = spacing.xxl; // matches grid.paddingHorizontal
const TILE_GAP = spacing.md; // matches grid.gap
const TILE_WIDTH = (Dimensions.get('window').width - GRID_PADDING * 2 - TILE_GAP * (COLUMNS - 1)) / COLUMNS;

const INDUSTRIES: {
  id: Industry;
  icon: keyof typeof Ionicons.glyphMap;
  key: string;
}[] = [
  { id: 'tech', icon: 'laptop-outline', key: 'onboarding.industryTech' },
  { id: 'office', icon: 'business-outline', key: 'onboarding.industryOffice' },
  { id: 'edu', icon: 'school-outline', key: 'onboarding.industryEdu' },
  { id: 'med', icon: 'medkit-outline', key: 'onboarding.industryMed' },
  { id: 'fin', icon: 'wallet-outline', key: 'onboarding.industryFin' },
  { id: 'sale', icon: 'pricetag-outline', key: 'onboarding.industrySale' },
  { id: 'travel', icon: 'airplane-outline', key: 'onboarding.industryTravel' },
  { id: 'mkt', icon: 'color-palette-outline', key: 'onboarding.industryMkt' },
  { id: 'manuf', icon: 'construct-outline', key: 'onboarding.industryManuf' },
  { id: 'student', icon: 'book-outline', key: 'onboarding.industryStudent' },
  { id: 'fnb', icon: 'restaurant-outline', key: 'onboarding.industryFnb' },
  { id: 'other', icon: 'cube-outline', key: 'onboarding.industryOther' },
];

export default function IndustryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const industry = useOnboardingStore((s) => s.industry);
  const setIndustry = useOnboardingStore((s) => s.setIndustry);

  return (
    <OnboardingScreen
      progress={0.3}
      ctaLabel={t('common.continue')}
      ctaDisabled={!industry}
      onCtaPress={() => router.push('/(auth)/onboarding/interests')}
      onSkip={() => router.push('/(auth)/onboarding/interests')}
    >
      <ScreenTitle title={t('onboarding.industryTitle')} subtitle={t('onboarding.industrySubtitle')} />
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {INDUSTRIES.map((j) => {
          const sel = industry === j.id;
          return (
            <Pressable
              key={j.id}
              onPress={() => setIndustry(j.id)}
              style={[
                styles.tile,
                {
                  backgroundColor: sel ? colors.orangeSoft : colors.card,
                  borderColor: sel ? colors.orange : colors.line,
                },
              ]}
            >
              <Ionicons name={j.icon} size={28} color={sel ? colors.orange : colors.ink2} />
              <Text style={[styles.label, { color: sel ? colors.orange : colors.ink }]} numberOfLines={1}>
                {t(j.key)}
              </Text>
            </Pressable>
          );
        })}
        <View style={styles.endSpacer} />
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingTop: 0,
    paddingHorizontal: spacing.xxl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  tile: {
    // Exact pixel width so 3 columns + 2 gaps always fit (percentage-rounding
    // can push the 3rd tile onto a new line on some screen widths).
    width: TILE_WIDTH,
    aspectRatio: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    // Asymmetric vertical padding: tighter on top, more room below the
    // label to compensate for descenders + visual weight of the icon above.
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: 8,
    // Constant border width prevents the tile from resizing when selected.
    borderWidth: 1.5,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 11,
  },
  endSpacer: { height: spacing.lg, width: '100%' },
});
