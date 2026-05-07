import type { VocabularyItem } from '@/types';

/**
 * SM-2 spaced repetition algorithm (SuperMemo 2).
 * @param item Current vocabulary state.
 * @param quality 0-5 — 0 = total blackout, 3 = correct with hesitation, 5 = perfect recall.
 */
export function sm2Update(
  item: VocabularyItem,
  quality: number,
): VocabularyItem {
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  let { easiness, intervalDays, repetitions } = item;

  if (q < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * easiness);
    repetitions += 1;
  }

  easiness = Math.max(
    1.3,
    easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
  );

  const day = 24 * 60 * 60 * 1000;
  const nextReviewAt = Date.now() + intervalDays * day;

  return {
    ...item,
    easiness,
    intervalDays,
    repetitions,
    nextReviewAt,
  };
}
