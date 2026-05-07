import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  vocabularyService,
  type CreateVocabularyInput,
} from '@/services/vocabularyService';
import { queryKeys } from './queryKeys';
import type { VocabularyItem } from '@/types';

export function useVocabulary(params: { due?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.vocabulary.list(params),
    queryFn: () => vocabularyService.list(params),
    select: (r) => r.data,
  });
}

export function useAddVocabulary() {
  const qc = useQueryClient();
  return useMutation<VocabularyItem, Error, CreateVocabularyInput>({
    mutationFn: (input) => vocabularyService.create(input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['fluentmate', 'vocabulary'] }),
  });
}

export function useReviewVocabulary() {
  const qc = useQueryClient();
  return useMutation<VocabularyItem, Error, { id: string; quality: number }>({
    mutationFn: ({ id, quality }) => vocabularyService.review(id, quality),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fluentmate', 'vocabulary'] });
      qc.invalidateQueries({ queryKey: ['fluentmate', 'reports'] });
    },
  });
}
