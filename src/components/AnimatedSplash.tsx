import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/constants/theme';

type Props = {
  /** Called once the splash has finished animating out. */
  onDone: () => void;
};

/**
 * Full-screen splash overlay shown after the native splash hides.
 * Animates the logo with a spring scale + bounce, holds briefly, then fades out.
 */
export function AnimatedSplash({ onDone }: Props) {
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);
  const wordmarkY = useSharedValue(20);
  const wordmarkOpacity = useSharedValue(0);

  useEffect(() => {
    // Logo: pop in with bounce.
    opacity.value = withTiming(1, { duration: 280 });
    scale.value = withSequence(
      withSpring(1.1, { damping: 8, stiffness: 90 }),
      withSpring(1, { damping: 14, stiffness: 120 }),
    );
    // Wordmark slides up just after.
    wordmarkY.value = withTiming(0, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
    wordmarkOpacity.value = withTiming(1, { duration: 420 });

    const tm = setTimeout(onDone, 1400);
    return () => clearTimeout(tm);
  }, [onDone, opacity, scale, wordmarkOpacity, wordmarkY]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkY.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      exiting={FadeOut.duration(360)}
      style={StyleSheet.absoluteFill}
    >
      <LinearGradient
        colors={[colors.bg, colors.blueLight]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.center}>
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <Image
            source={require('../../assets/images/splash-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.View style={wordmarkStyle}>
          <Text style={styles.brand}>FluentMate</Text>
          <Text style={styles.tagline}>Speak with confidence</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  logoWrap: {
    width: 160,
    height: 160,
    borderRadius: 36,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.blueDark,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  logo: { width: 110, height: 110 },
  brand: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.ink,
    fontStyle: 'italic',
    letterSpacing: -1,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 15,
    color: colors.ink2,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },
});
