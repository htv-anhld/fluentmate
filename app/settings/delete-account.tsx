import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SettingsScaffold } from '@/components/settings/SettingsScaffold';
import { useUserStore } from '@/store/useUserStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { forgetDevice } from '@/services/authService';
import { supabase } from '@/services/supabase';
import { colors, radius, spacing, typography } from '@/constants/theme';

const CONSEQUENCE_KEYS = [
  'deleteAccount.consequence1',
  'deleteAccount.consequence2',
  'deleteAccount.consequence3',
  'deleteAccount.consequence4',
  'deleteAccount.consequence5',
];

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const reset = useUserStore((s) => s.reset);
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  const [acknowledgeData, setAcknowledgeData] = useState(false);
  const [acknowledgeIrreversible, setAcknowledgeIrreversible] = useState(false);
  const [acknowledgeNoRefund, setAcknowledgeNoRefund] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const allChecked =
    acknowledgeData && acknowledgeIrreversible && acknowledgeNoRefund;
  const canDelete = allChecked && !submitting;

  const handleDelete = () => {
    if (!canDelete) return;
    // Final native confirm — last chance to back out.
    Alert.alert(
      t('deleteAccount.finalConfirmTitle'),
      t('deleteAccount.finalConfirmBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('deleteAccount.finalConfirmDelete'),
          style: 'destructive',
          onPress: doDelete,
        },
      ],
    );
  };

  const doDelete = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'delete-account',
        { body: {} },
      );
      if (error) throw error;
      const result = data as
        | { ok: true; uid: string; email: string }
        | { error: string; detail?: string };
      if ('error' in result) {
        throw new Error(result.error + (result.detail ? `: ${result.detail}` : ''));
      }
      // Wipe local state — keystore creds, profile, onboarding answers.
      await forgetDevice().catch(() => {});
      reset();
      resetOnboarding();
      Alert.alert(
        t('settings.accountDeletedTitle'),
        t('settings.accountDeletedBody'),
        [
          { text: t('common.ok'), onPress: () => router.replace('/') },
        ],
      );
    } catch (err) {
      Alert.alert(
        t('settings.accountDeleteErrorTitle'),
        err instanceof Error
          ? err.message
          : t('settings.accountDeleteErrorBody'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SettingsScaffold
      title={t('deleteAccount.title')}
      subtitle={profile.email ?? ''}
    >
      <View style={styles.warningCard}>
        <View style={styles.warningIcon}>
          <Ionicons name="warning" size={28} color={colors.red} />
        </View>
        <Text style={styles.warningTitle}>{t('deleteAccount.warningTitle')}</Text>
        <Text style={styles.warningBody}>{t('deleteAccount.warningBody')}</Text>
      </View>

      <View style={styles.consequencesCard}>
        <Text style={styles.consequencesTitle}>
          {t('deleteAccount.consequencesTitle')}
        </Text>
        {CONSEQUENCE_KEYS.map((k) => (
          <View key={k} style={styles.consequenceRow}>
            <Ionicons name="close-circle" size={16} color={colors.red} />
            <Text style={styles.consequenceText}>{t(k)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.checkboxes}>
        <CheckRow
          checked={acknowledgeData}
          onToggle={() => setAcknowledgeData((v) => !v)}
          label={t('deleteAccount.checkData')}
        />
        <CheckRow
          checked={acknowledgeIrreversible}
          onToggle={() => setAcknowledgeIrreversible((v) => !v)}
          label={t('deleteAccount.checkIrreversible')}
        />
        <CheckRow
          checked={acknowledgeNoRefund}
          onToggle={() => setAcknowledgeNoRefund((v) => !v)}
          label={t('deleteAccount.checkNoRefund')}
        />
      </View>

      <Pressable
        onPress={handleDelete}
        disabled={!canDelete}
        style={({ pressed }) => [
          styles.deleteCta,
          !canDelete && styles.deleteCtaDisabled,
          canDelete && pressed && { opacity: 0.85 },
        ]}
      >
        {submitting ? (
          <ActivityIndicator color={colors.card} />
        ) : (
          <>
            <Ionicons
              name="trash"
              size={18}
              color={canDelete ? colors.card : colors.muted}
            />
            <Text
              style={[
                styles.deleteCtaText,
                !canDelete && { color: colors.muted },
              ]}
            >
              {t('deleteAccount.deleteCta')}
            </Text>
          </>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.back()}
        style={styles.cancelBtn}
        hitSlop={6}
      >
        <Text style={styles.cancelText}>{t('common.cancel')}</Text>
      </Pressable>
    </SettingsScaffold>
  );
}

function CheckRow({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.checkRow,
        pressed && { opacity: 0.7 },
      ]}
    >
      <View
        style={[
          styles.checkbox,
          checked && {
            backgroundColor: colors.red,
            borderColor: colors.red,
          },
        ]}
      >
        {checked ? (
          <Ionicons name="checkmark" size={16} color={colors.card} />
        ) : null}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  warningCard: {
    backgroundColor: colors.redSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.red,
  },
  warningIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningTitle: {
    ...typography.h2,
    color: colors.red,
    textAlign: 'center',
  },
  warningBody: {
    ...typography.body,
    fontSize: 14,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 20,
  },
  consequencesCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: spacing.sm,
  },
  consequencesTitle: {
    ...typography.h3,
    color: colors.ink,
    marginBottom: 4,
  },
  consequenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  consequenceText: {
    ...typography.body,
    fontSize: 14,
    color: colors.ink,
    flex: 1,
    lineHeight: 20,
  },
  checkboxes: {
    gap: spacing.md,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkLabel: {
    ...typography.body,
    fontSize: 14,
    color: colors.ink,
    flex: 1,
    lineHeight: 20,
  },
  deleteCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.red,
    marginTop: spacing.md,
  },
  deleteCtaDisabled: {
    backgroundColor: colors.line,
  },
  deleteCtaText: {
    ...typography.h2,
    color: colors.card,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  cancelText: {
    ...typography.body,
    color: colors.ink2,
    fontWeight: '600',
  },
});
