import { useEffect } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadows, typography } from '@/constants/theme';

export type MicState = 'idle' | 'recording' | 'processing' | 'speaking';

type Props = {
  state: MicState;
  onPress: () => void;
};

export function MicButton({ state, onPress }: Props) {
  const { t } = useTranslation();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (state === 'recording') {
      pulse.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(0, { duration: 200 });
    }
  }, [state, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.35 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.6 }],
  }));

  const disabled = state === 'processing' || state === 'speaking';

  const bgColor =
    state === 'recording'
      ? colors.red
      : disabled
        ? colors.line
        : colors.blue;

  const icon: keyof typeof Ionicons.glyphMap =
    state === 'recording'
      ? 'stop'
      : state === 'processing'
        ? 'hourglass'
        : state === 'speaking'
          ? 'volume-high'
          : 'mic';

  const label =
    state === 'recording'
      ? t('conversation.listening')
      : state === 'processing'
        ? t('common.loading')
        : state === 'speaking'
          ? 'AI...'
          : t('conversation.tapToSpeak');

  return (
    <View style={styles.wrap}>
      <View style={styles.ringWrap}>
        {state === 'recording' ? (
          <Animated.View style={[styles.ring, ringStyle]} />
        ) : null}
        <Pressable
          disabled={disabled}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            onPress();
          }}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: bgColor },
            shadows.md,
            pressed && !disabled && { transform: [{ scale: 0.95 }] },
          ]}
        >
          <Ionicons name={icon} size={32} color={colors.card} />
        </Pressable>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 8,
  },
  ringWrap: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 42,
    backgroundColor: colors.red,
  },
  button: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.small,
    color: colors.ink2,
  },
});
