import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '@/store/useUserStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { getVoice, ACCENT_LABEL } from '@/constants/voices';
import { colors, radius, spacing, typography } from '@/constants/theme';

const COACH_NAME: Record<string, string> = {
  onion: 'Onion · Mentor',
  luna: 'Luna · Bạn bè',
  max: 'Max · Nghiêm khắc',
  momo: 'Momo · Hài hước',
};

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  detail?: string;
  href?: Href;
  onPress?: () => void;
  danger?: boolean;
  isLast?: boolean;
};

function SettingRow({
  icon,
  iconBg,
  iconColor,
  title,
  detail,
  href,
  onPress,
  danger,
  isLast,
}: RowProps) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => {
        if (onPress) onPress();
        else if (href) router.push(href);
      }}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowBorder,
        pressed && { opacity: 0.6 },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.rowTitle, danger && { color: colors.red }]}>
        {title}
      </Text>
      {detail ? (
        <Text style={styles.rowDetail} numberOfLines={1}>
          {detail}
        </Text>
      ) : null}
      <Ionicons
        name="chevron-forward"
        size={18}
        color={danger ? colors.red : colors.muted}
      />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const onboarding = useOnboardingStore();
  const prefs = usePreferencesStore();
  const voice = getVoice(prefs.voiceId);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.h1}>{t('profile.title')}</Text>
        </View>

        <Pressable
          onPress={() => router.push('/settings/account')}
          style={({ pressed }) => [
            styles.profileCard,
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={colors.blue} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {profile.name ?? profile.email?.split('@')[0] ?? 'Học viên'}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {profile.email ?? '—'}
            </Text>
            <View style={styles.proPill}>
              <Ionicons
                name={profile.subscriptionTier === 'pro' ? 'star' : 'sparkles'}
                size={11}
                color={colors.blueDark}
              />
              <Text style={styles.proText}>
                {profile.subscriptionTier === 'pro'
                  ? t('profile.pro')
                  : t('profile.free')}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('profile.sectionLearning')}</Text>
          <View style={styles.rowList}>
            <SettingRow
              icon="trending-up"
              iconBg={colors.blueLight}
              iconColor={colors.blue}
              title={t('profile.rowLevel')}
              detail={profile.level ?? '—'}
              href="/settings/level"
            />
            <SettingRow
              icon="time"
              iconBg={colors.orangeSoft}
              iconColor={colors.orange}
              title={t('profile.rowDailyGoal')}
              detail={`${onboarding.dailyMinutes} ${t('common.minutes')}`}
              href="/settings/daily-goal"
            />
            <SettingRow
              icon="alarm"
              iconBg={colors.purpleLight}
              iconColor={colors.purple}
              title={t('profile.rowReminder')}
              detail={onboarding.reminderTime}
              href="/settings/reminder"
            />
            <SettingRow
              icon="happy"
              iconBg={colors.greenSoft}
              iconColor={colors.green}
              title={t('profile.rowCoach')}
              detail={COACH_NAME[onboarding.coachId] ?? '—'}
              href="/settings/coach"
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('profile.sectionConversation')}</Text>
          <View style={styles.rowList}>
            <SettingRow
              icon="language"
              iconBg={colors.purpleLight}
              iconColor={colors.purple}
              title={t('profile.rowLanguage')}
              detail={
                prefs.translationLanguage === 'vi' ? 'Tiếng Việt' : 'English'
              }
              href="/settings/language"
            />
            <SettingRow
              icon="mic"
              iconBg={colors.blueLight}
              iconColor={colors.blue}
              title={t('profile.rowVoice')}
              detail={`${voice.name} · ${ACCENT_LABEL[voice.accent]}`}
              href="/settings/voice"
            />
            <SettingRow
              icon="speedometer"
              iconBg={colors.orangeSoft}
              iconColor={colors.orange}
              title={t('profile.rowSpeed')}
              detail={`${prefs.speed}×`}
              href="/settings/speed"
            />
            <SettingRow
              icon="notifications"
              iconBg={colors.greenSoft}
              iconColor={colors.green}
              title={t('profile.rowNotifications')}
              detail={t('profile.notifEnabled', {
                count: Object.values(prefs.notifications).filter(Boolean).length,
              })}
              href="/settings/notifications"
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('profile.sectionAccount')}</Text>
          <View style={styles.rowList}>
            <SettingRow
              icon="card"
              iconBg={colors.blueLight}
              iconColor={colors.blue}
              title={t('profile.rowAccount')}
              detail={
                profile.subscriptionTier === 'pro'
                  ? t('profile.pro')
                  : t('profile.free')
              }
              href="/settings/account"
            />
            <SettingRow
              icon="person-circle"
              iconBg={colors.orangeSoft}
              iconColor={colors.orange}
              title={t('profile.rowEditProfile')}
              href="/settings/profile-edit"
            />
            <SettingRow
              icon="lock-closed"
              iconBg={colors.purpleLight}
              iconColor={colors.purple}
              title={t('profile.rowPassword')}
              href="/settings/password"
            />
            <SettingRow
              icon="help-circle"
              iconBg={colors.bg}
              iconColor={colors.ink2}
              title={t('profile.rowHelp')}
              href="/settings/help"
              isLast
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  h1: { ...typography.h1, color: colors.ink },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typography.h1,
    fontSize: 20,
    color: colors.ink,
  },
  email: {
    ...typography.small,
    color: colors.ink2,
    marginTop: 2,
  },
  proPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.blueLight,
  },
  proText: {
    ...typography.caption,
    color: colors.blueDark,
    fontWeight: '700',
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.micro,
    color: colors.muted,
    paddingHorizontal: spacing.xs,
  },
  rowList: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.line,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    ...typography.h3,
    color: colors.ink,
    flex: 1,
  },
  rowDetail: {
    ...typography.small,
    color: colors.muted,
    maxWidth: 160,
    marginRight: 4,
  },
});
