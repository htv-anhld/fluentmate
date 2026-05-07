import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SettingsScaffold } from '@/components/settings/SettingsScaffold';
import {
  usePreferencesStore,
  type NotificationPrefs,
} from '@/store/preferencesStore';
import { colors, radius, spacing, typography } from '@/constants/theme';

type Item = {
  key: keyof NotificationPrefs;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  titleKey: string;
  detailKey: string;
};

const ITEMS: Item[] = [
  {
    key: 'reminders',
    icon: 'alarm',
    iconBg: 'rgba(74,159,255,0.10)',
    iconColor: '#4A9FFF',
    titleKey: 'settings.notifReminderTitle',
    detailKey: 'settings.notifReminderDetail',
  },
  {
    key: 'streakWarning',
    icon: 'flame',
    iconBg: 'rgba(255,140,66,0.10)',
    iconColor: '#FF8C42',
    titleKey: 'settings.notifStreakTitle',
    detailKey: 'settings.notifStreakDetail',
  },
  {
    key: 'weeklyReport',
    icon: 'stats-chart',
    iconBg: 'rgba(155,125,255,0.10)',
    iconColor: '#9B7DFF',
    titleKey: 'settings.notifWeeklyTitle',
    detailKey: 'settings.notifWeeklyDetail',
  },
  {
    key: 'newScenarios',
    icon: 'sparkles',
    iconBg: 'rgba(79,201,120,0.10)',
    iconColor: '#4FC978',
    titleKey: 'settings.notifNewTitle',
    detailKey: 'settings.notifNewDetail',
  },
];

function ToggleRow({
  item,
  value,
  onChange,
}: {
  item: Item;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={18} color={item.iconColor} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{t(item.titleKey)}</Text>
        <Text style={styles.detail}>{t(item.detailKey)}</Text>
      </View>
      <View
        style={[
          styles.track,
          { backgroundColor: value ? colors.blue : colors.line },
        ]}
      >
        <View
          style={[
            styles.thumb,
            value ? styles.thumbOn : styles.thumbOff,
          ]}
        />
      </View>
    </Pressable>
  );
}

export default function NotificationsSettings() {
  const { t } = useTranslation();
  const notifications = usePreferencesStore((s) => s.notifications);
  const setNotification = usePreferencesStore((s) => s.setNotification);

  return (
    <SettingsScaffold
      title={t('settings.notificationsTitle')}
      subtitle={t('settings.notificationsSubtitle')}
    >
      <View style={styles.list}>
        {ITEMS.map((item) => (
          <ToggleRow
            key={item.key}
            item={item}
            value={notifications[item.key]}
            onChange={(v) => setNotification(item.key, v)}
          />
        ))}
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
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
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.line,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  title: { ...typography.h3, color: colors.ink },
  detail: { ...typography.caption, color: colors.muted },
  track: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.card,
  },
  thumbOn: { alignSelf: 'flex-end' },
  thumbOff: { alignSelf: 'flex-start' },
});
