import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';

type Props = {
  selected: boolean;
  onPress: () => void;
  title: string;
  description?: string;
  /** Element to render on the left (icon, emoji, avatar). */
  leading?: React.ReactNode;
  /** Optional inline tag next to the title. */
  tag?: { label: string; color: string; bg: string };
  accent?: 'orange' | 'blue';
};

export function OptionRow({
  selected,
  onPress,
  title,
  description,
  leading,
  tag,
  accent = 'orange',
}: Props) {
  const accentColor = accent === 'blue' ? colors.blue : colors.orange;
  const accentSoft = accent === 'blue' ? colors.blueLight : colors.orangeSoft;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: selected ? accentSoft : colors.card,
          borderColor: selected ? accentColor : colors.line,
          borderWidth: selected ? 1.5 : 1,
        },
      ]}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {tag ? (
            <View
              style={[
                styles.tag,
                { backgroundColor: tag.bg, borderColor: tag.color },
              ]}
            >
              <Text style={[styles.tagText, { color: tag.color }]}>
                {tag.label}
              </Text>
            </View>
          ) : null}
        </View>
        {description ? (
          <Text style={styles.desc} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
      {selected ? (
        <Ionicons
          name="checkmark"
          size={22}
          color={accent === 'blue' ? colors.blueDark : colors.orange}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  leading: {
    flexShrink: 0,
  },
  body: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: {
    ...typography.h2,
    color: colors.ink,
  },
  desc: {
    ...typography.small,
    color: colors.ink2,
    marginTop: 2,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  tagText: {
    ...typography.caption,
    fontWeight: '500',
  },
});
