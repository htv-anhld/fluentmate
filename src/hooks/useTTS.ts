import { useCallback, useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { usePreferencesStore } from '@/store/preferencesStore';
import { VOICE_NATIVE_HINT, getVoice } from '@/constants/voices';
import { supabase, isSupabaseConfigured } from '@/services/supabase';

type SpeakOpts = { onDone?: () => void };

/**
 * Premium TTS via ElevenLabs (Supabase Edge Function `synthesize-speech`).
 * Falls back to native expo-speech if ElevenLabs fails or Supabase not set.
 *
 * Voice + speed read from preferencesStore. Speed honored via Audio.Sound
 * playback rate when using ElevenLabs, or rate param when using expo-speech.
 */
export function useTTS() {
  const voiceId = usePreferencesStore((s) => s.voiceId);
  const speed = usePreferencesStore((s) => s.speed);

  const soundRef = useRef<Audio.Sound | null>(null);
  const matchedVoiceRef = useRef<string | undefined>(undefined);

  // Pre-resolve a native voice for fallback path.
  useEffect(() => {
    let cancelled = false;
    Speech.getAvailableVoicesAsync()
      .then((voices) => {
        if (cancelled) return;
        const hint = VOICE_NATIVE_HINT[voiceId];
        if (!hint) return;
        const candidate =
          voices.find(
            (v) =>
              v.language === hint.language &&
              v.quality === Speech.VoiceQuality.Enhanced,
          ) ??
          voices.find((v) => v.language === hint.language) ??
          voices.find((v) => v.language?.startsWith(hint.language.slice(0, 2)));
        matchedVoiceRef.current = candidate?.identifier;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [voiceId]);

  const stopAll = useCallback(async () => {
    Speech.stop();
    const s = soundRef.current;
    soundRef.current = null;
    if (s) {
      try {
        await s.stopAsync();
      } catch {
        /* ignore */
      }
      try {
        await s.unloadAsync();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const speakNative = useCallback(
    (text: string, opts: SpeakOpts) => {
      const hint = VOICE_NATIVE_HINT[voiceId];
      Speech.speak(text, {
        language: hint?.language ?? 'en-US',
        pitch: hint?.pitch ?? 1.0,
        rate: speed,
        voice: matchedVoiceRef.current,
        onDone: () => opts.onDone?.(),
      });
    },
    [voiceId, speed],
  );

  const speakElevenLabs = useCallback(
    async (text: string, opts: SpeakOpts) => {
      const voice = getVoice(voiceId);
      const { data, error } = await supabase.functions.invoke(
        'synthesize-speech',
        {
          body: { text, voiceId: voice.elevenLabsVoiceId },
        },
      );
      if (error || !data) throw error ?? new Error('No TTS data');
      const { audioBase64 } = data as { audioBase64: string };
      if (!audioBase64) throw new Error('Empty audio');

      const fileUri = `${FileSystem.cacheDirectory}tts-${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(fileUri, audioBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true, rate: speed, shouldCorrectPitch: true },
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          opts.onDone?.();
          sound.unloadAsync().catch(() => {});
          if (soundRef.current === sound) soundRef.current = null;
          FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
        }
      });
    },
    [voiceId, speed],
  );

  const speak = useCallback(
    async (text: string, opts: SpeakOpts = {}) => {
      if (!text) return;
      await stopAll();

      if (!isSupabaseConfigured) {
        speakNative(text, opts);
        return;
      }

      try {
        await speakElevenLabs(text, opts);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[tts] ElevenLabs failed → fallback expo-speech', e);
        speakNative(text, opts);
      }
    },
    [stopAll, speakElevenLabs, speakNative],
  );

  const stop = useCallback(() => {
    stopAll();
  }, [stopAll]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);

  return { speak, stop };
}
