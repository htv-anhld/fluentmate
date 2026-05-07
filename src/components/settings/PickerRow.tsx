import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';

type Props = {
  selected: boolean;
  title: string;
  detail?: string;
  leading?: React.ReactNode;
  onPress: () => void;
};

export function PickerRow({ selected, title, detail, leading, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: selected ? colors.blueLight : colors.card,
          borderColor: selected ? colors.blue : colors.line,
          borderWidth: selected ? 1.5 : 1,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
      {selected ? (
        <Ionicons name="checkmark-circle" size={22} color={colors.blue} />
      ) : (
        <View style={styles.unselected} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  leading: { flexShrink: 0 },
  body: { flex: 1, gap: 2 },
  title: {
    ...typography.h3,
    color: colors.ink,
  },
  detail: {
    ...typography.small,
    color: colors.ink2,
  },
  unselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
});
