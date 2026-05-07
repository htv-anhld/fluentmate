import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '@/constants/theme';

type Props = {
  progress: number;
  showSkip?: boolean;
  onSkip?: () => void;
  onBack?: () => void;
};

export function ProgressHeader({
  progress,
  showSkip = true,
  onSkip,
  onBack,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const handleBack = onBack ?? (() => router.back());
  const pct = Math.min(1, Math.max(0, progress));

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={handleBack}
        style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
      >
        <Ionicons name="chevron-back" size={18} color={colors.ink} />
      </Pressable>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>

      {showSkip ? (
        <Pressable onPress={onSkip} hitSlop={8}>
          <Text style={styles.skip}>{t('common.skip')}</Text>
        </Pressable>
      ) : (
        <View style={styles.skipPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 4,
    backgroundColor: colors.blueLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.blue,
    borderRadius: 4,
  },
  skip: {
    ...typography.small,
    color: colors.muted,
  },
  skipPlaceholder: {
    width: 40,
  },
});
