import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';
import { ProgressHeader } from './ProgressHeader';
import { PrimaryCTA } from './PrimaryCTA';

type Props = {
  progress: number;
  showSkip?: boolean;
  onSkip?: () => void;
  onBack?: () => void;
  ctaLabel: string;
  ctaDisabled?: boolean;
  onCtaPress: () => void;
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

/** Standard onboarding screen chrome: SafeArea + ProgressHeader + content + CTA. */
export function OnboardingScreen({
  progress,
  showSkip,
  onSkip,
  onBack,
  ctaLabel,
  ctaDisabled,
  onCtaPress,
  contentStyle,
  children,
}: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ProgressHeader
        progress={progress}
        showSkip={showSkip}
        onSkip={onSkip}
        onBack={onBack}
      />
      <View style={[styles.content, contentStyle]}>{children}</View>
      <View style={styles.ctaWrap}>
        <PrimaryCTA
          label={ctaLabel}
          onPress={onCtaPress}
          disabled={ctaDisabled}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.card,
  },
  content: {
    flex: 1,
  },
  ctaWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
