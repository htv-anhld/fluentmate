import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTranslate } from '@/hooks/queries/useTranslate';
import { usePreferencesStore } from '@/store/preferencesStore';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { ConversationTurn } from '@/types';

type Props = {
  turn: ConversationTurn;
  /**
   * Optional override. If not provided, reads from preferencesStore.translationLanguage
   * (configured in Profile → Ngôn ngữ).
   */
  targetLang?: 'vi' | 'en';
  /** Eagerly-supplied translation (e.g. shown by global "Bản dịch" toggle). */
  showTranslation?: boolean;
  translation?: string;
  onPlay?: () => void;
  onShowFix?: () => void;
};

export function Bubble({
  turn,
  targetLang,
  showTranslation,
  translation,
  onPlay,
  onShowFix,
}: Props) {
  const { t } = useTranslation();
  const storeLang = usePreferencesStore((s) => s.translationLanguage);
  const effectiveTarget = targetLang ?? storeLang;
  const isAI = turn.role === 'ai';
  const hasIssues = (turn.grammarIssues?.length ?? 0) > 0;
  const translateMut = useTranslate();
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [showLocalTranslation, setShowLocalTranslation] = useState(false);

  const handleTranslate = async () => {
    if (translatedText) {
      // Toggle visibility if already translated
      setShowLocalTranslation((v) => !v);
      return;
    }
    setShowLocalTranslation(true);
    try {
      const r = await translateMut.mutateAsync({
        text: turn.text,
        targetLang: effectiveTarget,
      });
      setTranslatedText(r.translation);
    } catch {
      setTranslatedText(null);
      setShowLocalTranslation(false);
    }
  };

  const visibleTranslation =
    (showTranslation && translation) ||
    (showLocalTranslation && translatedText);

  return (
    <View
      style={[
        styles.row,
        { justifyContent: isAI ? 'flex-start' : 'flex-end' },
      ]}
    >
      {isAI ? (
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🧅</Text>
        </View>
      ) : null}

      <View style={[styles.bubbleCol, !isAI && styles.bubbleColUser]}>
        <View style={[styles.bubble, isAI ? styles.bubbleAI : styles.bubbleUser]}>
          <Text style={[styles.text, !isAI && styles.textUser]}>
            {turn.text}
          </Text>
          {visibleTranslation ? (
            <View style={styles.translationWrap}>
              <Text
                style={[
                  styles.translation,
                  !isAI && styles.translationUser,
                ]}
              >
                {visibleTranslation}
              </Text>
            </View>
          ) : null}

          <View style={styles.actionsRow}>
            {onPlay && (isAI || turn.audioUrl) ? (
              <Pressable onPress={onPlay} hitSlop={6} style={styles.actionBtn}>
                <Ionicons
                  name="volume-medium"
                  size={14}
                  color={isAI ? colors.blueDark : colors.card}
                />
              </Pressable>
            ) : null}
            <Pressable
              onPress={handleTranslate}
              hitSlop={6}
              style={styles.actionBtn}
              disabled={translateMut.isPending}
            >
              {translateMut.isPending ? (
                <ActivityIndicator
                  size="small"
                  color={isAI ? colors.blueDark : colors.card}
                />
              ) : (
                <Ionicons
                  name={showLocalTranslation ? 'language' : 'language-outline'}
                  size={14}
                  color={
                    isAI
                      ? showLocalTranslation
                        ? colors.blueDark
                        : colors.muted
                      : colors.card
                  }
                />
              )}
            </Pressable>
          </View>
        </View>

        {!isAI && (turn.fluencyScore != null || hasIssues) ? (
          <View style={styles.feedbackRow}>
            {turn.fluencyScore != null ? (
              <View style={styles.scoreChip}>
                <Ionicons
                  name="trending-up"
                  size={12}
                  color={
                    turn.fluencyScore >= 80
                      ? colors.green
                      : turn.fluencyScore >= 60
                        ? colors.orange
                        : colors.red
                  }
                />
                <Text style={styles.scoreText}>{turn.fluencyScore}</Text>
              </View>
            ) : null}
            {hasIssues ? (
              <Pressable onPress={onShowFix} style={styles.fixChip}>
                <Ionicons name="construct" size={12} color={colors.orange} />
                <Text style={styles.fixText}>
                  {t('conversation.bubbleFix', {
                    count: turn.grammarIssues?.length ?? 0,
                  })}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: spacing.md,
    marginVertical: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.orangeSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarEmoji: { fontSize: 18, lineHeight: 22 },
  bubbleCol: { maxWidth: '78%', gap: 4 },
  bubbleColUser: { alignItems: 'flex-end' },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.lg,
    gap: 6,
  },
  bubbleAI: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  bubbleUser: {
    backgroundColor: colors.blue,
    borderTopRightRadius: 6,
  },
  text: {
    ...typography.body,
    fontSize: 15,
    color: colors.ink,
    lineHeight: 21,
  },
  textUser: { color: colors.card },
  translationWrap: {
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    marginTop: 2,
  },
  translation: {
    ...typography.small,
    color: colors.muted,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 18,
  },
  translationUser: {
    color: colors.card,
    opacity: 0.85,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
    alignItems: 'center',
  },
  actionBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: 6,
  },
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
  },
  scoreText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.ink,
  },
  fixChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.orangeSoft,
    borderWidth: 1,
    borderColor: colors.orangeBorder,
  },
  fixText: {
    ...typography.caption,
    color: colors.orange,
    fontWeight: '700',
  },
});
