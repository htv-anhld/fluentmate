import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ProgressHeader } from '@/components/onboarding/ProgressHeader';
import { ScreenTitle } from '@/components/onboarding/ScreenTitle';
import { PrimaryCTA } from '@/components/onboarding/PrimaryCTA';
import { useUserStore } from '@/store/useUserStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { upgradeAccount, ensureSession } from '@/services/authService';
import { PRIVACY_URL, TERMS_URL } from '@/constants/legal';
import { colors, radius, spacing, typography } from '@/constants/theme';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const GOAL_LABEL_KEY: Record<string, string> = {
  g50: 'onboarding.goalLabelG50',
  g200: 'onboarding.goalLabelG200',
  ielts: 'onboarding.goalLabelIelts',
  work: 'onboarding.goalLabelWork',
};

const COACH_LABEL_KEY: Record<string, string> = {
  onion: 'settings.coachOnionName',
  luna: 'settings.coachLunaName',
  max: 'settings.coachMaxName',
  momo: 'settings.coachMomoName',
};

export default function SignupScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const onboarding = useOnboardingStore();
  const setEmailStore = useOnboardingStore((s) => s.setEmail);

  const [name, setName] = useState(profile.name ?? '');
  const [email, setEmail] = useState(onboarding.email);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emailValid = EMAIL_RE.test(email);
  const nameValid = name.trim().length > 0;
  const passwordValid = password.length >= 8;
  const canContinue = nameValid && emailValid && passwordValid && !submitting;

  const handleContinue = async () => {
    if (!canContinue) return;
    setSubmitting(true);
    try {
      // Make sure we have a session to upgrade (handles the case where the user
      // came back through "Use a different account" which signed them out).
      await ensureSession();
      // Upgrade the auto-generated dev account to a real one with the user's
      // chosen email + password. This makes /login work on this and other devices.
      await upgradeAccount(email.trim(), password);
      setEmailStore(email.trim());
      setProfile({ name: name.trim(), email: email.trim() });
      router.push('/(auth)/onboarding/paywall');
    } catch (err) {
      Alert.alert(
        t('onboarding.signupErrorTitle'),
        err instanceof Error ? err.message : t('onboarding.signupErrorBody'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ProgressHeader progress={0.96} showSkip={false} />
        <ScreenTitle
          title={t('onboarding.signupTitle')}
          subtitle={t('onboarding.signupSubtitle')}
        />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text style={styles.label}>{t('onboarding.signupNameLabel')}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t('onboarding.signupNamePlaceholder')}
              placeholderTextColor={colors.muted}
              style={styles.input}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View>
            <Text style={styles.label}>{t('onboarding.signupEmailLabel')}</Text>
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: emailValid ? colors.blueLight : colors.card,
                  borderColor: emailValid ? colors.blue : colors.line,
                },
              ]}
            >
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t('onboarding.signupEmailPlaceholder')}
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.inputInline}
              />
              {emailValid ? (
                <Ionicons name="checkmark" size={20} color={colors.blue} />
              ) : null}
            </View>
          </View>

          <View>
            <Text style={styles.label}>{t('onboarding.signupPasswordLabel')}</Text>
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: passwordValid ? colors.blueLight : colors.card,
                  borderColor: passwordValid ? colors.blue : colors.line,
                },
              ]}
            >
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t('onboarding.signupPasswordPlaceholder')}
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.inputInline}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.muted}
                />
              </Pressable>
            </View>
            <Text style={styles.passwordHelper}>
              {t('onboarding.signupPasswordHint')}
            </Text>
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>
              {t('onboarding.signupSummaryTitle')}
            </Text>
            <SummaryRow
              label={t('onboarding.signupSummaryGoal')}
              value={
                onboarding.goal && GOAL_LABEL_KEY[onboarding.goal]
                  ? t(GOAL_LABEL_KEY[onboarding.goal]!)
                  : '—'
              }
            />
            <SummaryRow
              label={t('onboarding.signupSummaryLevel')}
              value={onboarding.testLevel ?? 'A2'}
            />
            <SummaryRow
              label={t('onboarding.signupSummaryDaily')}
              value={t('onboarding.signupSummaryDailyValue', {
                min: onboarding.dailyMinutes,
                time: onboarding.reminderTime,
              })}
            />
            <SummaryRow
              label={t('onboarding.signupSummaryCoach')}
              value={
                COACH_LABEL_KEY[onboarding.coachId]
                  ? t(COACH_LABEL_KEY[onboarding.coachId]!)
                  : t('settings.coachOnionName')
              }
            />
            <SummaryRow
              label={t('onboarding.signupSummaryInterests')}
              value={
                onboarding.interests.length > 0
                  ? onboarding.interests.slice(0, 3).join(', ') +
                    (onboarding.interests.length > 3 ? '…' : '')
                  : '—'
              }
            />
          </View>

          <Text style={styles.terms}>
            {t('onboarding.signupTermsPrefix')}
            <Text
              style={styles.termsLink}
              onPress={() => Linking.openURL(TERMS_URL).catch(() => {})}
            >
              {t('onboarding.legalTerms')}
            </Text>
            {t('onboarding.signupTermsAnd')}
            <Text
              style={styles.termsLink}
              onPress={() => Linking.openURL(PRIVACY_URL).catch(() => {})}
            >
              {t('onboarding.legalPrivacy')}
            </Text>
          </Text>
        </ScrollView>

        <View style={styles.ctaWrap}>
          <PrimaryCTA
            label={t('onboarding.signupCta')}
            onPress={handleContinue}
            disabled={!canContinue}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.sumRow}>
      <Text style={styles.sumLabel}>{label}</Text>
      <Text style={styles.sumValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.card },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  label: {
    ...typography.micro,
    color: colors.muted,
    marginBottom: 6,
  },
  input: {
    height: 52,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    ...typography.body,
    fontSize: 15,
    color: colors.ink,
  },
  inputWrap: {
    height: 52,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputInline: {
    flex: 1,
    ...typography.body,
    fontSize: 15,
    color: colors.ink,
  },
  summary: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  summaryTitle: {
    ...typography.micro,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.line,
  },
  sumLabel: { ...typography.small, color: colors.muted },
  sumValue: {
    ...typography.small,
    fontWeight: '600',
    color: colors.ink,
    maxWidth: 200,
  },
  terms: {
    ...typography.small,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: colors.ink2,
    textDecorationLine: 'underline',
  },
  passwordHelper: {
    ...typography.small,
    fontSize: 12,
    color: colors.muted,
    paddingHorizontal: 4,
    marginTop: 6,
  },
  ctaWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});
