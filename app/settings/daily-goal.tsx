import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SettingsScaffold } from '@/components/settings/SettingsScaffold';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radius, spacing, typography } from '@/constants/theme';

const OPTIONS = [5, 10, 15, 20, 30] as const;

export default function DailyGoalSettings() {
  const { t } = useTranslation();
  const dailyMinutes = useOnboardingStore((s) => s.dailyMinutes);
  const setDailyMinutes = useOnboardingStore((s) => s.setDailyMinutes);

  return (
    <SettingsScaffold
      title={t('settings.dailyGoalTitle')}
      subtitle={t('settings.dailyGoalSubtitle')}
    >
      <View style={styles.row}>
        {OPTIONS.map((m) => {
          const sel = dailyMinutes === m;
          return (
            <Pressable
              key={m}
              onPress={() => setDailyMinutes(m)}
              style={[
                styles.tile,
                {
                  backgroundColor: sel ? colors.orangeSoft : colors.card,
                  borderColor: sel ? colors.orange : colors.line,
                  borderWidth: sel ? 1.5 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.num,
                  { color: sel ? colors.orange : colors.ink },
                ]}
              >
                {m}
              </Text>
              <Text
                style={[
                  styles.unit,
                  { color: sel ? colors.orange : colors.ink2 },
                ]}
              >
                {t('common.minutes')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.tip}>
        <Ionicons name="bulb" size={18} color="#E0A800" />
        <Text style={styles.tipText}>{t('settings.dailyGoalTip')}</Text>
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  tile: {
    flex: 1,
    aspectRatio: 1 / 1.05,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: {
    fontSize: 22,
    fontWeight: '700',
  },
  unit: {
    ...typography.small,
    marginTop: 2,
  },
  tip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.blueLight,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  tipText: {
    ...typography.small,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 18,
    flex: 1,
  },
});
