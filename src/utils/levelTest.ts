import type { CEFRLevel } from '@/types';

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correct: 'A' | 'B' | 'C' | 'D';
  difficulty: CEFRLevel;
};

/** 7 questions covering A1 → B2. Order = ascending difficulty so user
 *  who only knows basics finishes feeling they tried. */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'What is this?',
    options: [
      { key: 'A', text: "It's a book" },
      { key: 'B', text: 'Book is it' },
      { key: 'C', text: 'This book' },
    ],
    correct: 'A',
    difficulty: 'A1',
  },
  {
    id: 'q2',
    prompt: 'She ___ to school every day.',
    options: [
      { key: 'A', text: 'go' },
      { key: 'B', text: 'goes' },
      { key: 'C', text: 'going' },
    ],
    correct: 'B',
    difficulty: 'A1',
  },
  {
    id: 'q3',
    prompt: 'I ___ coffee, but my brother does.',
    options: [
      { key: 'A', text: "don't like" },
      { key: 'B', text: 'no like' },
      { key: 'C', text: "doesn't like" },
    ],
    correct: 'A',
    difficulty: 'A2',
  },
  {
    id: 'q4',
    prompt: 'I have lived here ___ 2018.',
    options: [
      { key: 'A', text: 'for' },
      { key: 'B', text: 'in' },
      { key: 'C', text: 'since' },
    ],
    correct: 'C',
    difficulty: 'B1',
  },
  {
    id: 'q5',
    prompt: 'If I ___ rich, I would travel the world.',
    options: [
      { key: 'A', text: 'were' },
      { key: 'B', text: 'am' },
      { key: 'C', text: 'will be' },
    ],
    correct: 'A',
    difficulty: 'B1',
  },
  {
    id: 'q6',
    prompt: 'The book ___ by millions of readers.',
    options: [
      { key: 'A', text: 'reads' },
      { key: 'B', text: 'is read' },
      { key: 'C', text: 'has reading' },
    ],
    correct: 'B',
    difficulty: 'B2',
  },
  {
    id: 'q7',
    prompt: "By the time we arrived, the meeting ___.",
    options: [
      { key: 'A', text: 'already started' },
      { key: 'B', text: 'had already started' },
      { key: 'C', text: 'has already started' },
    ],
    correct: 'B',
    difficulty: 'B2',
  },
];

/** Difficulty → point value. */
const DIFFICULTY_WEIGHT: Record<CEFRLevel, number> = {
  A0: 0,
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
};

export type ScoredAnswer = {
  questionId: string;
  selected: string;
  correct: boolean;
  difficulty: CEFRLevel;
};

export type EvaluationResult = {
  level: CEFRLevel;
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  correctByLevel: Record<CEFRLevel, { correct: number; total: number }>;
};

/**
 * Evaluate CEFR level from weighted answers.
 *
 * Logic:
 *   1. Sum points for correct answers (each weighted by question difficulty).
 *   2. Compute percentage of max achievable.
 *   3. Bucket into CEFR level by percentage thresholds.
 *   4. Cap at the highest level where the user got at least one question right —
 *      avoids someone guessing one B2 right and being labeled B2.
 */
export function evaluateLevel(answers: ScoredAnswer[]): EvaluationResult {
  const correctByLevel: EvaluationResult['correctByLevel'] = {
    A0: { correct: 0, total: 0 },
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
  };

  let totalPoints = 0;
  let maxPoints = 0;

  for (const a of answers) {
    const w = DIFFICULTY_WEIGHT[a.difficulty];
    maxPoints += w;
    correctByLevel[a.difficulty].total += 1;
    if (a.correct) {
      totalPoints += w;
      correctByLevel[a.difficulty].correct += 1;
    }
  }

  if (maxPoints === 0) {
    return {
      level: 'A0',
      totalPoints: 0,
      maxPoints: 0,
      percentage: 0,
      correctByLevel,
    };
  }

  const percentage = totalPoints / maxPoints;

  // Percentage → coarse level
  let level: CEFRLevel;
  if (percentage < 0.15) level = 'A0';
  else if (percentage < 0.35) level = 'A1';
  else if (percentage < 0.55) level = 'A2';
  else if (percentage < 0.78) level = 'B1';
  else level = 'B2';

  // Cap by mastery: don't promote past a level if user got <50% at that level.
  // (e.g. 1/2 at B2 with everything else right shouldn't drop them, but 0/2 at B2 should cap at B1.)
  const tier: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2'];
  const proposed = tier.indexOf(level);
  let capped = proposed;
  for (let i = 0; i <= proposed; i++) {
    const t = tier[i]!;
    const stat = correctByLevel[t];
    if (stat.total > 0 && stat.correct / stat.total < 0.5) {
      capped = Math.min(capped, Math.max(0, i - 1));
    }
  }
  level = tier[capped] ?? 'A0';

  return {
    level,
    totalPoints,
    maxPoints,
    percentage,
    correctByLevel,
  };
}

export const LEVEL_LABEL: Record<CEFRLevel, string> = {
  A0: 'Newbie',
  A1: 'Elementary',
  A2: 'Pre-Intermediate',
  B1: 'Intermediate',
  B2: 'Upper-Intermediate',
};

export function feedbackFor(level: CEFRLevel): string {
  switch (level) {
    case 'A0':
      return 'Bắt đầu từ con số 0 — mình sẽ đi từng bước với bạn nhé!';
    case 'A1':
      return 'Bạn nắm được vài điểm cơ bản. Mình sẽ tập trung củng cố nền tảng.';
    case 'A2':
      return 'Bạn dùng được câu hàng ngày. Mình sẽ mở rộng vốn để bạn nói tự tin hơn.';
    case 'B1':
      return 'Tuyệt vời! Mình sẽ tạo lộ trình giúp bạn thảo luận đa dạng chủ đề.';
    case 'B2':
      return 'Trình độ rất tốt. Mình sẽ đẩy bạn lên fluency với chủ đề khó hơn.';
    default:
      return 'Mình sẽ tạo lộ trình phù hợp với bạn.';
  }
}
