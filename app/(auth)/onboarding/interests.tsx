import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { ScreenTitle } from '@/components/onboarding/ScreenTitle';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radius, spacing, typography } from '@/constants/theme';

// Canonical (vi) labels stored in onboarding state. Display label is looked up
// via the same index in `onboarding.interestsList` for the active locale.
const CANONICAL = [
  'Phim ảnh', 'Âm nhạc', 'Thể thao', 'Du lịch', 'Ẩm thực', 'Công nghệ',
  'Đọc sách', 'Game', 'Thời trang', 'Tài chính', 'Sức khoẻ', 'Nhiếp ảnh',
  'Xe cộ', 'Thú cưng', 'Thiên nhiên', 'Kinh doanh', 'Nghệ thuật', 'Khoa học',
  'Lịch sử', 'Podcast',
];

export default function InterestsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const interests = useOnboardingStore((s) => s.interests);
  const toggle = useOnboardingStore((s) => s.toggleInterest);
  const count = interests.length;
  const canContinue = count >= 3;

  const localized = t('onboarding.interestsList', {
    returnObjects: true,
  }) as string[];

  return (
    <OnboardingScreen
      progress={0.45}
      ctaLabel={t('common.continue')}
      ctaDisabled={!canContinue}
      onCtaPress={() => router.push('/(auth)/onboarding/test')}
      onSkip={() => router.push('/(auth)/onboarding/test')}
    >
      <ScreenTitle
        title={t('onboarding.interestsTitle')}
        subtitle={t('onboarding.interestsSubtitle')}
      />

      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {t('onboarding.interestsCounter')}
          <Text
            style={[
              styles.counterNum,
              { color: canContinue ? colors.blueDark : colors.orange },
            ]}
          >
            {count}/5
          </Text>
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.cloud}
        showsVerticalScrollIndicator={false}
      >
        {CANONICAL.map((canonical, idx) => {
          const sel = interests.includes(canonical);
          const display = localized[idx] ?? canonical;
          return (
            <Pressable
              key={canonical}
              onPress={() => toggle(canonical)}
              style={[
                styles.chip,
                {
                  backgroundColor: sel ? colors.orangeSoft : colors.card,
                  borderColor: sel ? colors.orange : colors.line,
                  borderWidth: sel ? 1.5 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: sel ? colors.orange : colors.ink },
                  sel && { fontWeight: '600' },
                ]}
              >
                {display}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  counter: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  counterText: {
    ...typography.small,
    color: colors.muted,
  },
  counterNum: {
    ...typography.small,
    fontWeight: '700',
  },
  cloud: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  chipText: {
    ...typography.body,
  },
});
