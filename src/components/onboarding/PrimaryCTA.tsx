import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadows, typography } from '@/constants/theme';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  showArrow?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryCTA({ label, onPress, disabled, showArrow = true, style }: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [styles.btn, disabled ? styles.disabled : shadows.md, pressed && !disabled && styles.pressed, style]}
    >
      <View style={styles.row}>
        <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
        {showArrow ? <Ionicons name="arrow-forward" size={20} color={disabled ? colors.muted : colors.card} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.blue,
    borderWidth: 2,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: colors.line,
    borderColor: colors.line,
  },
  pressed: { transform: [{ scale: 0.97 }] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    ...typography.h2,
    color: colors.card,
    letterSpacing: 0.2,
  },
  labelDisabled: {
    color: colors.muted,
  },
});
