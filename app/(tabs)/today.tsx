import { useCallback, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUserStore } from '@/store/useUserStore';
import { StreakCard } from '@/components/today/StreakCard';
import { StatCard } from '@/components/today/StatCard';
import { FeaturedLesson } from '@/components/today/FeaturedLesson';
import { LessonRow } from '@/components/today/LessonRow';
import {
  useStreak,
  useDailyReport,
  useContinueList,
} from '@/hooks/queries/useReports';
import { useRecommendedScenario } from '@/hooks/queries/useScenarios';
import { QUICK_ACTIONS } from '@/constants/mockData';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { queryKeys } from '@/hooks/queries/queryKeys';
import type { CEFRLevel } from '@/types';

function greetingKey(): string {
  const h = new Date().getHours();
  if (h < 11) return 'today.greetingMorning';
  if (h < 14) return 'today.greetingNoon';
  if (h < 18) return 'today.greetingAfternoon';
  return 'today.greetingEvening';
}

export default function TodayScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);

  const streakQ = useStreak();
  const dailyQ = useDailyReport();
  const recommendedQ = useRecommendedScenario(profile.level as CEFRLevel | undefined);
  const continueQ = useContinueList();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.reports.streak() }),
      qc.invalidateQueries({ queryKey: queryKeys.reports.daily() }),
      qc.invalidateQueries({ queryKey: ['fluentmate', 'scenarios', 'recommended'] }),
      qc.invalidateQueries({ queryKey: queryKeys.today.continueList() }),
    ]);
    setRefreshing(false);
  }, [qc]);

  const goalMin = useUserStore((s) => s.profile.goalMinutesPerDay) ?? 15;
  const minutesToday = dailyQ.data?.totalMinutes ?? 0;
  const wordsLearned = dailyQ.data?.newPhrases.length ?? 0;

  const isLoading =
    (streakQ.isLoading || dailyQ.isLoading || recommendedQ.isLoading) &&
    !streakQ.data &&
    !dailyQ.data;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Animated.View
          entering={FadeInDown.delay(50).springify()}
          style={styles.header}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{t(greetingKey())},</Text>
            <Text style={styles.name}>
              {profile.name?.split(' ').pop() ?? t('today.you')} 👋
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.avatar}
          >
            <Ionicons name="person" size={20} color={colors.blue} />
          </Pressable>
        </Animated.View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.blue} />
          </View>
        ) : null}

        {streakQ.data ? (
          <Animated.View entering={FadeInDown.delay(120).springify()}>
            <StreakCard
              streak={streakQ.data.currentStreak}
              weekDays={streakQ.data.weekDays}
            />
          </Animated.View>
        ) : null}

        <Animated.View
          entering={FadeInDown.delay(180).springify()}
          style={styles.statRow}
        >
          <StatCard
            icon="time"
            iconColor={colors.blue}
            iconBg={colors.blueLight}
            value={`${minutesToday}/${goalMin}`}
            label={t('today.minutesToday')}
            hint={
              minutesToday >= goalMin
                ? t('today.goalReached')
                : t('today.minutesLeft', {
                    count: Math.max(0, goalMin - minutesToday),
                  })
            }
          />
          <StatCard
            icon="bookmark"
            iconColor={colors.orange}
            iconBg={colors.orangeSoft}
            value={String(wordsLearned)}
            label={t('today.newPhrases')}
            hint={t('today.todayHint')}
          />
        </Animated.View>

        {recommendedQ.data ? (
          <Animated.View entering={FadeInDown.delay(240).springify()}>
            <FeaturedLesson scenario={recommendedQ.data} />
          </Animated.View>
        ) : null}

        {continueQ.data && continueQ.data.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>{t('today.sectionContinue')}</Text>
            <View style={styles.list}>
              {continueQ.data.map((item) => (
                <LessonRow
                  key={item.id}
                  icon={item.icon}
                  iconBg={item.iconBg}
                  title={item.title}
                  subtitle={item.subtitle}
                  progress={item.progress}
                  href={item.route as Href}
                />
              ))}
            </View>
          </View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={styles.sectionTitle}>{t('today.sectionQuickActions')}</Text>
          <View style={styles.quickRow}>
            {QUICK_ACTIONS.map((q, idx) => (
              <Animated.View
                key={q.id}
                entering={FadeInDown.delay(340 + idx * 60).springify()}
                style={{ flex: 1 }}
              >
                <Pressable
                  onPress={() => router.push(q.route as Href)}
                  style={({ pressed }) => [
                    styles.quickBtn,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                  ]}
                >
                  <View style={styles.quickIcon}>
                    <Ionicons name={q.icon} size={22} color={colors.blue} />
                  </View>
                  <Text style={styles.quickLabel}>{t(q.labelKey)}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  greeting: { ...typography.body, color: colors.ink2 },
  name: { ...typography.h1, color: colors.ink, marginTop: 2 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { paddingVertical: spacing.lg },
  statRow: { flexDirection: 'row', gap: spacing.md },
  sectionTitle: {
    ...typography.h2,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  list: { gap: spacing.md },
  quickRow: { flexDirection: 'row', gap: spacing.md },
  quickBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { ...typography.h3, color: colors.ink },
});
