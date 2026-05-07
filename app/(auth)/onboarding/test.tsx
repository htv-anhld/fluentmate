import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { ScreenTitle } from '@/components/onboarding/ScreenTitle';
import { useOnboardingStore } from '@/store/onboardingStore';
import {
  QUIZ_QUESTIONS,
  evaluateLevel,
  LEVEL_LABEL,
  feedbackFor,
  type ScoredAnswer,
} from '@/utils/levelTest';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { CEFRLevel } from '@/types';

const TIER: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2'];

const SELF_ASSESS: { id: CEFRLevel; labelKey: string; descKey: string }[] = [
  { id: 'A0', labelKey: 'onboarding.testSelfA0Label', descKey: 'onboarding.testSelfA0Desc' },
  { id: 'A1', labelKey: 'onboarding.testSelfA1Label', descKey: 'onboarding.testSelfA1Desc' },
  { id: 'A2', labelKey: 'onboarding.testSelfA2Label', descKey: 'onboarding.testSelfA2Desc' },
  { id: 'B1', labelKey: 'onboarding.testSelfB1Label', descKey: 'onboarding.testSelfB1Desc' },
  { id: 'B2', labelKey: 'onboarding.testSelfB2Label', descKey: 'onboarding.testSelfB2Desc' },
];

type Mode = 'intro' | 'quiz' | 'self' | 'done';

