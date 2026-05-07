export type CEFRLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2';

export type CoachPersonality = 'mentor' | 'friend' | 'strict' | 'funny';

export type GoalType = 'work' | 'travel' | 'exam' | 'casual';

export type ScenarioCategory =
  | 'workplace'
  | 'survival'
  | 'social'
  | 'travel'
  | 'academic'
  | 'industry';

export type VoiceAccent =
  | 'us-female'
  | 'us-male'
  | 'uk-female'
  | 'uk-male'
  | 'au-male';

export type SubscriptionTier = 'free' | 'pro';

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  level: CEFRLevel;
  goal: GoalType;
  industry: string;
  interests: string[];
  dailyGoalMinutes: number;
  reminderTime: string;
  coachPersonality: CoachPersonality;
  voiceId: string;
  timezone: string;
  subscriptionTier: SubscriptionTier;
};

export type KeyPhrase = {
  id: string;
  english: string;
  vietnamese: string;
  ipa: string;
  audioUrl?: string;
};

export type Scenario = {
  id: string;
  title: string;
  titleVi: string;
  category: ScenarioCategory;
  level: CEFRLevel;
  durationMin: number;
  goal: string;
  keyPhrases: KeyPhrase[];
  systemPrompt: string;
  iconEmoji: string;
  isGenerated: boolean;
};

export type GrammarIssueType =
  | 'tense'
  | 'agreement'
  | 'preposition'
  | 'article'
  | 'word-choice'
  | 'spelling'
  | 'word-order'
  | 'other';

export type GrammarIssue = {
  start: number;
  end: number;
  type: GrammarIssueType;
  original: string;
  correction: string;
  explanationVi: string;
};

export type ConversationRole = 'user' | 'ai';

export type ConversationTurn = {
  id: string;
  role: ConversationRole;
  text: string;
  audioUrl?: string;
  pronunciationScore?: number;
  fluencyScore?: number;
  grammarIssues?: GrammarIssue[];
  timestamp: number;
};

export type ConversationSpeed = 0.7 | 0.85 | 1.0 | 1.15 | 1.25;

export type ConversationDifficulty = 'easier' | 'match' | 'push';

export type SubtitleMode = 'always' | 'tap' | 'off';

export type AutoCorrectMode = 'inline' | 'end' | 'off';

export type ConversationSettings = {
  voiceId: string;
  speed: ConversationSpeed;
  showTranslation: boolean;
  difficulty: ConversationDifficulty;
  showSubtitle: SubtitleMode;
  autoCorrect: AutoCorrectMode;
};

export type WordMistake = {
  original: string;
  correction: string;
  explanationVi: string;
  type:
    | 'tense'
    | 'article'
    | 'preposition'
    | 'word-order'
    | 'plural'
    | 'word-choice'
    | 'spelling'
    | 'other';
};

export type MispronouncedWord = {
  word: string;
  ipa: string;
  tipVi: string;
};

export type SessionReport = {
  sessionId: string;
  durationSec: number;
  wordsSpoken: number;
  turnsCount: number;
  fluencyScore: number;
  pronunciationScore?: number;
  grammarScore?: number;
  vocabularyScore?: number;
  topPhrases?: string[];
  topMistakes?: string[];
  bestSentence?: string;
  date: string;
  // AI-generated fields (from session-report Edge Function)
  overallSummary?: string;
  wordMistakes?: WordMistake[];
  mispronouncedWords?: MispronouncedWord[];
  strengths?: string[];
  areasToImprove?: string[];
  encouragement?: string;
};

export type SkillRadar = {
  pronunciation: number;
  grammar: number;
  vocabulary: number;
  fluency: number;
  confidence: number;
};

export type DailyReport = {
  date: string;
  totalMinutes: number;
  sessionsCount: number;
  reviewedCardsCount: number;
  fluencyScore: number;
  fluencyDelta: number;
  newPhrases: string[];
  recurringMistake?: string;
  bestSentence?: string;
  weeklyTrend: number[];
  skills: SkillRadar;
};

export type AIVoice = {
  id: string;
  name: string;
  accent: VoiceAccent;
  elevenLabsVoiceId: string;
  gradient: [string, string];
};

export type VocabularyItem = {
  id: string;
  english: string;
  vietnamese: string;
  ipa?: string;
  contextSentence?: string;
  easiness: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: number;
};

export type OnboardingData = {
  language: string;
  reason: GoalType;
  testResult: CEFRLevel;
  industry: string;
  interests: string[];
  goal: GoalType;
  dailyMinutes: number;
  reminderHour: number;
  coachPersonality: CoachPersonality;
  email: string;
};
