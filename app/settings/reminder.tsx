import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SettingsScaffold } from '@/components/settings/SettingsScaffold';
import { SectionLabel } from '@/components/settings/SectionLabel';
import { useOnboardingStore } from '@/store/onboardingStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { colors, radius, spacing, typography } from '@/constants/theme';

const TIMES = ['7:00', '8:00', '9:00', '12:00', '17:00', '18:00', '20:00', '21:00', '22:00'];

export default function ReminderSettings() {
  const { t } = useTranslation();
  const time = useOnboardingStore((s) => s.reminderTime);
  const setTime = useOnboardingStore((s) => s.setReminderTime);
  const enabled = usePreferencesStore((s) => s.notifications.reminders);
  const setEnabled = usePreferencesStore((s) => s.setNotification);

  return (
    <SettingsScaffold
      title={t('settings.reminderTitle')}
      subtitle={t('settings.reminderSubtitle')}
    >
      <View>
        <Pressable
          onPress={() => setEnabled('reminders', !enabled)}
          style={[
            styles.toggle,
            {
              backgroundColor: enabled ? colors.blueLight : colors.card,
              borderColor: enabled ? colors.blue : colors.line,
              borderWidth: enabled ? 1.5 : 1,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>
              {t('settings.reminderToggleTitle')}
            </Text>
            <Text style={styles.toggleDetail}>
              {enabled
                ? t('settings.reminderOn')
                : t('settings.reminderOff')}
            </Text>
          </View>
          <View
            style={[
              styles.switchTrack,
              { backgroundColor: enabled ? colors.blue : colors.line },
            ]}
          >
            <View
              style={[
                styles.switchThumb,
                enabled ? styles.switchOn : styles.switchOff,
              ]}
            />
          </View>
        </Pressable>
      </View>

      {enabled ? (
        <View>
          <SectionLabel>{t('settings.reminderSection')}</SectionLabel>
          <View style={styles.timeGrid}>
            {TIMES.map((tm) => {
              const sel = time === tm;
              return (
                <Pressable
                  key={tm}
                  onPress={() => setTime(tm)}
                  style={[
                    styles.timeTile,
                    {
                      backgroundColor: sel ? colors.blueLight : colors.card,
                      borderColor: sel ? colors.blue : colors.line,
                      borderWidth: sel ? 1.5 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.timeText,
                      { color: sel ? colors.blueDark : colors.ink },
                    ]}
                  >
                    {tm}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radius.md,
    gap: 12,
  },
  toggleTitle: { ...typography.h2, color: colors.ink },
  toggleDetail: {
    ...typography.small,
    color: colors.muted,
    marginTop: 2,
  },
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.card,
  },
  switchOn: { alignSelf: 'flex-end' },
  switchOff: { alignSelf: 'flex-start' },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeTile: {
    width: '31%',
    height: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    ...typography.h3,
    fontSize: 15,
  },
});
