import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { SegmentControl } from '@/components/ui/SegmentControl';
import { usePreferencesStore } from '@/store/preferencesStore';
import { VOICES, ACCENT_LABEL } from '@/constants/voices';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type {
  ConversationDifficulty,
  ConversationSpeed,
  SubtitleMode,
} from '@/types';

const SPEEDS: ConversationSpeed[] = [0.7, 0.85, 1.0, 1.15, 1.25];

export default function ConversationSettings() {
  const router = useRouter();
  const { t } = useTranslation();

  // Hydrate from store (prefs are the single source of truth).
  const storeVoice = usePreferencesStore((s) => s.voiceId);
  const storeSpeed = usePreferencesStore((s) => s.speed);
  const storeDifficulty = usePreferencesStore((s) => s.difficulty);
  const storeSubtitle = usePreferencesStore((s) => s.showSubtitle);

  const setVoice = usePreferencesStore((s) => s.setVoice);
  const setSpeedStore = usePreferencesStore((s) => s.setSpeed);
  const setDifficultyStore = usePreferencesStore((s) => s.setDifficulty);
  const setSubtitleStore = usePreferencesStore((s) => s.setSubtitle);

  const [voiceId, setVoiceId] = useState(storeVoice);
  const [speed, setSpeed] = useState<ConversationSpeed>(storeSpeed);
  const [difficulty, setDifficulty] =
    useState<ConversationDifficulty>(storeDifficulty);
  const [subtitle, setSubtitle] = useState<SubtitleMode>(storeSubtitle);

  const apply = () => {
    setVoice(voiceId);
    setSpeedStore(speed);
    setDifficultyStore(difficulty);
    setSubtitleStore(subtitle);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('conversation.settingsTitle')}</Text>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeBtn}
          hitSlop={8}
        >
          <Ionicons name="close" size={20} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.label}>{t('conversation.settingsVoice')}</Text>
          <View style={styles.voiceGrid}>
            {VOICES.map((v) => {
              const sel = voiceId === v.id;
              return (
                <Pressable
                  key={v.id}
                  onPress={() => setVoiceId(v.id)}
                  style={[
                    styles.voice,
                    {
                      borderColor: sel ? colors.blue : colors.line,
                      borderWidth: sel ? 2 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.voiceAvatar,
                      { backgroundColor: v.gradient[0] },
                    ]}
                  >
                    <Text style={styles.voiceLetter}>{v.name[0]}</Text>
                  </View>
                  <Text style={styles.voiceName}>{v.name}</Text>
                  <Text style={styles.voiceAccent}>{ACCENT_LABEL[v.accent]}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            {t('conversation.settingsSpeedWith', { speed })}
          </Text>
          <View style={styles.speedRow}>
            {SPEEDS.map((s) => {
              const sel = speed === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setSpeed(s)}
                  style={[
                    styles.speedTile,
                    {
                      backgroundColor: sel ? colors.blueLight : colors.card,
                      borderColor: sel ? colors.blue : colors.line,
                      borderWidth: sel ? 1.5 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.speedText,
                      { color: sel ? colors.blueDark : colors.ink },
                    ]}
                  >
                    {s}×
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('conversation.settingsDifficulty')}</Text>
          <SegmentControl<ConversationDifficulty>
            segments={[
              { id: 'easier', label: t('conversation.difficultyEasier') },
              { id: 'match', label: t('conversation.difficultyMatch') },
              { id: 'push', label: t('conversation.difficultyPush') },
            ]}
            value={difficulty}
            onChange={setDifficulty}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('conversation.settingsSubtitle')}</Text>
          <SegmentControl<SubtitleMode>
            segments={[
              { id: 'always', label: t('conversation.subtitleAlways') },
              { id: 'tap', label: t('conversation.subtitleTap') },
              { id: 'off', label: t('conversation.subtitleOff') },
            ]}
            value={subtitle}
            onChange={setSubtitle}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={apply}
          style={({ pressed }) => [styles.applyBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.applyText}>{t('common.applyCta')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.card },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  title: {
    ...typography.h1,
    fontSize: 20,
    color: colors.ink,
    flex: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.xl,
  },
  section: { gap: spacing.md },
  label: {
    ...typography.micro,
    color: colors.muted,
  },
  voiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  voice: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  voiceAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceLetter: {
    ...typography.h1,
    fontSize: 22,
    color: colors.card,
  },
  voiceName: { ...typography.h3, color: colors.ink },
  voiceAccent: { ...typography.caption, color: colors.muted },
  speedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  speedTile: {
    flex: 1,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: { ...typography.h3 },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  applyBtn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    ...typography.h2,
    color: colors.card,
  },
});
