import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { SkillRadar as SkillRadarT } from '@/types';

const LABEL_KEYS: Record<keyof SkillRadarT, string> = {
  pronunciation: 'skills.pronunciation',
  grammar: 'skills.grammar',
  vocabulary: 'skills.vocabulary',
  fluency: 'skills.fluency',
  confidence: 'skills.confidence',
};

const ORDER: (keyof SkillRadarT)[] = [
  'pronunciation',
  'grammar',
  'vocabulary',
  'fluency',
  'confidence',
];

const COLORS: Record<keyof SkillRadarT, string> = {
  pronunciation: colors.blue,
  grammar: colors.purple,
  vocabulary: colors.orange,
  fluency: colors.green,
  confidence: '#7C5CD3',
};

type Props = { skills: SkillRadarT };

export function SkillRadar({ skills }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('skills.title')}</Text>
      <View style={styles.list}>
        {ORDER.map((key) => {
          const v = skills[key];
          return (
            <View key={key} style={styles.row}>
              <Text style={styles.label}>{t(LABEL_KEYS[key])}</Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.min(100, v)}%`,
                      backgroundColor: COLORS[key],
                    },
                  ]}
                />
              </View>
              <Text style={styles.value}>{v}</Text>
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
    gap: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.ink,
  },
  list: { gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    ...typography.small,
    color: colors.ink2,
    width: 88,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  value: {
    ...typography.h3,
    color: colors.ink,
    width: 28,
    textAlign: 'right',
  },
});
