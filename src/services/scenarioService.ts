import { api } from './api';
import { supabase, isSupabaseConfigured } from './supabase';
import type {
  Scenario,
  ScenarioCategory,
  CEFRLevel,
  KeyPhrase,
} from '@/types';

export type ScenarioListParams = {
  category?: ScenarioCategory;
  level?: CEFRLevel;
  page?: number;
  limit?: number;
};

export type Paginated<T> = { data: T[]; total: number };

type ScenarioRow = {
  id: string;
  title: string;
  title_vi: string | null;
  category: ScenarioCategory;
  level: CEFRLevel;
  duration_min: number | null;
  goal: string | null;
  system_prompt: string;
  icon_emoji: string | null;
  is_generated: boolean;
  key_phrases?: {
    id: string;
    english: string;
    vietnamese: string | null;
    ipa: string | null;
    audio_url: string | null;
  }[];
};

function mapScenario(row: ScenarioRow): Scenario {
  const keyPhrases: KeyPhrase[] =
    row.key_phrases?.map((kp) => ({
      id: kp.id,
      english: kp.english,
      vietnamese: kp.vietnamese ?? '',
      ipa: kp.ipa ?? '',
      audioUrl: kp.audio_url ?? undefined,
    })) ?? [];

  return {
    id: row.id,
    title: row.title,
    titleVi: row.title_vi ?? row.title,
    category: row.category,
    level: row.level,
    durationMin: row.duration_min ?? 5,
    goal: row.goal ?? '',
    systemPrompt: row.system_prompt,
    iconEmoji: row.icon_emoji ?? '💬',
    isGenerated: row.is_generated,
    keyPhrases,
  };
}

export const scenarioService = {
  async list(params: ScenarioListParams = {}): Promise<Paginated<Scenario>> {
    if (!isSupabaseConfigured) {
      return api<Paginated<Scenario>>('/v1/scenarios', { query: params });
    }
    let q = supabase
      .from('scenarios')
      .select('*, key_phrases(*)')
      .order('created_at', { ascending: false });
    if (params.category) q = q.eq('category', params.category);
    if (params.level) q = q.eq('level', params.level);
    if (params.limit) q = q.limit(params.limit);
    const { data, error } = await q;
    if (error) throw error;
    const mapped = (data as ScenarioRow[]).map(mapScenario);
    return { data: mapped, total: mapped.length };
  },

  async getById(id: string): Promise<Scenario> {
    if (!isSupabaseConfigured) {
      return api<Scenario>(`/v1/scenarios/${id}`);
    }
    const { data, error } = await supabase
      .from('scenarios')
      .select('*, key_phrases(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return mapScenario(data as ScenarioRow);
  },

  async recommended(level?: CEFRLevel): Promise<Scenario> {
    if (!isSupabaseConfigured) {
      return api<Scenario>('/v1/scenarios/recommended', { query: { level } });
    }
    let q = supabase
      .from('scenarios')
      .select('*, key_phrases(*)')
      .eq('is_generated', false)
      .limit(10);
    if (level) q = q.eq('level', level);
    const { data, error } = await q;
    if (error) throw error;
    const rows = data as ScenarioRow[];
    if (rows.length === 0) {
      // Fallback: any scenario
      const { data: any2, error: err2 } = await supabase
        .from('scenarios')
        .select('*, key_phrases(*)')
        .limit(1);
      if (err2 || !any2 || any2.length === 0)
        throw err2 ?? new Error('No scenarios available');
      return mapScenario(any2[0] as ScenarioRow);
    }
    const idx = Math.floor(Math.random() * rows.length);
    return mapScenario(rows[idx]!);
  },

  async generate(topic?: string): Promise<Scenario> {
    if (!isSupabaseConfigured) {
      return api<Scenario>('/v1/scenarios/generate', {
        method: 'POST',
        body: { topic },
      });
    }
    // True generation needs an Edge Function calling Claude.
    // For now: insert a placeholder row marked as generated.
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    const { data, error } = await supabase
      .from('scenarios')
      .insert({
        title: topic ?? 'AI generated practice',
        title_vi: topic ?? 'AI tự tạo',
        category: 'social',
        level: 'B1',
        duration_min: 8,
        goal: 'AI-generated practice',
        icon_emoji: '✨',
        is_generated: true,
        generated_for: uid,
      })
      .select('*, key_phrases(*)')
      .single();
    if (error) throw error;
    return mapScenario(data as ScenarioRow);
  },
};
