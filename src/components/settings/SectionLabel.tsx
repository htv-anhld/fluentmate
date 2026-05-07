import { Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/constants/theme';

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    ...typography.micro,
    color: colors.muted,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
});
