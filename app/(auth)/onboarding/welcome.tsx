import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PrimaryCTA } from '@/components/onboarding/PrimaryCTA';
import { MascotCircle } from '@/components/onboarding/MascotCircle';
import { PRIVACY_URL, TERMS_URL } from '@/constants/legal';
import { colors, radius, spacing, typography } from '@/constants/theme';

const FEATURES: { emoji: string; key: string }[] = [
  { emoji: '🤖', key: 'onboarding.welcomeFeature1' },
  { emoji: '🎯', key: 'onboarding.welcomeFeature2' },
  { emoji: '📊', key: 'onboarding.welcomeFeature3' },
  { emoji: '🇻🇳', key: 'onboarding.welcomeFeature4' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={[colors.bg, colors.blueLight]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <MascotCircle size={120} bg={colors.card} />
            <Text style={styles.brand}>FluentMate</Text>
            <Text style={styles.tagline}>{t('onboarding.welcomeTagline')}</Text>
          </View>

          <View style={styles.features}>
            {FEATURES.map((f) => (
              <View key={f.key} style={styles.feature}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
                <Text style={styles.featureText}>{t(f.key)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <PrimaryCTA
              label={t('common.startCta')}
              onPress={() => router.push('/(auth)/onboarding/language')}
            />
            <Pressable
              onPress={() => router.push('/(auth)/login')}
              hitSlop={6}
              style={styles.signInBtn}
            >
              <Text style={styles.signInText}>
                {t('login.alreadyHaveAccount')}{' '}
                <Text style={styles.signInLink}>{t('login.signIn')}</Text>
              </Text>
            </Pressable>
            <Text style={styles.legal}>
              {t('onboarding.welcomeLegalPrefix')}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL(TERMS_URL).catch(() => {})}
              >
                {t('onboarding.legalTerms')}
              </Text>
              {t('onboarding.welcomeLegalAnd')}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL(PRIVACY_URL).catch(() => {})}
              >
                {t('onboarding.legalPrivacy')}
              </Text>
              {t('onboarding.welcomeLegalSuffix')}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
    gap: spacing.md,
  },
  brand: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.ink,
    fontStyle: 'italic',
    letterSpacing: -1,
    marginTop: spacing.md,
  },
  tagline: {
    ...typography.body,
    fontSize: 16,
    color: colors.ink2,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  features: {
    gap: spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  featureEmoji: { fontSize: 24 },
  featureText: {
    ...typography.body,
    fontWeight: '500',
    flex: 1,
    color: colors.ink,
  },
  footer: { gap: spacing.md },
  legal: {
    ...typography.small,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: colors.blueDark,
    textDecorationLine: 'underline',
  },
  signInBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  signInText: {
    ...typography.body,
    color: colors.ink2,
    fontSize: 14,
  },
  signInLink: {
    color: colors.blueDark,
    fontWeight: '700',
  },
});
