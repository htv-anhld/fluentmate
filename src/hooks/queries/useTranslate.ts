import { useMutation } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/services/supabase';

export type TranslateInput = {
  text: string;
  targetLang: 'vi' | 'en';
};

export type TranslateResult = {
  translation: string;
  sourceLang?: string;
  targetLang?: string;
};

async function translate(input: TranslateInput): Promise<TranslateResult> {
  if (!isSupabaseConfigured) {
    return { translation: `[${input.targetLang}] ${input.text}` };
  }
  const { data, error } = await supabase.functions.invoke('translate-text', {
    body: input,
  });
  if (error) throw error;
  return data as TranslateResult;
}

export function useTranslate() {
  return useMutation<TranslateResult, Error, TranslateInput>({
    mutationFn: translate,
  });
}
