import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { colors, radius } from '@/constants/theme';

function Dot({ delay }: { delay: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withDelay(delay, withTiming(1.4, { duration: 350 })),
        withTiming(1, { duration: 350 }),
      ),
      -1,
    );
    opacity.value = withRepeat(
      withSequence(
        withDelay(delay, withTiming(1, { duration: 350 })),
        withTiming(0.4, { duration: 350 }),
      ),
      -1,
    );
  }, [delay, scale, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export function TypingIndicator() {
  return (
    <View style={styles.bubble}>
      <Dot delay={0} />
      <Dot delay={120} />
      <Dot delay={240} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderTopLeftRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignSelf: 'flex-start',
    marginLeft: 48,
    marginVertical: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
});
