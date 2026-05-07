import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { KeyPhrase } from '@/types';

type Props = {
  phrases: KeyPhrase[];
  onPlay?: (phrase: KeyPhrase) => void;
};

export function KeyPhraseStrip({ phrases, onPlay }: Props) {
  const { t } = useTranslation();
  if (phrases.length === 0) return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t('conversation.keyPhrasesTitle')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {phrases.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => onPlay?.(p)}
            style={({ pressed }) => [styles.chip, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.eng} numberOfLines={1}>
              {p.english}
            </Text>
            <Text style={styles.vi} numberOfLines={1}>
              {p.vietnamese}
            </Text>
            <Ionicons
              name="volume-medium-outline"
              size={14}
              color={colors.blueDark}
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bg,
  },
  title: {
    ...typography.micro,
    color: colors.muted,
    paddingHorizontal: spacing.lg,
    marginBottom: 8,
  },
  row: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    maxWidth: 280,
  },
  eng: {
    ...typography.h3,
    color: colors.ink,
    fontSize: 14,
  },
  vi: {
    ...typography.caption,
    color: colors.muted,
  },
});
