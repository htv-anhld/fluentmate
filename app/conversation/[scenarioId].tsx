import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Bubble } from '@/components/conversation/Bubble';
import { MicButton, type MicState } from '@/components/conversation/MicButton';
import { KeyPhraseStrip } from '@/components/conversation/KeyPhraseStrip';
import { TypingIndicator } from '@/components/conversation/TypingIndicator';
import { useScenario } from '@/hooks/queries/useScenarios';
import {
  useStartConversation,
  useSendTurn,
} from '@/hooks/queries/useConversation';
import { useTranslate } from '@/hooks/queries/useTranslate';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { getDialog } from '@/constants/scenarioDialog';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { useTTS } from '@/hooks/useTTS';
import { colors, spacing, typography } from '@/constants/theme';
import type { ConversationTurn } from '@/types';

let userReplyIdx = 0;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ConversationScreen() {
  const router = useRouter();
  const { scenarioId } = useLocalSearchParams<{ scenarioId: string }>();
  const scenarioQ = useScenario(scenarioId);
  const showTranslation = usePreferencesStore((s) => s.showTranslation);
  const setShowTranslation = usePreferencesStore((s) => s.setShowTranslation);

  const startMut = useStartConversation();
  const turnMut = useSendTurn();
  const translateMut = useTranslate();

  const recorder = useAudioRecording();
  const playback = useAudioPlayback();
  const targetLang = useOnboardingStore((s) => s.language);
  const tts = useTTS();
  const { t, i18n } = useTranslation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [micState, setMicState] = useState<MicState>('idle');
  const listRef = useRef<FlatList<ConversationTurn>>(null);

  // Start session when scenario loads.
  useEffect(() => {
    if (!scenarioQ.data || sessionId) return;
    let cancelled = false;
    startMut.mutateAsync({ scenarioId: scenarioQ.data.id }).then((res) => {
      if (cancelled) return;
      setSessionId(res.sessionId);
      setTurns([
        {
          id: uid(),
          role: 'ai',
          text: res.greeting.text,
          timestamp: Date.now(),
        },
      ]);
      // Speak greeting
      tts.speak(res.greeting.text);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioQ.data]);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [turns.length, micState]);

  useEffect(() => {
    userReplyIdx = 0;
    return () => {
      tts.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMicPress = async () => {
    if (!sessionId) return;

    if (micState === 'idle') {
      tts.stop();
      const ok = await recorder.start();
      if (ok) setMicState('recording');
      return;
    }

    if (micState === 'recording') {
      // Stop recording → transcribe via Deepgram → use as userText.
      //
      // Language strategy (driven by the "Bản dịch" toggle):
      //   showTranslation=false → user is practicing English → STT locked to en.
      //   showTranslation=true  → user wants help → speak Vietnamese, we'll
      //                            auto-translate the transcript to English.
      setMicState('processing');
      const sttLanguage: 'en' | 'vi' = showTranslation ? 'vi' : 'en';
      const { uri, transcript } = await recorder.stopAndTranscribe(sttLanguage);

      // Fallback to scenario sample if transcribe failed (e.g. simulator with no mic)
      let userText = transcript?.trim() ?? '';
      const originalSpoken = userText; // before any translation
      if (!userText) {
        const dialog = getDialog({
          id: scenarioQ.data?.id,
          title: scenarioQ.data?.title,
        });
        userText =
          dialog.userReplies[userReplyIdx % dialog.userReplies.length]!;
        userReplyIdx += 1;
      }

      // If user spoke Vietnamese (translate mode), translate to English so the
      // bubble + AI conversation stays in English.
      if (sttLanguage === 'vi' && originalSpoken) {
        try {
          const tr = await translateMut.mutateAsync({
            text: originalSpoken,
            targetLang: 'en',
          });
          if (tr.translation) {
            userText = tr.translation;
          }
        } catch {
          /* keep original Vietnamese transcript on translation failure */
        }
      }

      const userTurn: ConversationTurn = {
        id: uid(),
        role: 'user',
        text: userText,
        audioUrl: uri ?? undefined,
        timestamp: Date.now(),
      };
      setTurns((t) => [...t, userTurn]);

      const sendTurn = async (): Promise<void> => {
        try {
          const res = await turnMut.mutateAsync({ sessionId, userText });
          const aiTurn: ConversationTurn = {
            id: uid(),
            role: 'ai',
            text: res.text,
            timestamp: Date.now(),
          };
          setTurns((t) =>
            t
              .map((it) =>
                it.id === userTurn.id
                  ? {
                      ...it,
                      fluencyScore: res.feedback?.fluencyScore,
                      pronunciationScore: res.feedback?.pronunciationScore,
                    }
                  : it,
              )
              .concat([aiTurn]),
          );
          tts.speak(res.text);
          setMicState('speaking');
          setTimeout(() => setMicState('idle'), 1500);
        } catch (err) {
          setMicState('idle');
          Alert.alert(
            t('conversation.sendErrorTitle'),
            err instanceof Error ? err.message : t('conversation.sendErrorBody'),
            [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('common.retry'), onPress: sendTurn },
            ],
          );
        }
      };

      await sendTurn();
    }
  };

  const handleEnd = () => {
    Alert.alert(
      t('conversation.endConfirmTitle'),
      t('conversation.endConfirmBody'),
      [
        { text: t('conversation.endConfirmContinue'), style: 'cancel' },
        {
          text: t('conversation.endConfirmEnd'),
          style: 'destructive',
          onPress: () => {
            // Defer the AI-evaluation call to the report screen so the user
            // sees a loading state immediately instead of waiting on Alert dismiss.
            if (sessionId) {
              router.replace({
                pathname: '/conversation/report',
                params: { sessionId },
              });
            } else {
              router.replace('/(tabs)/progress');
            }
          },
        },
      ],
    );
  };

  if (scenarioQ.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.blue} />
        </View>
      </SafeAreaView>
    );
  }

  if (scenarioQ.isError || !scenarioQ.data) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.loadingWrap}>
          <Ionicons name="alert-circle" size={48} color={colors.red} />
          <Text style={[styles.headerTitle, { marginTop: 16 }]}>
            {t('conversation.notFoundTitle')}
          </Text>
          <Text style={[styles.headerSub, { marginTop: 6 }]}>
            ID: {scenarioId}
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={{
              marginTop: 24,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: colors.blue,
            }}
          >
            <Text style={{ color: colors.card, fontWeight: '700' }}>
              {t('common.back')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const scenario = scenarioQ.data;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={handleEnd} style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="close" size={20} color={colors.ink} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>{scenario.iconEmoji}</Text>
          <View>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {i18n.language === 'en' ? scenario.title : scenario.titleVi}
            </Text>
            <Text style={styles.headerSub}>
              {scenario.level} · {scenario.durationMin} {t('common.minutes')}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/conversation/settings')}
          style={styles.headerBtn}
          hitSlop={8}
        >
          <Ionicons name="options" size={18} color={colors.ink} />
        </Pressable>
      </View>

      <KeyPhraseStrip phrases={scenario.keyPhrases} />

      <FlatList
        ref={listRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={turns}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <Bubble
            turn={item}
            showTranslation={showTranslation}
            targetLang={targetLang}
            onPlay={() => {
              if (item.role === 'user' && item.audioUrl) {
                tts.stop();
                playback.play(item.audioUrl);
              } else {
                playback.stop();
                tts.speak(item.text);
              }
            }}
          />
        )}
        ListFooterComponent={
          micState === 'processing' ? <TypingIndicator /> : null
        }
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => setShowTranslation(!showTranslation)}
            style={[
              styles.toggle,
              {
                backgroundColor: showTranslation
                  ? colors.blueLight
                  : colors.bg,
                borderColor: showTranslation ? colors.blue : colors.line,
              },
            ]}
            hitSlop={4}
          >
            <Ionicons
              name="language"
              size={14}
              color={showTranslation ? colors.blueDark : colors.muted}
            />
            <Text
              style={[
                styles.toggleText,
                {
                  color: showTranslation ? colors.blueDark : colors.muted,
                },
              ]}
            >
              {t('conversation.translation')}
            </Text>
          </Pressable>
        </View>
        <MicButton state={micState} onPress={handleMicPress} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: spacing.md,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerEmoji: { fontSize: 24 },
  headerTitle: {
    ...typography.h2,
    color: colors.ink,
    fontSize: 15,
  },
  headerSub: { ...typography.caption, color: colors.muted },
  list: { flex: 1 },
  listContent: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    alignItems: 'center',
    gap: 12,
  },
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
  },
  toggleText: { ...typography.caption, fontWeight: '600' },
});
