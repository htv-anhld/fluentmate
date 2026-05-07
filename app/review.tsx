import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import {
  useVocabulary,
  useReviewVocabulary,
} from '@/hooks/queries/useVocabulary';
import { useTTS } from '@/hooks/useTTS';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import type { VocabularyItem } from '@/types';

type Quality = 0 | 1 | 2 | 3 | 4 | 5;

type QualityOption = {
  q: Quality;
  labelKey: string;
  hintKey: string;
  color: string;
  bg: string;
};

const QUALITY_OPTIONS: QualityOption[] = [
  { q: 1, labelKey: 'review.qualityForget', hintKey: 'review.qualityForgetHint', color: colors.red, bg: colors.redSoft },
  { q: 3, labelKey: 'review.qualityHard', hintKey: 'review.qualityHardHint', color: colors.orange, bg: colors.orangeSoft },
  { q: 4, labelKey: 'review.qualityOk', hintKey: 'review.qualityOkHint', color: colors.green, bg: colors.greenSoft },
  { q: 5, labelKey: 'review.qualityEasy', hintKey: 'review.qualityEasyHint', color: colors.blue, bg: colors.blueLight },
];

export default function ReviewScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const tts = useTTS();
  const dueQ = useVocabulary({ due: true });
  const reviewMut = useReviewVocabulary();

  const [queue, setQueue] = useState<VocabularyItem[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    if (dueQ.data && queue.length === 0 && !done) {
      setQueue(dueQ.data);
      setStats({ correct: 0, total: dueQ.data.length });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueQ.data]);

  const current = queue[0];

  const handleRate = async (q: Quality) => {
    if (!current) return;
    Haptics.selectionAsync().catch(() => {});

    try {
      await reviewMut.mutateAsync({ id: current.id, quality: q });
      if (q >= 4) {
        setStats((s) => ({ ...s, correct: s.correct + 1 }));
      }
    } catch {
      /* swallow */
    }

    const remaining = queue.slice(1);
    setQueue(remaining);
    setRevealed(false);
    if (remaining.length === 0) setDone(true);
  };

  const handleSpeak = () => {
    if (current) tts.speak(current.english);
  };

  if (dueQ.isLoading && queue.length === 0 && !done) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.blue} />
        </View>
      </SafeAreaView>
    );
  }

  if (done || !current) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="close" size={20} color={colors.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('review.title')}</Text>
          <View style={styles.headerBtn} />
        </View>

        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>{done ? '🎉' : '✨'}</Text>
          <Text style={styles.emptyTitle}>
            {done
              ? t('review.emptyTitleDone')
              : t('review.emptyTitleEmpty')}
          </Text>
          <Text style={styles.emptySub}>
            {done
              ? t('review.doneSub', { good: stats.correct, total: stats.total })
              : t('review.emptySub')}
          </Text>
          <Pressable
            onPress={() => router.replace('/(tabs)/today')}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.ctaText}>{t('review.backHome')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const remaining = queue.length;
  const completed = stats.total - remaining;
  const progress = stats.total > 0 ? completed / stats.total : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="close" size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {completed + 1}/{stats.total}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.body}>
        <LinearGradient colors={[colors.blueLight, colors.card]} style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardLevelChip}>
              <Text style={styles.cardLevelText}>
                {t('review.repsLabel', { n: current.repetitions + 1 })}
              </Text>
            </View>
            <Pressable onPress={handleSpeak} style={styles.cardSpeak} hitSlop={8}>
              <Ionicons name="volume-medium" size={20} color={colors.blueDark} />
            </Pressable>
          </View>

          <Text style={styles.english}>{current.english}</Text>
          {current.ipa ? <Text style={styles.ipa}>{current.ipa}</Text> : null}

          {revealed ? (
            <View style={styles.reveal}>
              <View style={styles.divider} />
              <Text style={styles.vietnamese}>{current.vietnamese}</Text>
              {current.contextSentence ? (
                <Text style={styles.context}>"{current.contextSentence}"</Text>
              ) : null}
            </View>
          ) : null}
        </LinearGradient>

        {!revealed ? (
          <Pressable
            onPress={() => setRevealed(true)}
            style={({ pressed }) => [
              styles.revealBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name="eye" size={18} color={colors.card} />
            <Text style={styles.revealText}>{t('review.revealCta')}</Text>
          </Pressable>
        ) : (
          <View style={styles.qualityGrid}>
            {QUALITY_OPTIONS.map((opt) => (
              <Pressable
                key={opt.q}
                onPress={() => handleRate(opt.q)}
                style={({ pressed }) => [
                  styles.qualityBtn,
                  { backgroundColor: opt.bg, borderColor: opt.color },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={[styles.qualityLabel, { color: opt.color }]}>
                  {t(opt.labelKey)}
                </Text>
                <Text style={styles.qualityHint}>{t(opt.hintKey)}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...typography.h2,
    fontSize: 15,
    color: colors.ink,
  },
  progressTrack: { height: 4, backgroundColor: colors.line },
  progressFill: { height: '100%', backgroundColor: colors.blue },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.md,
    minHeight: 280,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardLevelChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardLevelText: {
    ...typography.caption,
    color: colors.ink2,
    fontWeight: '700',
  },
  cardSpeak: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  english: {
    ...typography.h1,
    fontSize: 28,
    color: colors.ink,
    lineHeight: 36,
    marginTop: spacing.md,
  },
  ipa: {
    ...typography.body,
    color: colors.ink2,
    fontStyle: 'italic',
    marginTop: 6,
  },
  reveal: { marginTop: spacing.lg, gap: spacing.md },
  divider: { height: 1, backgroundColor: colors.line },
  vietnamese: {
    ...typography.h2,
    fontSize: 18,
    color: colors.blueDark,
  },
  context: {
    ...typography.body,
    color: colors.ink2,
    fontStyle: 'italic',
  },
  revealBtn: {
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.md,
  },
  revealText: { ...typography.h2, color: colors.card },
  qualityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  qualityBtn: {
    width: '48%',
    minHeight: 64,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualityLabel: {
    ...typography.h2,
    fontSize: 16,
    fontWeight: '700',
  },
  qualityHint: {
    ...typography.caption,
    color: colors.ink2,
    marginTop: 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { ...typography.h1, color: colors.ink },
  emptySub: {
    ...typography.body,
    color: colors.ink2,
    textAlign: 'center',
    lineHeight: 22,
  },
  cta: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.blue,
  },
  ctaText: { ...typography.h2, color: colors.card },
});