export default function TestScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const recordAnswer = useOnboardingStore((s) => s.recordQuizAnswer);
  const setTestLevel = useOnboardingStore((s) => s.setTestLevel);

  const [mode, setMode] = useState<Mode>('intro');
  const [selfPick, setSelfPick] = useState<CEFRLevel | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [done, setDone] = useState(false);
  const [scoredAnswers, setScoredAnswers] = useState<ScoredAnswer[]>([]);

  const total = QUIZ_QUESTIONS.length;

  // ── Mode picker (intro) ─────────────────────────────────
  if (mode === 'intro') {
    return (
      <OnboardingScreen
        progress={0.55}
        ctaLabel={t('common.skip')}
        onCtaPress={() => router.push('/(auth)/onboarding/goal')}
        onSkip={() => router.push('/(auth)/onboarding/goal')}
      >
        <ScreenTitle
          title={t('onboarding.testIntroTitle')}
          subtitle={t('onboarding.testIntroSubtitle')}
        />
        <View style={styles.modeList}>
          <Pressable
            onPress={() => setMode('quiz')}
            style={({ pressed }) => [styles.modeCard, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.modeEmoji}>🎯</Text>
            <Text style={styles.modeTitle}>
              {t('onboarding.testModeQuizTitle')}
            </Text>
            <Text style={styles.modeDesc}>
              {t('onboarding.testModeQuizDesc')}
            </Text>
            <View style={[styles.modeBadge, { backgroundColor: colors.blueLight }]}>
              <Text style={[styles.modeBadgeText, { color: colors.blueDark }]}>
                {t('onboarding.testModeQuizBadge')}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setMode('self')}
            style={({ pressed }) => [styles.modeCard, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.modeEmoji}>📝</Text>
            <Text style={styles.modeTitle}>
              {t('onboarding.testModeSelfTitle')}
            </Text>
            <Text style={styles.modeDesc}>
              {t('onboarding.testModeSelfDesc')}
            </Text>
            <View style={[styles.modeBadge, { backgroundColor: colors.orangeSoft }]}>
              <Text style={[styles.modeBadgeText, { color: colors.orange }]}>
                {t('onboarding.testModeSelfBadge')}
              </Text>
            </View>
          </Pressable>
        </View>
      </OnboardingScreen>
    );
  }

  // ── Self-assessment picker ──────────────────────────────
  if (mode === 'self') {
    return (
      <OnboardingScreen
        progress={0.6}
        ctaLabel={t('common.continue')}
        ctaDisabled={!selfPick}
        onCtaPress={() => {
          if (!selfPick) return;
          setTestLevel(selfPick);
          router.push('/(auth)/onboarding/goal');
        }}
        onSkip={() => router.push('/(auth)/onboarding/goal')}
        onBack={() => setMode('intro')}
      >
        <ScreenTitle
          title={t('onboarding.testSelfTitle')}
          subtitle={t('onboarding.testSelfSubtitle')}
        />
        <View style={styles.selfList}>
          {SELF_ASSESS.map((l) => {
            const sel = selfPick === l.id;
            return (
              <Pressable
                key={l.id}
                onPress={() => setSelfPick(l.id)}
                style={[
                  styles.selfRow,
                  {
                    backgroundColor: sel ? colors.blueLight : colors.card,
                    borderColor: sel ? colors.blue : colors.line,
                    borderWidth: sel ? 1.5 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.selfBadge,
                    { backgroundColor: sel ? colors.blue : colors.bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.selfBadgeText,
                      { color: sel ? colors.card : colors.ink2 },
                    ]}
                  >
                    {l.id}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.selfLabel}>{t(l.labelKey)}</Text>
                  <Text style={styles.selfDesc}>{t(l.descKey)}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </OnboardingScreen>
    );
  }

  if (done) {
    const result = evaluateLevel(scoredAnswers);
    const correctTotal = scoredAnswers.filter((a) => a.correct).length;

    return (
      <OnboardingScreen
        progress={0.65}
        ctaLabel={t('common.continue')}
        onCtaPress={() => router.push('/(auth)/onboarding/goal')}
        onSkip={() => router.push('/(auth)/onboarding/goal')}
      >
        <ScreenTitle
          title={t('onboarding.testQuizTitle')}
          subtitle={t('onboarding.testResultSubtitle', {
            correct: correctTotal,
            total,
            got: result.totalPoints,
            max: result.maxPoints,
          })}
        />

        <View style={styles.resultBody}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{result.level}</Text>
          </View>
          <Text style={styles.levelTitle}>{LEVEL_LABEL[result.level]}</Text>
          <Text style={styles.levelSub}>
            {t('onboarding.testResultPercent', {
              pct: Math.round(result.percentage * 100),
            })}
          </Text>

          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>"{feedbackFor(result.level)}"</Text>
          </View>

          {/* Per-level breakdown */}
          <View style={styles.breakdown}>
            {TIER.filter(
              (lvl) =>
                lvl !== 'A0' && result.correctByLevel[lvl].total > 0,
            ).map((lvl) => {
              const stat = result.correctByLevel[lvl];
              const pct = stat.total > 0 ? stat.correct / stat.total : 0;
              return (
                <View key={lvl} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLevel}>{lvl}</Text>
                  <View style={styles.breakdownBar}>
                    <View
                      style={[
                        styles.breakdownFill,
                        {
                          width: `${pct * 100}%`,
                          backgroundColor:
                            pct >= 0.5 ? colors.green : colors.orange,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.breakdownStat}>
                    {stat.correct}/{stat.total}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.checkpoints}>
            {TIER.map((l) => {
              const active = l === result.level;
              return (
                <View
                  key={l}
                  style={[
                    styles.checkpoint,
                    {
                      backgroundColor: active ? colors.blue : colors.bg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.checkpointText,
                      {
                        color: active ? colors.card : colors.ink2,
                        fontWeight: active ? '700' : '500',
                      },
                    ]}
                  >
                    {l}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </OnboardingScreen>
    );
  }

  const q = QUIZ_QUESTIONS[index]!;

  const handleNext = () => {
    if (!selected) return;
    const isCorrect = selected === q.correct;

    const scored: ScoredAnswer = {
      questionId: q.id,
      selected,
      correct: isCorrect,
      difficulty: q.difficulty,
    };

    recordAnswer(scored);
    const nextScored = [...scoredAnswers, scored];
    setScoredAnswers(nextScored);

    if (index + 1 >= total) {
      const result = evaluateLevel(nextScored);
      setTestLevel(result.level);
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  return (
    <OnboardingScreen
      progress={0.55}
      ctaLabel={
        selected
          ? t('onboarding.testQuizCtaNext')
          : t('onboarding.testQuizCtaChoose')
      }
      ctaDisabled={!selected}
      onCtaPress={handleNext}
      onSkip={() => router.push('/(auth)/onboarding/goal')}
      onBack={() => {
        if (index > 0) {
          setIndex((i) => i - 1);
          setSelected(null);
        } else {
          setMode('intro');
        }
      }}
    >
      <ScreenTitle
        title={t('onboarding.testQuizTitle')}
        subtitle={t('onboarding.testQuizSubtitle', {
          i: index + 1,
          total,
          difficulty: q.difficulty,
        })}
      />

      <View style={styles.dots}>
        {QUIZ_QUESTIONS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                width: i === index ? 18 : 7,
                backgroundColor:
                  i === index
                    ? colors.blue
                    : i < index
                      ? colors.blueLight
                      : colors.line,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.body}>
        <View style={styles.promptCard}>
          <View style={styles.diffPill}>
            <Text style={styles.diffPillText}>{q.difficulty}</Text>
          </View>
          <Text style={styles.prompt}>{q.prompt}</Text>
        </View>

        <View style={styles.options}>
          {q.options.map((opt) => {
            const sel = selected === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setSelected(opt.key)}
                style={[
                  styles.option,
                  {
                    backgroundColor: sel ? colors.blueLight : colors.card,
                    borderColor: sel ? colors.blue : colors.line,
                    borderWidth: sel ? 1.5 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.bullet,
                    {
                      backgroundColor: sel ? colors.blue : colors.bg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.bulletText,
                      { color: sel ? colors.card : colors.ink2 },
                    ]}
                  >
                    {opt.key}
                  </Text>
                </View>
                <Text style={styles.optionText}>{opt.text}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  // Mode picker
  modeList: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  modeCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  modeEmoji: { fontSize: 40, marginBottom: 4 },
  modeTitle: { ...typography.h2, color: colors.ink },
  modeDesc: {
    ...typography.small,
    color: colors.ink2,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  modeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  modeBadgeText: { ...typography.micro, fontSize: 9 },
  // Self-assess
  selfList: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: 10,
  },
  selfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  selfBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfBadgeText: {
    ...typography.h3,
    fontSize: 14,
  },
  selfLabel: { ...typography.h2, fontSize: 15, color: colors.ink },
  selfDesc: {
    ...typography.small,
    color: colors.ink2,
    marginTop: 2,
  },
  // Quiz dots
  dots: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingTop: spacing.xl,
    paddingBottom: 14,
  },
  dot: { height: 7, borderRadius: 50 },
  body: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  promptCard: {
    backgroundColor: '#fcfcfe',
    borderRadius: radius.md,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    gap: 12,
  },
  diffPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.blueLight,
  },
  diffPillText: {
    ...typography.micro,
    color: colors.blueDark,
    fontWeight: '700',
  },
  prompt: {
    ...typography.h2,
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
  },
  options: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  bullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletText: { ...typography.h3 },
  optionText: {
    ...typography.body,
    color: colors.ink,
    fontSize: 15,
    flex: 1,
  },
  // Result phase
  resultBody: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  levelBadge: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.blueDark,
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  levelBadgeText: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.card,
    letterSpacing: -1,
  },
  levelTitle: {
    ...typography.h1,
    color: colors.ink,
  },
  levelSub: {
    ...typography.small,
    color: colors.muted,
  },
  bubble: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.blue,
    maxWidth: 320,
  },
  bubbleText: {
    ...typography.body,
    color: colors.ink,
    lineHeight: 20,
    textAlign: 'center',
  },
  breakdown: {
    width: '100%',
    gap: 8,
    marginTop: spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownLevel: {
    ...typography.h3,
    width: 28,
    color: colors.ink,
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownStat: {
    ...typography.small,
    color: colors.muted,
    width: 32,
    textAlign: 'right',
  },
  checkpoints: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.md,
  },
  checkpoint: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  checkpointText: {
    ...typography.caption,
    fontSize: 11,
  },
});
