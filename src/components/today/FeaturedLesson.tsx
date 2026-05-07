import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { Scenario } from '@/types';

type Props = { scenario: Scenario };

export function FeaturedLesson({ scenario }: Props) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const primary = isEn ? scenario.title : scenario.titleVi;
  const secondary = isEn ? scenario.titleVi : scenario.title;

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        router.push(`/conversation/${scenario.id}`);
      }}
      style={({ pressed }) => [pressed && { opacity: 0.92 }]}
    >
      <LinearGradient
        colors={[colors.blue, colors.blueDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.tag}>
          <Ionicons name="sparkles" size={12} color={colors.card} />
          <Text style={styles.tagText}>{t('today.featuredTagline')}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.emoji}>{scenario.iconEmoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={2}>
              {primary}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {secondary}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={14} color={colors.card} />
            <Text style={styles.metaText}>
              {scenario.durationMin} {t('common.minutes')}
            </Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="trending-up" size={14} color={colors.card} />
            <Text style={styles.metaText}>{scenario.level}</Text>
          </View>
          <View style={styles.startCta}>
            <Text style={styles.startText}>{t('common.startCta')}</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.blueDark} />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  tag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tagText: {
    ...typography.micro,
    color: colors.card,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emoji: { fontSize: 44 },
  title: {
    ...typography.h1,
    fontSize: 20,
    color: colors.card,
  },
  subtitle: {
    ...typography.small,
    color: colors.card,
    opacity: 0.85,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.small,
    color: colors.card,
    opacity: 0.95,
  },
  startCta: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
  },
  startText: {
    ...typography.h3,
    fontSize: 13,
    color: colors.blueDark,
  },
});
