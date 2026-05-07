import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useEndConversation } from '@/hooks/queries/useConversation';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import type { SessionReport, WordMistake, MispronouncedWord } from '@/types';

const MISTAKE_TYPE_LABEL: Record<WordMistake['type'], string> = {
  tense: 'Thì',
  article: 'Mạo từ',
  preposition: 'Giới từ',
  'word-order': 'Trật tự từ',
  plural: 'Số nhiều',
  'word-choice': 'Chọn từ',
  spelling: 'Chính tả',
  other: 'Khác',
};

export default function ReportScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const endMut = useEndConversation();
  const [report, setReport] = useState<SessionReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = () => {
    if (!sessionId) return;
    setError(null);
    setReport(null);
    endMut
      .mutateAsync({ sessionId })
      .then((r) => setReport(r))
      .catch((e: Error) => setError(e.message));
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const goHome = () => router.replace('/(tabs)/today');

  if (!sessionId) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Missing session id</Text>
          <Pressable onPress={goHome} style={styles.cta}>
            <Text style={styles.ctaText}>{t('report.backHome')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!report && !error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.blue} size="large" />
          <Text style={styles.loadingText}>{t('report.analyzing')}</Text>
          <Text style={styles.loadingSub}>{t('report.analyzingSub')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !report) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={48} color={colors.red} />
          <Text style={styles.errorText}>{error ?? 'Unknown error'}</Text>
          <Pressable
            onPress={fetchReport}
            style={({ pressed }) => [
              styles.cta,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name="refresh" size={18} color={colors.card} />
            <Text style={styles.ctaText}>{t('common.retry')}</Text>
          </Pressable>
          <Pressable onPress={goHome} style={styles.linkBtn} hitSlop={8}>
            <Text style={styles.linkText}>{t('report.backHome')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const minutes = Math.max(1, Math.round(report.durationSec / 60));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={goHome} style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="close" size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('report.title')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero — fluency score */}
        <Animated.View entering={FadeInDown.delay(40).springify()}>
          <LinearGradient
            colors={[colors.blue, colors.blueDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroLabel}>{t('report.fluencyLabel')}</Text>
            <Text style={styles.heroScore}>{report.fluencyScore}</Text>
            <Text style={styles.heroSub}>
              {minutes} {t('common.minutes')} · {report.wordsSpoken}{' '}
              {t('report.wordsSpoken')} · {report.turnsCount}{' '}
              {t('report.turns')}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Sub-scores */}
        <Animated.View
          entering={FadeInDown.delay(110).springify()}
          style={styles.scoreGrid}
        >
          <ScoreTile
            icon="mic-outline"
            label={t('report.scorePronunciation')}
            value={report.pronunciationScore ?? report.fluencyScore}
            tint={colors.blue}
          />
          <ScoreTile
            icon="construct-outline"
            label={t('report.scoreGrammar')}
            value={report.grammarScore ?? report.fluencyScore}
            tint={colors.purple}
          />
          <ScoreTile
            icon="library-outline"
            label={t('report.scoreVocabulary')}
            value={report.vocabularyScore ?? report.fluencyScore}
            tint={colors.orange}
          />
        </Animated.View>

        {/* AI summary */}
        {report.overallSummary ? (
          <Animated.View entering={FadeInDown.delay(180).springify()}>
            <SectionCard
              icon="sparkles"
              iconColor={colors.blueDark}
              iconBg={colors.blueLight}
              title={t('report.summary')}
            >
              <Text style={styles.bodyText}>{report.overallSummary}</Text>
            </SectionCard>
          </Animated.View>
        ) : null}

        {/* Word mistakes */}
        {report.wordMistakes && report.wordMistakes.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(240).springify()}>
            <SectionCard
              icon="alert-circle"
              iconColor={colors.red}
              iconBg={colors.redSoft}
              title={t('report.wordMistakes')}
              count={report.wordMistakes.length}
            >
              {report.wordMistakes.map((m, i) => (
                <MistakeRow key={i} m={m} />
              ))}
            </SectionCard>
          </Animated.View>
        ) : null}

        {/* Mispronounced words */}
        {report.mispronouncedWords && report.mispronouncedWords.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <SectionCard
              icon="volume-medium"
              iconColor={colors.orange}
              iconBg={colors.orangeSoft}
              title={t('report.mispronounced')}
              count={report.mispronouncedWords.length}
            >
              {report.mispronouncedWords.map((p, i) => (
                <PronunciationRow key={i} p={p} />
              ))}
            </SectionCard>
          </Animated.View>
        ) : null}

        {/* Strengths */}
        {report.strengths && report.strengths.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(360).springify()}>
            <SectionCard
              icon="trending-up"
              iconColor={colors.green}
              iconBg={colors.greenSoft}
              title={t('report.strengths')}
            >
              {report.strengths.map((s, i) => (
                <BulletRow key={i} text={s} bullet="✓" tint={colors.green} />
              ))}
            </SectionCard>
          </Animated.View>
        ) : null}

        {/* Areas to improve */}
        {report.areasToImprove && report.areasToImprove.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(420).springify()}>
            <SectionCard
              icon="bulb"
              iconColor="#E0A800"
              iconBg="#FFF6DD"
              title={t('report.areasToImprove')}
            >
              {report.areasToImprove.map((s, i) => (
                <BulletRow
                  key={i}
                  text={s}
                  bullet="→"
                  tint={colors.orange}
                />
              ))}
            </SectionCard>
          </Animated.View>
        ) : null}

        {/* Best sentence */}
        {report.bestSentence ? (
          <Animated.View entering={FadeInDown.delay(480).springify()}>
            <SectionCard
              icon="trophy"
              iconColor="#E0A800"
              iconBg="#FFF6DD"
              title={t('report.bestSentence')}
            >
              <Text style={styles.bestSentence}>"{report.bestSentence}"</Text>
            </SectionCard>
          </Animated.View>
        ) : null}

        {/* Encouragement */}
        {report.encouragement ? (
          <Animated.View
            entering={FadeInDown.delay(540).springify()}
            style={styles.encouragement}
          >
            <Text style={styles.encouragementText}>
              {report.encouragement}
            </Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Pressable
            onPress={goHome}
            style={({ pressed }) => [
              styles.cta,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Ionicons name="home" size={18} color={colors.card} />
            <Text style={styles.ctaText}>{t('report.backHome')}</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ScoreTile({
  icon,
  label,
  value,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <View style={styles.scoreTile}>
      <View style={[styles.scoreIcon, { backgroundColor: `${tint}1A` }]}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <Text style={styles.scoreValue}>{value}</Text>
      <Text style={styles.scoreLabel}>{label}</Text>
    </View>
  );
}

function SectionCard({
  icon,
  iconColor,
  iconBg,
  title,
  count,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {typeof count === 'number' ? (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function MistakeRow({ m }: { m: WordMistake }) {
  return (
    <View style={styles.mistakeRow}>
      <View style={styles.mistakeTypeBadge}>
        <Text style={styles.mistakeTypeText}>{MISTAKE_TYPE_LABEL[m.type]}</Text>
      </View>
      <View style={styles.mistakeBody}>
        <View style={styles.diffRow}>
          <Text style={styles.wrong}>{m.original}</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.muted} />
          <Text style={styles.correct}>{m.correction}</Text>
        </View>
        <Text style={styles.explainText}>{m.explanationVi}</Text>
      </View>
    </View>
  );
}

function PronunciationRow({ p }: { p: MispronouncedWord }) {
  return (
    <View style={styles.pronRow}>
      <View style={styles.pronWordCol}>
        <Text style={styles.pronWord}>{p.word}</Text>
        <Text style={styles.pronIpa}>{p.ipa}</Text>
      </View>
      <Text style={styles.pronTip}>{p.tipVi}</Text>
    </View>
  );
}

function BulletRow({
  text,
  bullet,
  tint,
}: {
  text: string;
  bullet: string;
  tint: string;
}) {
  return (
    <View style={styles.bulletRow}>
      <Text style={[styles.bullet, { color: tint }]}>{bullet}</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
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
    fontSize: 16,
    color: colors.ink,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.h2,
    color: colors.ink,
    marginTop: spacing.md,
  },
  loadingSub: {
    ...typography.body,
    color: colors.ink2,
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.ink2,
    textAlign: 'center',
  },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroLabel: {
    ...typography.micro,
    color: colors.card,
    opacity: 0.85,
  },
  heroScore: {
    fontSize: 64,
    fontWeight: '900',
    color: colors.card,
    letterSpacing: -2,
    lineHeight: 70,
  },
  heroSub: {
    ...typography.small,
    color: colors.card,
    opacity: 0.9,
    textAlign: 'center',
  },
  scoreGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  scoreTile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6,
  },
  scoreIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    ...typography.h1,
    fontSize: 22,
    color: colors.ink,
  },
  scoreLabel: {
    ...typography.caption,
    color: colors.ink2,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.ink,
    flex: 1,
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.ink2,
  },
  sectionBody: {
    padding: spacing.md,
    gap: spacing.md,
  },
  bodyText: {
    ...typography.body,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 21,
  },
  // Mistake row
  mistakeRow: {
    gap: 6,
    paddingBottom: 4,
  },
  mistakeTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.redSoft,
  },
  mistakeTypeText: {
    ...typography.caption,
    color: colors.red,
    fontWeight: '700',
    fontSize: 10,
  },
  mistakeBody: { gap: 4 },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  wrong: {
    ...typography.body,
    fontSize: 14,
    color: colors.red,
    textDecorationLine: 'line-through',
  },
  correct: {
    ...typography.body,
    fontSize: 14,
    color: colors.green,
    fontWeight: '700',
  },
  explainText: {
    ...typography.small,
    color: colors.ink2,
    fontStyle: 'italic',
  },
  // Pronunciation row
  pronRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingBottom: 4,
  },
  pronWordCol: {
    minWidth: 90,
  },
  pronWord: {
    ...typography.h3,
    color: colors.ink,
  },
  pronIpa: {
    ...typography.caption,
    color: colors.muted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  pronTip: {
    ...typography.small,
    color: colors.ink,
    flex: 1,
    lineHeight: 19,
  },
  // Bullet rows
  bulletRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  bullet: {
    ...typography.h3,
    fontWeight: '900',
    width: 18,
  },
  bulletText: {
    ...typography.body,
    fontSize: 14,
    color: colors.ink,
    flex: 1,
    lineHeight: 20,
  },
  bestSentence: {
    ...typography.body,
    fontSize: 16,
    color: colors.ink,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  encouragement: {
    backgroundColor: colors.blueLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  encouragementText: {
    ...typography.body,
    color: colors.blueDark,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  cta: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.md,
  },
  ctaText: {
    ...typography.h2,
    color: colors.card,
  },
  linkBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  linkText: {
    ...typography.body,
    color: colors.ink2,
    textDecorationLine: 'underline',
  },
});
