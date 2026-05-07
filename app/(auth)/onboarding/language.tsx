import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { ScreenTitle } from '@/components/onboarding/ScreenTitle';
import { MascotCircle } from '@/components/onboarding/MascotCircle';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radius, spacing, typography } from '@/constants/theme';

const LANGS = [
  { id: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
  { id: 'en', flag: '🇺🇸', label: 'English' },
] as const;

export default function LanguageScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const language = useOnboardingStore((s) => s.language);
  const setLanguage = useOnboardingStore((s) => s.setLanguage);

  return (
    <OnboardingScreen
      progress={0.1}
      showSkip={false}
      ctaLabel={t('common.startCta')}
      onCtaPress={() => router.push('/(auth)/onboarding/reason')}
      onBack={() => router.back()}
    >
      <ScreenTitle
        title={t('onboarding.languageTitle')}
        subtitle={t('onboarding.languageSubtitle')}
      />

      <View style={styles.mascotWrap}>
        <MascotCircle />
      </View>

      <View style={styles.list}>
        {LANGS.map((l) => {
          const sel = language === l.id;
          return (
            <Pressable
              key={l.id}
              onPress={() => setLanguage(l.id)}
              style={[
                styles.row,
                {
                  backgroundColor: sel ? colors.blueLight : colors.card,
                  borderColor: sel ? colors.blue : colors.line,
                  borderWidth: sel ? 1.5 : 1,
                },
              ]}
            >
              <Text style={styles.flag}>{l.flag}</Text>
              <Text style={styles.label}>{l.label}</Text>
              {sel ? (
                <Ionicons name="checkmark" size={22} color={colors.blueDark} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  mascotWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: 10,
  },
  row: {
    height: 60,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flag: { fontSize: 28 },
  label: {
    flex: 1,
    ...typography.h2,
    color: colors.ink,
  },
});
