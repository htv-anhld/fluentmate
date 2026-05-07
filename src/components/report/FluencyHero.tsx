import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '@/constants/theme';

type Props = {
  score: number;
  delta: number;
  weeklyTrend: number[];
};

export function FluencyHero({ score, delta, weeklyTrend }: Props) {
  const max = Math.max(...weeklyTrend, 100);
  const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  return (
    <LinearGradient
      colors={[colors.blue, colors.blueDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <Text style={styles.label}>FLUENCY SCORE</Text>
      <View style={styles.scoreRow}>
        <Text style={styles.score}>{score}</Text>
        <View
          style={[
            styles.deltaPill,
            {
              backgroundColor:
                delta >= 0 ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)',
            },
          ]}
        >
          <Ionicons
            name={delta >= 0 ? 'trending-up' : 'trending-down'}
            size={14}
            color={colors.card}
          />
          <Text style={styles.deltaText}>
            {delta >= 0 ? '+' : ''}
            {delta}
          </Text>
        </View>
      </View>

      <View style={styles.chart}>
        {weeklyTrend.map((v, i) => {
          const h = Math.max(8, (v / max) * 64);
          const isToday = i === weeklyTrend.length - 1;
          return (
            <View key={i} style={styles.barCol}>
              <View
                style={[
                  styles.bar,
                  {
                    height: h,
                    backgroundColor: isToday
                      ? colors.card
                      : 'rgba(255,255,255,0.55)',
                  },
                ]}
              />
              <Text style={styles.barLabel}>{labels[i] ?? ''}</Text>
            </View>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 12,
  },
  label: {
    ...typography.micro,
    color: colors.card,
    opacity: 0.85,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  score: {
    fontSize: 56,
    fontWeight: '900',
    color: colors.card,
    letterSpacing: -2,
    lineHeight: 60,
  },
  deltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  deltaText: {
    ...typography.h3,
    color: colors.card,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    height: 90,
    alignItems: 'flex-end',
    marginTop: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  bar: {
    width: '70%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    ...typography.caption,
    color: colors.card,
    opacity: 0.85,
  },
});
