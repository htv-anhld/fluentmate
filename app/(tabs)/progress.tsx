import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SegmentControl } from '@/components/ui/SegmentControl';
import { FluencyHero } from '@/components/report/FluencyHero';
import { SkillRadar } from '@/components/report/SkillRadar';
import { InsightCard } from '@/components/report/InsightCard';
import {
  useDailyReport,
  useWeeklyReport,
} from '@/hooks/queries/useReports';
import { queryKeys } from '@/hooks/queries/queryKeys';
import { colors, radius, spacing, typography } from '@/constants/theme';

type Mode = 'today' | 'week';

export default function ProgressScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('today');
  const [refreshing, setRefreshing] = useState(false);

  const dailyQ = useDailyReport();
  const weeklyQ = useWeeklyReport();
  const r = mode === 'today' ? dailyQ.data : weeklyQ.data;
  const loading = mode === 'today' ? dailyQ.isLoading : weeklyQ.isLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.reports.daily() }),
      qc.invalidateQueries({ queryKey: queryKeys.reports.weekly() }),
    ]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.h1}>{t('progress.title')}</Text>
      </View>

      <View style={styles.segWrap}>
        <SegmentControl<Mode>
          segments={[
            { id: 'today', label: t('progress.today') },
            { id: 'week', label: t('progress.week') },
          ]}
          value={mode}
          onChange={setMode}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading && !r ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.blue} />
          </View>
        ) : null}

        {r ? (
          <>
            <Animated.View entering={FadeInDown.delay(60).springify()}>
              <FluencyHero
                score={r.fluencyScore}
                delta={r.fluencyDelta}
                weeklyTrend={r.weeklyTrend}
              />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(140).springify()}
              style={styles.statsGrid}
            >
              <View style={styles.miniStat}>
                <Text style={styles.miniValue}>{r.totalMinutes}</Text>
                <Text style={styles.miniLabel}>
                  {t('progress.minutesLearned')}
                </Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={styles.miniValue}>{r.sessionsCount}</Text>
                <Text style={styles.miniLabel}>{t('progress.sessions')}</Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={styles.miniValue}>{r.newPhrases.length}</Text>
                <Text style={styles.miniLabel}>{t('progress.newPhrases')}</Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={styles.miniValue}>{r.reviewedCardsCount}</Text>
                <Text style={styles.miniLabel}>
                  {t('progress.cardsReviewed')}
                </Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(220).springify()}>
              <SkillRadar skills={r.skills} />
            </Animated.View>

            {r.newPhrases.length > 0 ? (
              <InsightCard
                icon="bookmark"
                iconColor={colors.orange}
                iconBg={colors.orangeSoft}
                title={t('progress.insightVocab')}
                body={r.newPhrases}
              />
            ) : null}

            {r.recurringMistake ? (
              <InsightCard
                icon="alert-circle"
                iconColor={colors.red}
                iconBg={colors.redSoft}
                title={t('progress.insightMistake')}
                body={r.recurringMistake}
              />
            ) : null}

            {r.bestSentence ? (
              <InsightCard
                icon="trophy"
                iconColor={colors.green}
                iconBg={colors.greenSoft}
                title={t('progress.insightBest')}
                body={`"${r.bestSentence}"`}
              />
            ) : null}

            <Animated.View entering={FadeInDown.delay(320).springify()}>
              <Pressable
                onPress={() => router.push('/review')}
                style={({ pressed }) => [
                  styles.cta,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
              >
                <Ionicons name="flash" size={18} color={colors.card} />
                <Text style={styles.ctaText}>{t('progress.reviewCta')}</Text>
              </Pressable>
            </Animated.View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  h1: { ...typography.h1, color: colors.ink },
  segWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  center: { paddingVertical: spacing.xxxl, alignItems: 'center' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  miniStat: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  miniValue: { ...typography.h1, fontSize: 22, color: colors.ink },
  miniLabel: { ...typography.small, color: colors.ink2, marginTop: 2 },
  cta: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.sm,
  },
  ctaText: { ...typography.h2, color: colors.card },
});
