import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

/**
 * Plays audio from a local file URI or remote URL.
 * Single-instance — calling play() while another sound is playing
 * unloads the previous one first.
 */
export function useAudioPlayback() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playingUri, setPlayingUri] = useState<string | null>(null);

  const stop = useCallback(async () => {
    const s = soundRef.current;
    soundRef.current = null;
    setPlayingUri(null);
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

  const play = useCallback(
    async (uri: string) => {
      await stop();
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
        );
        soundRef.current = sound;
        setPlayingUri(uri);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            setPlayingUri(null);
            sound.unloadAsync().catch(() => {});
            soundRef.current = null;
          }
        });
      } catch {
        setPlayingUri(null);
      }
    },
    [stop],
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { play, stop, playingUri };
}
