import { Pressable, Text, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, typography } from '@/constants/theme';

type Segment<T extends string> = { id: T; label: string };

type Props<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentControl<T extends string>({
  segments,
  value,
  onChange,
}: Props<T>) {
  return (
    <View style={styles.wrap}>
      {segments.map((s) => {
        const sel = s.id === value;
        return (
          <Pressable
            key={s.id}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(s.id);
            }}
            style={[styles.seg, sel && styles.segActive]}
          >
            <Text style={[styles.segText, sel && styles.segTextActive]}>
              {s.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    padding: 3,
    borderRadius: radius.sm,
    gap: 2,
  },
  seg: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segText: {
    ...typography.h3,
    color: colors.muted,
  },
  segTextActive: {
    color: colors.ink,
  },
});
