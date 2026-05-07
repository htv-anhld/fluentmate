import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  rightAction?: { label: string; onPress: () => void; disabled?: boolean };
  children: React.ReactNode;
  /** Set to false when content has its own ScrollView/FlatList. */
  scroll?: boolean;
};

export function SettingsScaffold({
  title,
  subtitle,
  rightAction,
  children,
  scroll = true,
}: Props) {
  const router = useRouter();
  const Container: any = scroll ? ScrollView : View;
  const containerProps = scroll
    ? {
        contentContainerStyle: styles.scroll,
        showsVerticalScrollIndicator: false,
      }
    : { style: styles.flex };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </Pressable>
        <View style={styles.titleCol}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightAction ? (
          <Pressable
            onPress={rightAction.onPress}
            disabled={rightAction.disabled}
            hitSlop={8}
            style={styles.actionBtn}
          >
            <Text
              style={[
                styles.actionLabel,
                rightAction.disabled && { color: colors.muted },
              ]}
            >
              {rightAction.label}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}
      </View>
      <Container {...containerProps}>{children}</Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: { flex: 1 },
  title: {
    ...typography.h2,
    fontSize: 17,
    color: colors.ink,
  },
  subtitle: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  actionBtn: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  actionPlaceholder: { width: 36 },
  actionLabel: {
    ...typography.h3,
    color: colors.blue,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
});
