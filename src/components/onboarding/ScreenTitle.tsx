import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
};

export function ScreenTitle({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.display,
    color: colors.ink,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  subtitle: {
    ...typography.body,
    color: colors.ink2,
    marginTop: spacing.sm,
  },
});
