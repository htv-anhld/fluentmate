import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SettingsScaffold } from '@/components/settings/SettingsScaffold';
import { SectionLabel } from '@/components/settings/SectionLabel';
import { useUserStore } from '@/store/useUserStore';
import {
  ensureSession,
  upgradeAccount,
  getStoredEmail,
} from '@/services/authService';
import { supabase } from '@/services/supabase';
import { colors, radius, spacing, typography } from '@/constants/theme';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function PasswordSettings() {
  const router = useRouter();
  const { t } = useTranslation();
  const profileEmail = useUserStore((s) => s.profile.email);

  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [email, setEmail] = useState(profileEmail ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load the email currently registered with auth (often dev-xxx@... for legacy
  // accounts) so the user can see what they're upgrading from.
  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getUser();
      setAuthEmail(data.user?.email ?? null);
    })();
  }, []);

  const emailValid = EMAIL_RE.test(email);
  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword;
  const canSave =
    emailValid && passwordValid && passwordsMatch && !submitting;

  const isLegacy = !!(authEmail && authEmail.startsWith('dev-'));
  const storedEmail = getStoredEmail();

  const handleSave = async () => {
    if (!canSave) return;
    setSubmitting(true);
    try {
      await ensureSession();
      await upgradeAccount(email.trim(), password);
      Alert.alert(t('passwordScreen.successTitle'), t('passwordScreen.successBody'));
      router.back();
    } catch (err) {
      Alert.alert(
        t('passwordScreen.errorTitle'),
        err instanceof Error ? err.message : t('passwordScreen.errorBody'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SettingsScaffold
      title={t('passwordScreen.title')}
      subtitle={
        isLegacy
          ? t('passwordScreen.subtitleLegacy')
          : t('passwordScreen.subtitle')
      }
      rightAction={{
        label: t('common.save'),
        onPress: handleSave,
        disabled: !canSave,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {isLegacy ? (
          <View style={styles.notice}>
            <Ionicons name="information-circle" size={20} color={colors.orange} />
            <Text style={styles.noticeText}>
              {t('passwordScreen.legacyNotice')}
            </Text>
          </View>
        ) : null}

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>
            {t('passwordScreen.currentAuthEmail')}
          </Text>
          <Text style={styles.statusValue} numberOfLines={1}>
            {authEmail ?? '—'}
          </Text>
          {storedEmail ? (
            <>
              <Text style={[styles.statusLabel, { marginTop: 10 }]}>
                {t('passwordScreen.storedEmail')}
              </Text>
              <Text style={styles.statusValue} numberOfLines={1}>
                {storedEmail}
              </Text>
            </>
          ) : null}
        </View>

        <SectionLabel>{t('passwordScreen.emailLabel')}</SectionLabel>
        <View style={styles.field}>
          <Ionicons name="mail-outline" size={18} color={colors.muted} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        </View>
        {!emailValid && email.length > 0 ? (
          <Text style={styles.error}>
            {t('passwordScreen.errorEmailInvalid')}
          </Text>
        ) : null}

        <SectionLabel>{t('passwordScreen.newPasswordLabel')}</SectionLabel>
        <View style={styles.field}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t('passwordScreen.newPasswordPlaceholder')}
            placeholderTextColor={colors.muted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.muted}
            />
          </Pressable>
        </View>
        {password.length > 0 && !passwordValid ? (
          <Text style={styles.error}>
            {t('passwordScreen.errorPasswordShort')}
          </Text>
        ) : null}

        <SectionLabel>{t('passwordScreen.confirmPasswordLabel')}</SectionLabel>
        <View style={styles.field}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('passwordScreen.confirmPasswordPlaceholder')}
            placeholderTextColor={colors.muted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        </View>
        {confirmPassword.length > 0 && !passwordsMatch ? (
          <Text style={styles.error}>
            {t('passwordScreen.errorPasswordMismatch')}
          </Text>
        ) : null}

        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          style={({ pressed }) => [
            styles.cta,
            pressed && canSave && { opacity: 0.85 },
            !canSave && { backgroundColor: colors.line },
          ]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text
              style={[
                styles.ctaText,
                !canSave && { color: colors.muted },
              ]}
            >
              {t('passwordScreen.saveCta')}
            </Text>
          )}
        </Pressable>

        <Text style={styles.helper}>{t('passwordScreen.helper')}</Text>
      </KeyboardAvoidingView>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.orangeSoft,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noticeText: {
    ...typography.small,
    color: colors.ink,
    flex: 1,
    lineHeight: 18,
  },
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statusLabel: {
    ...typography.micro,
    color: colors.muted,
    marginBottom: 4,
  },
  statusValue: {
    ...typography.body,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
    fontSize: 15,
    color: colors.ink,
  },
  error: {
    ...typography.small,
    color: colors.red,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: 4,
  },
  cta: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  ctaText: { ...typography.h2, color: colors.card },
  helper: {
    ...typography.small,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    lineHeight: 18,
  },
});
