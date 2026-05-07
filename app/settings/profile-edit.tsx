import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SettingsScaffold } from '@/components/settings/SettingsScaffold';
import { SectionLabel } from '@/components/settings/SectionLabel';
import { useUserStore } from '@/store/useUserStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radius, spacing, typography } from '@/constants/theme';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function ProfileEdit() {
  const router = useRouter();
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const setEmailStore = useOnboardingStore((s) => s.setEmail);

  const [name, setName] = useState(profile.name ?? '');
  const [email, setEmail] = useState(profile.email ?? '');

  const emailValid = email.length === 0 || EMAIL_RE.test(email);
  const dirty = name !== (profile.name ?? '') || email !== (profile.email ?? '');
  const canSave = dirty && emailValid;

  const handleSave = () => {
    if (!canSave) return;
    setProfile({ name: name.trim() || undefined, email: email.trim() || undefined });
    setEmailStore(email.trim());
    router.back();
  };

  return (
    <SettingsScaffold
      title={t('settings.editTitle')}
      rightAction={{
        label: t('common.save'),
        onPress: handleSave,
        disabled: !canSave,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SectionLabel>{t('settings.editName')}</SectionLabel>
        <View style={styles.field}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('settings.editNamePlaceholder')}
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        <SectionLabel>{t('settings.editEmail')}</SectionLabel>
        <View
          style={[
            styles.field,
            !emailValid && { borderColor: colors.red, borderWidth: 1.5 },
          ]}
        >
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t('settings.editEmailPlaceholder')}
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        </View>
        {!emailValid ? (
          <Text style={styles.errorText}>
            {t('settings.editEmailError')}
          </Text>
        ) : null}

        <Text style={styles.note}>{t('settings.editNote')}</Text>
      </KeyboardAvoidingView>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  input: {
    ...typography.body,
    fontSize: 15,
    color: colors.ink,
  },
  errorText: {
    ...typography.small,
    color: colors.red,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
    paddingHorizontal: 4,
  },
  note: {
    ...typography.small,
    color: colors.muted,
    paddingHorizontal: 4,
    lineHeight: 18,
  },
});
