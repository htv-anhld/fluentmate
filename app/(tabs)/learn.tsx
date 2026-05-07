import { useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CATEGORY_ORDER } from '@/constants/scenarios';
import { useScenarios } from '@/hooks/queries/useScenarios';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { Scenario, ScenarioCategory } from '@/types';

type Filter = 'all' | ScenarioCategory;

function ScenarioCard({ s, onPress }: { s: Scenario; onPress: () => void }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const primary = isEn ? s.title : s.titleVi;
  const secondary = isEn ? s.titleVi : s.title;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.iconBox}>
        <Text style={styles.iconEmoji}>{s.iconEmoji}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {primary}
        </Text>
        <Text style={styles.cardSub} numberOfLines={1}>
          {secondary}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.levelChip}>
            <Text style={styles.levelText}>{s.level}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={colors.muted} />
            <Text style={styles.metaText}>
              {s.durationMin} {t('common.minutes')}
            </Text>
          </View>
          {s.isGenerated ? (
            <View style={styles.genChip}>
              <Ionicons name="sparkles" size={10} color={colors.purple} />
              <Text style={styles.genText}>{t('learn.ai')}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

export default function LearnScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const scenariosQ = useScenarios(
    filter === 'all' ? undefined : { category: filter },
  );

  const filtered = useMemo(() => {
    const items = scenariosQ.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.titleVi.toLowerCase().includes(q),
    );
  }, [scenariosQ.data, query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.h1}>{t('learn.title')}</Text>
        <Text style={styles.sub}>{t('learn.subtitle')}</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('learn.searchPlaceholder')}
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          autoCorrect={false}
        />
      </View>

      <View style={styles.chipsWrap}>
        {(['all', ...CATEGORY_ORDER] as Filter[]).map((id) => {
          const sel = filter === id;
          const label =
            id === 'all'
              ? t('learn.filterAll')
              : t(`learn.category.${id}`);
          return (
            <Pressable
              key={id}
              onPress={() => setFilter(id)}
              style={[
                styles.chip,
                sel && {
                  backgroundColor: colors.blueLight,
                  borderColor: colors.blue,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  sel && { color: colors.blueDark, fontWeight: '600' },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {scenariosQ.isLoading && !scenariosQ.data ? (
          <View style={styles.empty}>
            <ActivityIndicator color={colors.blue} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('learn.empty')}</Text>
          </View>
        ) : (
          filtered.map((s, idx) => (
            <Animated.View
              key={s.id}
              entering={FadeInDown.delay(40 + idx * 30).springify()}
            >
              <ScenarioCard
                s={s}
                onPress={() => router.push(`/conversation/${s.id}`)}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  h1: { ...typography.h1, color: colors.ink },
  sub: { ...typography.body, color: colors.ink2, marginTop: 4 },
  searchWrap: {
    marginHorizontal: spacing.lg,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.ink },
  chipsWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipText: {
    ...typography.h3,
    fontSize: 13,
    color: colors.ink2,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 28 },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { ...typography.h3, color: colors.ink },
  cardSub: { ...typography.small, color: colors.muted },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  levelChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.blueLight,
  },
  levelText: {
    ...typography.caption,
    color: colors.blueDark,
    fontWeight: '700',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: { ...typography.caption, color: colors.muted },
  genChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.purpleLight,
  },
  genText: {
    ...typography.caption,
    color: colors.purple,
    fontWeight: '700',
  },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { ...typography.body, color: colors.muted },
});
