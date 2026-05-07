import {
  ScrollView,
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
import { useScenarios } from '@/hooks/queries/useScenarios';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { Scenario } from '@/types';

const SHORTCUTS: {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  /** Match scenario by lowercased title (DB-friendly). */
  matchTitle: string;
  bg: [string, string];
}[] = [
  {
    id: 'free',
    emoji: '💬',
    title: 'Free chat',
    desc: 'Nói về bất cứ chuyện gì',
    matchTitle: 'meet a new colleague',
    bg: ['#4A9FFF', '#3B7FD9'],
  },
  {
    id: 'roleplay',
    emoji: '🎭',
    title: 'Role-play',
    desc: 'AI sẽ đóng vai trong tình huống',
    matchTitle: 'order coffee at a café',
    bg: ['#FF8C42', '#E5732A'],
  },
];

function ScenarioPill({ s }: { s: Scenario }) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const displayTitle = i18n.language === 'en' ? s.title : s.titleVi;
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        router.push(`/conversation/${s.id}`);
      }}
      style={({ pressed }) => [styles.pill, pressed && { opacity: 0.85 }]}
    >
      <Text style={styles.pillEmoji}>{s.iconEmoji}</Text>
      <Text style={styles.pillTitle} numberOfLines={1}>
        {displayTitle}
      </Text>
      <View style={styles.pillFooter}>
        <Text style={styles.pillLevel}>{s.level}</Text>
        <Text style={styles.pillDot}>·</Text>
        <Text style={styles.pillMeta}>
          {s.durationMin} {t('common.minutes')}
        </Text>
      </View>
    </Pressable>
  );
}

export default function TalkScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const scenariosQ = useScenarios();
  const list = scenariosQ.data ?? [];

  const SHORTCUT_T: Record<string, { title: string; desc: string }> = {
    free: {
      title: t('talk.freeChatTitle'),
      desc: t('talk.freeChatDesc'),
    },
    roleplay: {
      title: t('talk.rolePlayTitle'),
      desc: t('talk.rolePlayDesc'),
    },
  };

  const findByTitle = (title: string) =>
    list.find((s) => s.title.toLowerCase().trim() === title);

  const goShortcut = (matchTitle: string) => {
    Haptics.selectionAsync().catch(() => {});
    const s = findByTitle(matchTitle) ?? list[0];
    if (s) router.push(`/conversation/${s.id}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.h1}>{t('talk.title')}</Text>
          <Text style={styles.sub}>{t('talk.subtitle')}</Text>
        </View>

        <View style={styles.shortcuts}>
          {SHORTCUTS.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => goShortcut(s.matchTitle)}
              disabled={list.length === 0}
              style={({ pressed }) => [
                pressed && { opacity: 0.92 },
                list.length === 0 && { opacity: 0.5 },
              ]}
            >
              <LinearGradient
                colors={s.bg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.shortcut}
              >
                <Text style={styles.shortcutEmoji}>{s.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shortcutTitle}>
                    {SHORTCUT_T[s.id]?.title ?? s.title}
                  </Text>
                  <Text style={styles.shortcutDesc}>
                    {SHORTCUT_T[s.id]?.desc ?? s.desc}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={colors.card} />
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('talk.suggested')}</Text>
        {scenariosQ.isLoading && list.length === 0 ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.blue} />
          </View>
        ) : (
          <View style={styles.grid}>
            {list.slice(0, 6).map((s) => (
              <ScenarioPill key={s.id} s={s} />
            ))}
          </View>
        )}
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
  header: { paddingVertical: spacing.sm },
  h1: { ...typography.h1, color: colors.ink },
  sub: { ...typography.body, color: colors.ink2, marginTop: 4 },
  shortcuts: { gap: spacing.md },
  shortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  shortcutEmoji: { fontSize: 32 },
  shortcutTitle: { ...typography.h1, fontSize: 20, color: colors.card },
  shortcutDesc: {
    ...typography.small,
    color: colors.card,
    opacity: 0.9,
    marginTop: 2,
  },
  sectionTitle: { ...typography.h2, color: colors.ink },
  loadingWrap: { paddingVertical: 40, alignItems: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  pill: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6,
    minHeight: 110,
  },
  pillEmoji: { fontSize: 28 },
  pillTitle: { ...typography.h3, color: colors.ink },
  pillFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 'auto',
  },
  pillLevel: {
    ...typography.caption,
    color: colors.blueDark,
    fontWeight: '700',
  },
  pillDot: { ...typography.caption, color: colors.muted },
  pillMeta: { ...typography.caption, color: colors.muted },
});
