import { api } from './api';
import { supabase, isSupabaseConfigured } from './supabase';
import { sm2Update } from '@/utils/sm2';
import type { VocabularyItem } from '@/types';

export type CreateVocabularyInput = Pick<
  VocabularyItem,
  'english' | 'vietnamese' | 'ipa' | 'contextSentence'
>;

type Row = {
  id: string;
  english: string;
  vietnamese: string | null;
  ipa: string | null;
  context_sentence: string | null;
  easiness: number;
  interval_days: number;
  repetitions: number;
  next_review_at: string;
};

function mapRow(row: Row): VocabularyItem {
  return {
    id: row.id,
    english: row.english,
    vietnamese: row.vietnamese ?? '',
    ipa: row.ipa ?? undefined,
    contextSentence: row.context_sentence ?? undefined,
    easiness: Number(row.easiness),
    intervalDays: row.interval_days,
    repetitions: row.repetitions,
    nextReviewAt: new Date(row.next_review_at).getTime(),
  };
}

export const vocabularyService = {
  async list(params: { due?: boolean } = {}): Promise<{
    data: VocabularyItem[];
    total: number;
  }> {
    if (!isSupabaseConfigured) {
      return api('/v1/vocabulary', { query: { due: params.due } });
    }
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) return { data: [], total: 0 };

    let q = supabase
      .from('vocabulary')
      .select('*')
      .eq('user_id', uid)
      .order('next_review_at', { ascending: true });

    if (params.due) {
      const today = new Date().toISOString().slice(0, 10);
      q = q.lte('next_review_at', today);
    }

    const { data, error } = await q;
    if (error) throw error;
    const items = (data as Row[]).map(mapRow);
    return { data: items, total: items.length };
  },

  async create(input: CreateVocabularyInput): Promise<VocabularyItem> {
    if (!isSupabaseConfigured) {
      return api('/v1/vocabulary', { method: 'POST', body: input });
    }
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vocabulary')
      .insert({
        user_id: uid,
        english: input.english,
        vietnamese: input.vietnamese,
        ipa: input.ipa,
        context_sentence: input.contextSentence,
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapRow(data as Row);
  },

  async review(id: string, quality: number): Promise<VocabularyItem> {
    if (!isSupabaseConfigured) {
      return api(`/v1/vocabulary/${id}/review`, {
        method: 'PUT',
        body: { quality },
      });
    }
    // Read current row, compute SM-2, update.
    const { data: existing, error: e1 } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('id', id)
      .single();
    if (e1) throw e1;
    const item = mapRow(existing as Row);
    const next = sm2Update(item, quality);
    const nextDate = new Date(next.nextReviewAt).toISOString().slice(0, 10);
    const { data: updated, error: e2 } = await supabase
      .from('vocabulary')
      .update({
        easiness: next.easiness,
        interval_days: next.intervalDays,
        repetitions: next.repetitions,
        next_review_at: nextDate,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (e2) throw e2;

    // Log the review for Progress aggregation. Fire-and-forget — don't block UI.
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (uid) {
      void supabase
        .from('review_sessions')
        .insert({ user_id: uid, vocabulary_id: id, quality });
    }

    return mapRow(updated as Row);
  },

  async remove(id: string): Promise<{ ok: true }> {
    if (!isSupabaseConfigured) {
      return api(`/v1/vocabulary/${id}`, { method: 'DELETE' });
    }
    const { error } = await supabase.from('vocabulary').delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
  },
};
