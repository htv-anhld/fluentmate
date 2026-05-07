import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { SettingsScaffold } from '@/components/settings/SettingsScaffold';
import { SectionLabel } from '@/components/settings/SectionLabel';
import { PickerRow } from '@/components/settings/PickerRow';
import { useUserStore } from '@/store/useUserStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { CEFRLevel } from '@/types';

const LEVELS: {
  id: CEFRLevel;
  titleKey: string;
  descKey: string;
}[] = [
  { id: 'A0', titleKey: 'settings.levelA0Title', descKey: 'settings.levelA0Desc' },
  { id: 'A1', titleKey: 'settings.levelA1Title', descKey: 'settings.levelA1Desc' },
  { id: 'A2', titleKey: 'settings.levelA2Title', descKey: 'settings.levelA2Desc' },
  { id: 'B1', titleKey: 'settings.levelB1Title', descKey: 'settings.levelB1Desc' },
  { id: 'B2', titleKey: 'settings.levelB2Title', descKey: 'settings.levelB2Desc' },
];

export default function LevelSettings() {
  const { t } = useTranslation();
  const profileLevel = useUserStore((s) => s.profile.level);
  const testLevel = useOnboardingStore((s) => s.testLevel);
  const setProfile = useUserStore((s) => s.setProfile);
  const setTestLevel = useOnboardingStore((s) => s.setTestLevel);

  const current: CEFRLevel = (profileLevel ?? testLevel ?? 'A1') as CEFRLevel;

  const select = (level: CEFRLevel) => {
    setProfile({ level });
    setTestLevel(level);
  };

  const currentLevel = LEVELS.find((l) => l.id === current);
  const heroLabel = currentLevel
    ? t(currentLevel.titleKey).split(' · ')[1] ?? t('settings.levelHeroFallback')
    : t('settings.levelHeroFallback');

  return (
    <SettingsScaffold
      title={t('settings.levelTitle')}
      subtitle={t('settings.levelSubtitle')}
    >
      <LinearGradient
        colors={[colors.blue, colors.blueDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>{current}</Text>
        </View>
        <Text style={styles.heroTitle}>{heroLabel}</Text>
        <Text style={styles.heroSub}>{t('settings.levelHeroSub')}</Text>
      </LinearGradient>

      <View>
        <SectionLabel>{t('settings.levelSection')}</SectionLabel>
        <View style={{ gap: 10 }}>
          {LEVELS.map((l) => (
            <PickerRow
              key={l.id}
              selected={current === l.id}
              onPress={() => select(l.id)}
              title={t(l.titleKey)}
              detail={t(l.descKey)}
            />
          ))}
        </View>
      </View>

      <View style={styles.tip}>
        <Ionicons name="bulb" size={18} color="#E0A800" />
        <Text style={styles.tipText}>{t('settings.levelTip')}</Text>
      </View>

      <Pressable
        onPress={() => {
          /* Hook re-test flow when ready: nav to a /retest screen
             that reuses test logic without continuing onboarding. */
        }}
        disabled
        style={[styles.retest, { opacity: 0.5 }]}
      >
        <Ionicons name="refresh" size={18} color={colors.ink2} />
        <Text style={styles.retestText}>{t('settings.levelRetest')}</Text>
      </Pressable>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroBadge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeText: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.card,
    letterSpacing: -1,
  },
  heroTitle: {
    ...typography.h1,
    fontSize: 18,
    color: colors.card,
    marginTop: 4,
  },
  heroSub: {
    ...typography.small,
    fontSize: 13,
    color: colors.card,
    opacity: 0.9,
    textAlign: 'center',
  },
  tip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.blueLight,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  tipText: {
    ...typography.small,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 18,
    flex: 1,
  },
  retest: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  retestText: {
    ...typography.h3,
    color: colors.ink2,
  },
});
