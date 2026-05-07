import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SettingsScaffold } from '@/components/settings/SettingsScaffold';
import { SectionLabel } from '@/components/settings/SectionLabel';
import { useUserStore } from '@/store/useUserStore';
import { signOut as supaSignOut } from '@/services/authService';
import { colors, radius, spacing, typography } from '@/constants/theme';

const FREE_FEATURE_KEYS = [
  'settings.accountFreeFeat1',
  'settings.accountFreeFeat2',
  'settings.accountFreeFeat3',
];

const PRO_FEATURE_KEYS = [
  'settings.accountProFeat1',
  'settings.accountProFeat2',
  'settings.accountProFeat3',
  'settings.accountProFeat4',
  'settings.accountProFeat5',
];

export default function AccountSettings() {
  const router = useRouter();
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const reset = useUserStore((s) => s.reset);
  const isPro = profile.subscriptionTier === 'pro';

  const confirmSignOut = () => {
    Alert.alert(
      t('settings.accountSignoutTitle'),
      t('settings.accountSignoutBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.accountSignout'),
          style: 'destructive',
          onPress: async () => {
            // Sign out of Supabase but keep dev cred + onboarding state so the
            // user can sign back in via the Login screen without redoing setup.
            await supaSignOut().catch(() => {});
            reset();
            router.replace('/(auth)/login');
          },
        },
      ],
    );
  };

  const goDelete = () => router.push('/settings/delete-account');

  const featureKeys = isPro ? PRO_FEATURE_KEYS : FREE_FEATURE_KEYS;

  return (
    <SettingsScaffold title={t('settings.accountTitle')}>
      <LinearGradient
        colors={isPro ? [colors.blue, colors.blueDark] : [colors.bg, colors.line]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroTop}>
          <View>
            <Text
              style={[
                styles.heroLabel,
                { color: isPro ? colors.card : colors.ink2 },
              ]}
            >
              {t('settings.accountHeroLabel')}
            </Text>
            <Text
              style={[
                styles.heroPlan,
                { color: isPro ? colors.card : colors.ink },
              ]}
            >
              {isPro
                ? t('settings.accountPlanPro')
                : t('settings.accountPlanFree')}
            </Text>
          </View>
          {isPro ? (
            <View style={styles.proBadge}>
              <Ionicons name="star" size={12} color={colors.card} />
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.heroFeatures}>
          {featureKeys.map((k) => (
            <View key={k} style={styles.featureRow}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={isPro ? colors.card : colors.ink2}
              />
              <Text
                style={[
                  styles.featureText,
                  { color: isPro ? colors.card : colors.ink },
                ]}
              >
                {t(k)}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View>
        <SectionLabel>{t('settings.accountSectionInfo')}</SectionLabel>
        <View style={styles.list}>
          <Pressable
            onPress={() => router.push('/settings/profile-edit')}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.rowTitle}>{t('settings.accountEmail')}</Text>
            <Text style={styles.rowDetail} numberOfLines={1}>
              {profile.email ?? '—'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{t('settings.accountLevel')}</Text>
            <Text style={styles.rowDetail}>{profile.level ?? '—'}</Text>
            <View style={{ width: 18 }} />
          </View>
        </View>
      </View>

      <View>
        <SectionLabel>{t('settings.accountSectionActions')}</SectionLabel>
        <View style={styles.list}>
          <Pressable
            onPress={confirmSignOut}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.rowTitle}>{t('settings.accountSignout')}</Text>
            <Ionicons name="log-out-outline" size={18} color={colors.muted} />
          </Pressable>
          <Pressable
            onPress={goDelete}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
          >
            <Text style={[styles.rowTitle, { color: colors.red }]}>
              {t('settings.accountDelete')}
            </Text>
            <Ionicons name="trash-outline" size={18} color={colors.red} />
          </Pressable>
        </View>
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: { ...typography.micro },
  heroPlan: {
    ...typography.h1,
    fontSize: 22,
    marginTop: 4,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  proBadgeText: {
    ...typography.micro,
    color: colors.card,
  },
  heroFeatures: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    ...typography.small,
    fontSize: 13,
    flex: 1,
  },
  upgrade: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.blue,
    height: 52,
    borderRadius: radius.pill,
  },
  upgradeText: {
    ...typography.h2,
    color: colors.card,
  },
  list: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.line,
  },
  rowTitle: {
    ...typography.h3,
    color: colors.ink,
    flex: 1,
  },
  rowDetail: {
    ...typography.small,
    color: colors.muted,
    maxWidth: 180,
  },
});
