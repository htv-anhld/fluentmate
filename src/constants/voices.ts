import type { AIVoice } from '@/types';

export const VOICES: AIVoice[] = [
  {
    id: 'sarah',
    name: 'Sarah',
    accent: 'us-female',
    elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL',
    gradient: ['#4A9FFF', '#3B7FD9'],
  },
  {
    id: 'liam',
    name: 'Liam',
    accent: 'us-male',
    elevenLabsVoiceId: 'TX3LPaxmHKxFdv7VOQHJ',
    gradient: ['#7C5CD3', '#5639B7'],
  },
  {
    id: 'emma',
    name: 'Emma',
    accent: 'uk-female',
    elevenLabsVoiceId: 'XB0fDUnXU5powFXDhCwa',
    gradient: ['#FF8C42', '#E5732A'],
  },
  {
    id: 'oliver',
    name: 'Oliver',
    accent: 'uk-male',
    elevenLabsVoiceId: 'pqHfZKP75CvOlQylNhV4',
    gradient: ['#4FC978', '#2E9858'],
  },
  {
    id: 'james',
    name: 'James',
    accent: 'au-male',
    elevenLabsVoiceId: 'cgSgspJ2msm6clMCkdW9',
    gradient: ['#FF6B6B', '#D14545'],
  },
];

export const ACCENT_LABEL: Record<AIVoice['accent'], string> = {
  'us-female': 'US · Female',
  'us-male': 'US · Male',
  'uk-female': 'UK · Female',
  'uk-male': 'UK · Male',
  'au-male': 'AU · Male',
};

export function getVoice(id: string): AIVoice {
  return VOICES.find((v) => v.id === id) ?? VOICES[0]!;
}

/** Map our voice id → native TTS locale + gender for expo-speech. */
export const VOICE_NATIVE_HINT: Record<
  AIVoice['id'],
  { language: string; gender: 'male' | 'female'; pitch: number }
> = {
  sarah: { language: 'en-US', gender: 'female', pitch: 1.05 },
  liam: { language: 'en-US', gender: 'male', pitch: 0.95 },
  emma: { language: 'en-GB', gender: 'female', pitch: 1.05 },
  oliver: { language: 'en-GB', gender: 'male', pitch: 0.95 },
  james: { language: 'en-AU', gender: 'male', pitch: 0.95 },
};
