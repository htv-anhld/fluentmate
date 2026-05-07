import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '@/constants/theme';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

type Props = {
  streak: number;
  weekDays: boolean[];
};

export function StreakCard({ streak, weekDays }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.flame}>
          <Ionicons name="flame" size={20} color={colors.orange} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.value}>{streak}</Text>
          <Text style={styles.label}>{t('today.streakSuffix')}</Text>
        </View>
      </View>
      <View style={styles.week}>
        {DAY_KEYS.map((dKey, i) => {
          const d = t(`today.weekday.${dKey}`);
          const done = weekDays[i] ?? false;
          return (
            <View key={dKey} style={styles.dayCol}>
              <View
                style={[
                  styles.dayDot,
                  {
                    backgroundColor: done ? colors.orange : colors.line,
                  },
                ]}
              >
                {done ? (
                  <Ionicons name="checkmark" size={14} color={colors.card} />
                ) : null}
              </View>
              <Text style={styles.dayLabel}>{d}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flame: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.orangeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  value: {
    ...typography.h1,
    fontSize: 26,
    color: colors.ink,
  },
  label: {
    ...typography.body,
    color: colors.ink2,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    ...typography.caption,
    color: colors.muted,
  },
});
