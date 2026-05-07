import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import i18n from 'i18next';
import { supabase, isSupabaseConfigured } from '@/services/supabase';

export type RecordingState = 'idle' | 'recording' | 'transcribing';

export type TranscribeResult = {
  transcript: string;
  confidence: number;
  detectedLanguage?: string;
};

/**
 * Records audio via expo-av, then transcribes via Supabase
 * `transcribe-audio` Edge Function (Deepgram).
 */
export function useAudioRecording() {
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Request permission on mount.
  useEffect(() => {
    Audio.requestPermissionsAsync().catch(() => {});
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        // canAskAgain=false means the OS won't show the prompt anymore — the
        // user has to flip the switch in Settings manually. Show a clear path.
        const t = (key: string): string => i18n.t(key) as string;
        const canAsk = perm.canAskAgain;
        Alert.alert(
          t('audio.micDeniedTitle'),
          canAsk
            ? t('audio.micDeniedRetryBody')
            : t('audio.micDeniedSettingsBody'),
          canAsk
            ? [{ text: t('common.ok') }]
            : [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('common.openSettings'),
                  onPress: () => {
                    if (Platform.OS === 'ios') {
                      Linking.openURL('app-settings:').catch(() => {});
                    } else {
                      Linking.openSettings().catch(() => {});
                    }
                  },
                },
              ],
        );
        setError('mic-denied');
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await rec.startAsync();
      recordingRef.current = rec;
      setState('recording');
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Recording failed');
      setState('idle');
      return false;
    }
  }, []);

  /**
   * Stop recording → upload to transcribe Edge Function → return transcript + audio uri.
   * Audio file is kept so the user can replay their own voice.
   *
   * @param language Optional Deepgram language code ('en' | 'vi'). When set,
   *                 Deepgram is locked to that language for much higher accuracy
   *                 (auto-detect mis-identifies short English clips as Italian etc.).
   */
  const stopAndTranscribe = useCallback(async (
    language?: 'en' | 'vi',
  ): Promise<{
    uri: string | null;
    transcript: string | null;
    detectedLanguage?: string;
  }> => {
    const rec = recordingRef.current;
    if (!rec) return { uri: null, transcript: null };

    setState('transcribing');
    try {
      await rec.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const uri = rec.getURI();
      recordingRef.current = null;
      if (!uri) {
        setState('idle');
        return { uri: null, transcript: null };
      }

      // Read file as base64 (then keep the file for playback)
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!isSupabaseConfigured) {
        setState('idle');
        return { uri, transcript: null };
      }

      const { data, error: fnErr } = await supabase.functions.invoke(
        'transcribe-audio',
        {
          body: {
            audioBase64: base64,
            mimeType: 'audio/m4a',
            ...(language ? { language } : {}),
          },
        },
      );

      setState('idle');
      if (fnErr) {
        setError(fnErr.message);
        return { uri, transcript: null };
      }

      const result = data as TranscribeResult;
      return {
        uri,
        transcript: result?.transcript ?? null,
        detectedLanguage: result?.detectedLanguage,
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transcribe failed');
      setState('idle');
      return { uri: null, transcript: null };
    }
  }, []);

  const cancel = useCallback(async () => {
    const rec = recordingRef.current;
    if (rec) {
      try {
        await rec.stopAndUnloadAsync();
      } catch {
        /* ignore */
      }
      recordingRef.current = null;
    }
    setState('idle');
  }, []);

  return { state, error, start, stopAndTranscribe, cancel };
}
