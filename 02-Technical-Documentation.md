# FluentMate — Technical Documentation for Developers

> Version 1.0 · April 2026
> Dùng tài liệu này để implement React Native app + Backend

---

## 1. TECH STACK OVERVIEW

```
Mobile App
├── Expo SDK 54 (managed workflow + prebuild)
├── Expo Router v4 (file-based navigation)
├── Zustand (global state) + React Query (server state)
├── MMKV (local persistent storage)
├── expo-av (audio recording/playback)
├── react-native-reanimated 3 (animations)
├── react-native-skia (waveform visualization)
└── Tamagui or Restyle (design system tokens)

Backend
├── NestJS on Cloudflare Workers (global edge, low latency)
├── Supabase Postgres + pgvector (DB + vector search)
├── Supabase Auth (Apple/Google/Email)
├── Supabase Storage or R2 (voice recordings)
├── BullMQ + Redis (async jobs)
└── LLM Gateway (OpenRouter or custom router)

AI/ML Services
├── STT: Deepgram Nova-3 (primary) or Whisper API (fallback)
├── LLM: Claude Sonnet 4.7 (conversation) + GPT-4o-mini (short tasks)
├── TTS: ElevenLabs Turbo v2.5 (quality) or OpenAI TTS-1-HD (cost)
├── Pronunciation: Azure Speech Pronunciation Assessment API
├── VAD: Silero VAD on-device + semantic VAD server-side
├── Memory: Mem0 or custom pgvector implementation
└── Realtime: OpenAI Realtime API (hands-free Pro mode)

Analytics & Ops
├── PostHog (product analytics + A/B testing)
├── Sentry (error tracking)
├── Langfuse or Helicone (LLM observability)
└── EAS Build + EAS Update (CI/CD + OTA)
```

---

## 2. PROJECT STRUCTURE

```
fluentmate/
├── app/                          # Expo Router pages
│   ├── _layout.tsx               # Root layout (providers)
│   ├── (auth)/                   # Auth group
│   │   ├── login.tsx
│   │   └── onboarding/
│   │       ├── _layout.tsx       # Onboarding flow layout
│   │       ├── language.tsx      # Step 1
│   │       ├── reason.tsx        # Step 2
│   │       ├── test.tsx          # Step 3
│   │       ├── industry.tsx      # Step 4
│   │       ├── interests.tsx     # Step 5
│   │       ├── goal.tsx          # Step 6
│   │       ├── schedule.tsx      # Step 7
│   │       ├── coach.tsx         # Step 8
│   │       ├── signup.tsx        # Step 9
│   │       └── paywall.tsx       # Step 10
│   ├── (tabs)/                   # Main tab group
│   │   ├── _layout.tsx           # Tab bar layout
│   │   ├── today.tsx             # Screen 02
│   │   ├── learn.tsx             # Library
│   │   ├── talk.tsx              # Talk tab entry
│   │   ├── progress.tsx          # Screen 05
│   │   └── profile.tsx           # Screen 06
│   ├── conversation/
│   │   ├── [scenarioId].tsx      # Screen 03 — main conversation
│   │   └── settings.tsx          # Conv settings bottom sheet
│   ├── drill/
│   │   └── [scenarioId].tsx      # Screen 04
│   ├── grammar/
│   │   └── [lessonId].tsx        # Grammar flow
│   └── review.tsx                # Smart review flashcards
│
├── src/
│   ├── components/
│   │   ├── ui/                   # Primitives
│   │   │   ├── Button.tsx
│   │   │   ├── GlassCard.tsx
│   │   │   ├── SegmentControl.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── conversation/
│   │   │   ├── Bubble.tsx
│   │   │   ├── FixPanel.tsx
│   │   │   ├── MicButton.tsx
│   │   │   ├── KeyPhraseStrip.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── drill/
│   │   │   ├── TargetCard.tsx
│   │   │   ├── PhonemeGrid.tsx
│   │   │   ├── WaveformCompare.tsx
│   │   │   └── ScoreGrid.tsx
│   │   ├── report/
│   │   │   ├── FluencyHero.tsx
│   │   │   ├── InsightCard.tsx
│   │   │   ├── SkillRadar.tsx
│   │   │   └── StatsRow.tsx
│   │   ├── today/
│   │   │   ├── StreakCard.tsx
│   │   │   ├── FeaturedLesson.tsx
│   │   │   └── LessonRow.tsx
│   │   └── settings/
│   │       ├── SettingRow.tsx
│   │       ├── VoicePicker.tsx
│   │       └── ProfileCard.tsx
│   │
│   ├── hooks/
│   │   ├── useConversation.ts     # Core conversation orchestrator
│   │   ├── useRecording.ts        # Audio recording with VAD
│   │   ├── usePronunciation.ts    # Azure pronunciation scoring
│   │   ├── useSpacedRepetition.ts # SM-2 algorithm
│   │   └── useStreaming.ts        # SSE/WebSocket for LLM streaming
│   │
│   ├── services/
│   │   ├── api.ts                 # Base API client (fetch wrapper)
│   │   ├── aiService.ts           # Conversation turn handler
│   │   ├── ttsService.ts          # Text-to-speech
│   │   ├── sttService.ts          # Speech-to-text
│   │   ├── pronunciationService.ts
│   │   ├── reportService.ts       # Daily/weekly reports
│   │   └── scenarioService.ts     # Scenario CRUD + AI generation
│   │
│   ├── store/
│   │   ├── appStore.ts            # User profile, settings, streak
│   │   ├── conversationStore.ts   # Active conversation state
│   │   └── vocabularyStore.ts     # Saved words + review queue
│   │
│   ├── types/
│   │   └── index.ts               # All TypeScript types
│   │
│   ├── constants/
│   │   ├── theme.ts               # Design tokens
│   │   ├── voices.ts              # AI voice definitions
│   │   └── scenarios.ts           # Static scenario library
│   │
│   └── utils/
│       ├── sm2.ts                 # Spaced repetition algorithm
│       ├── audio.ts               # Audio helpers
│       └── scoring.ts             # Score calculations
│
├── assets/
│   ├── fonts/
│   │   ├── Fraunces-Variable.ttf
│   │   └── DMSans-Variable.ttf
│   ├── icon.png
│   └── splash.png
│
├── app.json
├── package.json
├── tsconfig.json
└── eas.json
```

---

## 3. DATA MODELS

### 3.1 Database Schema (Supabase Postgres)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  level TEXT CHECK (level IN ('A0','A1','A2','B1','B2','C1','C2')),
  goal TEXT CHECK (goal IN ('work','travel','exam','casual')),
  industry TEXT,
  interests TEXT[],
  daily_goal_minutes INT DEFAULT 15,
  reminder_time TIME DEFAULT '21:00',
  coach_personality TEXT DEFAULT 'mentor',
  voice_id TEXT DEFAULT 'sarah-us',
  native_language TEXT DEFAULT 'vi',
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  subscription_tier TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scenarios (static + AI-generated)
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_vi TEXT,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  duration_min INT,
  goal TEXT,
  system_prompt TEXT NOT NULL,
  icon_emoji TEXT,
  is_generated BOOLEAN DEFAULT FALSE,
  generated_for UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Key phrases per scenario
CREATE TABLE key_phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  english TEXT NOT NULL,
  vietnamese TEXT,
  ipa TEXT,
  audio_url TEXT,
  sort_order INT DEFAULT 0
);

-- Conversation sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES scenarios(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_sec INT,
  words_spoken INT DEFAULT 0,
  turns_count INT DEFAULT 0,
  avg_fluency_score NUMERIC(5,2),
  avg_pronunciation_score NUMERIC(5,2),
  settings JSONB -- ConversationSettings snapshot
);

-- Conversation turns
CREATE TABLE turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user','ai')),
  text TEXT NOT NULL,
  audio_url TEXT,
  pronunciation_score NUMERIC(5,2),
  fluency_score NUMERIC(5,2),
  grammar_issues JSONB, -- GrammarIssue[]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User vocabulary (learned phrases)
CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  english TEXT NOT NULL,
  vietnamese TEXT,
  ipa TEXT,
  context_sentence TEXT,
  source_session_id UUID REFERENCES sessions(id),
  -- SM-2 spaced repetition fields
  easiness NUMERIC(4,2) DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  repetitions INT DEFAULT 0,
  next_review_at DATE DEFAULT CURRENT_DATE,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grammar lessons
CREATE TABLE grammar_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_vi TEXT,
  level TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  hook_dialog JSONB,      -- dialog lines for phase 1
  rule_content JSONB,     -- structured rule explanation
  exercises JSONB,        -- array of exercises
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User grammar progress
CREATE TABLE grammar_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES grammar_lessons(id),
  phase_completed INT DEFAULT 0,     -- 0-3
  exercises_correct INT DEFAULT 0,
  exercises_total INT DEFAULT 0,
  next_review_at DATE,
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, lesson_id)
);

-- Daily reports (generated by cron)
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_minutes INT DEFAULT 0,
  sessions_count INT DEFAULT 0,
  words_spoken INT DEFAULT 0,
  fluency_score NUMERIC(5,2),
  fluency_delta NUMERIC(5,2),
  new_phrases JSONB,
  recurring_mistake JSONB,
  best_sentence TEXT,
  ai_comment TEXT,        -- LLM-generated personalized comment
  weekly_trend NUMERIC[], -- last 7 fluency scores
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- Pronunciation weaknesses (aggregated)
CREATE TABLE pronunciation_heatmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phoneme TEXT NOT NULL,    -- e.g., "θ", "ð", "ɪ"
  error_count INT DEFAULT 0,
  total_attempts INT DEFAULT 0,
  accuracy NUMERIC(5,2),
  last_practiced TIMESTAMPTZ,
  UNIQUE (user_id, phoneme)
);

-- Streaks
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date DATE,
  UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies (user can only access own data)
CREATE POLICY "users_own" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "sessions_own" ON sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "turns_own" ON turns FOR ALL USING (
  session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
);
CREATE POLICY "vocab_own" ON vocabulary FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "reports_own" ON daily_reports FOR ALL USING (auth.uid() = user_id);
```

### 3.2 TypeScript Types (complete)

```typescript
// === Core Enums ===
type CEFRLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type CoachPersonality = 'mentor' | 'friend' | 'strict' | 'funny';
type ScenarioCategory = 'workplace' | 'survival' | 'social' | 'travel' | 'academic' | 'industry';
type GoalType = 'work' | 'travel' | 'exam' | 'casual';
type SubscriptionTier = 'free' | 'pro_monthly' | 'pro_annual' | 'enterprise';
type ConversationState = 'idle' | 'recording' | 'processing' | 'speaking';
type GrammarIssueType = 'tense' | 'article' | 'preposition' | 'word-order' | 'plural' | 'other';
type VoiceAccent = 'us-female' | 'us-male' | 'uk-female' | 'uk-male' | 'au-male';

// === User ===
interface UserProfile {
  id: string;
  email: string;
  name: string;
  level: CEFRLevel;
  goal: GoalType;
  industry: string;
  interests: string[];
  dailyGoalMinutes: number;
  reminderTime: string;       // "HH:mm"
  coachPersonality: CoachPersonality;
  voiceId: string;
  timezone: string;
  subscriptionTier: SubscriptionTier;
}

// === Scenario ===
interface Scenario {
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
}

interface KeyPhrase {
  id: string;
  english: string;
  vietnamese: string;
  ipa: string;
  audioUrl?: string;
}

// === Conversation ===
interface ConversationTurn {
  id: string;
  role: 'user' | 'ai';
  text: string;
  audioUrl?: string;
  pronunciationScore?: number;
  fluencyScore?: number;
  grammarIssues?: GrammarIssue[];
  timestamp: number;
}

interface GrammarIssue {
  start: number;
  end: number;
  type: GrammarIssueType;
  original: string;
  correction: string;
  explanationVi: string;
}

interface ConversationSettings {
  voiceId: string;
  speed: 0.7 | 0.85 | 1.0 | 1.15 | 1.25;
  showTranslation: boolean;
  difficulty: 'easier' | 'match' | 'push';
  showSubtitle: 'always' | 'tap' | 'off';
  autoCorrect: 'inline' | 'end' | 'off';
}

// === AI Service ===
interface AITurnRequest {
  sessionId: string;
  scenarioId: string;
  userText: string;
  userAudioUrl?: string;
  history: ConversationTurn[];
  settings: ConversationSettings;
  userContext: {
    level: CEFRLevel;
    industry: string;
    interests: string[];
    recentMistakes: string[];
    coachPersonality: CoachPersonality;
  };
}

interface AITurnResponse {
  text: string;
  audioUrl?: string;
  feedback?: {
    grammarIssues: GrammarIssue[];
    pronunciationScore: number;
    fluencyScore: number;
    nativeRephrase?: string;
    newVocabulary?: KeyPhrase[];
  };
}

// === Pronunciation ===
interface PronunciationResult {
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  phonemes: PhonemeScore[];
}

interface PhonemeScore {
  phoneme: string;
  word: string;
  score: number;    // 0-100
  offset: number;   // ms
  duration: number;  // ms
}

// === Reports ===
interface DailyReport {
  date: string;
  totalMinutes: number;
  sessionsCount: number;
  wordsSpoken: number;
  fluencyScore: number;
  fluencyDelta: number;
  newPhrases: KeyPhrase[];
  recurringMistake?: { description: string; countToday: number };
  bestSentence?: string;
  aiComment: string;
  weeklyTrend: number[];
  skills: SkillRadar;
}

interface SkillRadar {
  pronunciation: number;
  grammar: number;
  vocabulary: number;
  fluency: number;
  confidence: number;
}

// === Vocabulary (SM-2) ===
interface VocabularyItem {
  id: string;
  english: string;
  vietnamese: string;
  ipa?: string;
  contextSentence?: string;
  easiness: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: string;   // ISO date
}

// === AI Voice ===
interface AIVoice {
  id: string;
  name: string;
  accent: VoiceAccent;
  elevenLabsVoiceId: string;
  gradient: [string, string];
}
```

---

## 4. API ENDPOINTS

### 4.1 Auth

```
POST   /v1/auth/signup          { email, password, name }
POST   /v1/auth/login           { email, password }
POST   /v1/auth/social          { provider: 'apple'|'google', token }
POST   /v1/auth/refresh         { refreshToken }
DELETE /v1/auth/account         (delete account + all data)
```

### 4.2 Onboarding

```
POST   /v1/onboarding/profile   { level, goal, industry, interests, ... }
POST   /v1/onboarding/test      { answers: [{questionId, answer}] }
  → Returns: { level: CEFRLevel, score: number }
```

### 4.3 Scenarios

```
GET    /v1/scenarios             ?category=&level=&page=&limit=
GET    /v1/scenarios/:id
GET    /v1/scenarios/recommended  (AI-generated based on user profile)
POST   /v1/scenarios/generate    { topic?: string }
  → Returns: Scenario (AI generates a new personalized scenario)
```

### 4.4 Conversations

```
POST   /v1/conversations/start   { scenarioId, settings }
  → Returns: { sessionId, greeting: AITurnResponse }

POST   /v1/conversations/turn    { sessionId, userText, userAudioUrl? }
  → Returns: AITurnResponse (streamed via SSE)

POST   /v1/conversations/end     { sessionId }
  → Returns: SessionReport

GET    /v1/conversations/history  ?page=&limit=
GET    /v1/conversations/:sessionId/turns
```

### 4.5 Pronunciation

```
POST   /v1/pronunciation/assess  { audioUrl, referenceText }
  → Returns: PronunciationResult

GET    /v1/pronunciation/heatmap
  → Returns: { phonemes: [{phoneme, accuracy, errorCount}] }
```

### 4.6 TTS

```
POST   /v1/tts/synthesize       { text, voiceId, speed }
  → Returns: { audioUrl } or stream audio bytes
```

### 4.7 Grammar

```
GET    /v1/grammar/lessons       ?level=&page=
GET    /v1/grammar/lessons/:id
POST   /v1/grammar/progress      { lessonId, phaseCompleted, exercisesCorrect, exercisesTotal }
GET    /v1/grammar/progress       (all user progress)
```

### 4.8 Vocabulary

```
GET    /v1/vocabulary             ?due=true (filter by next_review_at <= today)
POST   /v1/vocabulary             { english, vietnamese, ipa?, contextSentence? }
PUT    /v1/vocabulary/:id/review  { quality: 0-5 }  (SM-2 update)
DELETE /v1/vocabulary/:id
```

### 4.9 Reports

```
GET    /v1/reports/daily          ?date=YYYY-MM-DD (default today)
GET    /v1/reports/weekly         ?week=YYYY-Www
GET    /v1/reports/streak
  → Returns: { currentStreak, longestStreak, lastActiveDate, weekDays: boolean[] }
```

### 4.10 Settings

```
GET    /v1/settings
PUT    /v1/settings               { ...partial UserProfile + ConversationSettings }
PUT    /v1/settings/notifications  { reminderTime, weeklyReport, streakWarning }
```

---

## 5. CONVERSATION PIPELINE (Core Architecture)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Mobile App  │────▶│  API Gateway │────▶│   STT       │
│              │     │  (NestJS)    │     │  (Deepgram) │
│  1. Record   │     │              │     └──────┬──────┘
│  2. Upload   │     │  2. Route    │            │ transcript
│  audio       │     │              │     ┌──────▼──────┐
│              │     │              │────▶│   LLM       │
│  6. Play TTS │     │              │     │  (Claude)   │
│  7. Show     │     │  5. Return   │     │             │
│  feedback    │◀────│  response    │◀────│  3. Generate│
│              │     │              │     │  response + │
└─────────────┘     │              │     │  feedback   │
                    │              │     └──────┬──────┘
                    │              │            │ text
                    │              │     ┌──────▼──────┐
                    │              │────▶│   TTS       │
                    │              │     │ (ElevenLabs)│
                    │              │     │             │
                    │              │◀────│  4. Audio   │
                    └──────────────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  Async Jobs │
                    │  (BullMQ)   │
                    │             │
                    │ - Pronunciation scoring (Azure)
                    │ - Save vocabulary
                    │ - Update pronunciation heatmap
                    │ - Update streak
                    │ - Generate daily report (cron 21:00)
                    └─────────────┘
```

### 5.1 System Prompt Template

```
You are {coachName}, an English conversation coach with a {personality} style.

Student profile:
- Name: {userName}
- Level: {level}
- Industry: {industry}
- Interests: {interests}
- Recent mistakes: {recentMistakes}
- Words learned this week: {recentVocabulary}

Scenario: {scenarioTitle}
Goal: {scenarioGoal}
Key phrases to encourage: {keyPhrases}

Instructions:
1. Stay in character for the scenario roleplay
2. Keep responses under 25 words for A0-A1, under 40 for A2-B1
3. Use vocabulary appropriate for {level}
4. Naturally incorporate key phrases when possible
5. After each user turn, provide a JSON feedback block:
   {"grammar": [...issues], "vocabulary": [...new words to save]}
6. {personalityInstructions}
7. Speak {difficulty_instructions}
8. If user makes a recurring mistake from {recentMistakes}, gently correct

Personality instructions:
- mentor: Patient, encouraging, explain mistakes kindly, use "Great effort!"
- friend: Casual, use contractions, add humor, "No worries!"
- strict: Direct corrections, push for accuracy, "Try again with..."
- funny: Light humor, playful corrections, occasional jokes relevant to topic
```

### 5.2 Cost per Session

```
Component         | Per 5-min session | Notes
------------------|-------------------|----------------------------------
STT (Deepgram)    | ~$0.03            | Nova-3, ~500 words
LLM (Claude)      | ~$0.04            | ~2K input + 500 output tokens × 5 turns
TTS (ElevenLabs)  | ~$0.06            | ~200 words AI speaks
Pronunciation     | ~$0.02            | Azure, ~5 assessments
Storage (R2)      | ~$0.001           | Audio files
─────────────────────────────────────────────────────────
Total             | ~$0.15            |
Monthly (1/day)   | ~$4.50            | Subscription $9.99 → 55% margin
Monthly (3/day)   | ~$13.50           | Needs soft cap or fair-use
```

---

## 6. SCREEN-BY-SCREEN IMPLEMENTATION GUIDE

### 6.1 Onboarding Flow

```
File: app/(auth)/onboarding/_layout.tsx

- Shared layout wraps all 10 steps
- Progress bar at top (current step / total)
- Back button (except step 1)
- Skip button (steps 2-8)
- Data stored in Zustand during flow, POST to API only at signup step
- AsyncStorage backup after each step (recovery if app killed)
- Microphone permission requested at step 3 (test)
- Push notification permission at step 7 (schedule)

Key decisions per step:
Step 1 (language):   Sets i18n locale. Store in MMKV.
Step 2 (reason):     Single select. Determines content branch.
Step 3 (test):       5 questions + 1 free speech (30s recording).
                     Send audio to /v1/onboarding/test.
                     Returns CEFR level. Show result with celebration.
Step 4 (industry):   Grid of 10 options with emoji. Single select.
Step 5 (interests):  Chip cloud, select 3-5 from 20 options.
Step 6 (goal):       4 predefined goals. Show "popular" tag on first.
Step 7 (schedule):   Time picker (5/10/15/20/30 min) + reminder hour.
Step 8 (coach):      4 personality cards with name, emoji, description.
Step 9 (signup):     Apple Sign-In, Google Sign-In, or email+password.
                     POST /v1/auth/signup then POST /v1/onboarding/profile.
Step 10 (paywall):   Soft paywall. 7-day free trial.
                     RevenueCat for subscription management.
                     "Dùng bản miễn phí" skip option.
```

### 6.2 Today Hub

```
File: app/(tabs)/today.tsx

Data fetching (React Query):
  - GET /v1/reports/streak → streak data
  - GET /v1/reports/daily?date=today → today's stats
  - GET /v1/scenarios/recommended → AI recommendation (limit 1)
  - GET /v1/grammar/progress → in-progress lessons
  - GET /v1/vocabulary?due=true → due review count

Layout:
  - ScrollView with RefreshControl (pull-to-refresh)
  - Greeting based on time of day + user name
  - StreakCard + 2 StatCards in flex row
  - FeaturedLesson card (tappable → navigate to conversation)
  - Continue section: LessonRow list
  - Quick actions: 3 buttons in flex row

Navigation:
  - Featured card → /conversation/{scenarioId}
  - Grammar row → /grammar/{lessonId}
  - Review row → /review
  - Drill row → /drill/{scenarioId}
  - Quick action buttons → respective tabs
```

### 6.3 Conversation Screen

```
File: app/conversation/[scenarioId].tsx
Hook: src/hooks/useConversation.ts

State machine:
  idle → (tap mic) → recording → (release/VAD) → processing → speaking → idle

Core flow:
  1. On mount: POST /v1/conversations/start → get sessionId + AI greeting
  2. User taps mic → startRecording() (expo-av Recording)
  3. User releases OR VAD detects silence → stopRecording()
  4. Upload audio → POST /v1/conversations/turn (SSE stream)
  5. Stream response text → display in bubble
  6. Stream audio → play via expo-av Sound
  7. Show feedback chips below user bubble
  8. On tap "fix" chip → expand FixPanel
  9. On close → POST /v1/conversations/end → navigate to report

Components needed:
  - ConversationHeader (avatar, name, status, settings button)
  - KeyPhraseStrip (horizontal scroll)
  - Bubble (AI variant + User variant)
  - FixPanel (grammar corrections + native rephrase)
  - TypingIndicator (3 animated dots)
  - MicButton (3 states: idle/recording/disabled)

Performance notes:
  - Use FlatList for messages (not ScrollView) for large conversations
  - Scroll to bottom on new message
  - Debounce VAD to avoid cutting mid-sentence
  - Cache TTS audio locally for replay
```

### 6.4 Pronunciation Drill

```
File: app/drill/[scenarioId].tsx

Flow:
  1. Show target phrase + IPA + listen button
  2. User holds mic → record
  3. On release → POST /v1/pronunciation/assess
  4. Show phoneme breakdown + waveform + 4 scores
  5. If any phoneme < 60 → show tip card
  6. "Thử lại" or "Tiếp →"

Components:
  - TargetCard (dark, grain overlay, phrase, IPA, listen button)
  - PhonemeGrid (colored boxes with scores)
  - WaveformCompare (Skia canvas: 2 overlaid paths)
  - ScoreGrid (2×2 glass cards)
  - TipCard (pronunciation hint with video link)

Audio:
  - Model audio: pre-recorded or TTS-generated, cached locally
  - User audio: recorded via expo-av, uploaded for assessment
  - Waveform: extract amplitude data from audio buffer
```

### 6.5 Daily Report

```
File: app/(tabs)/progress.tsx

Data: GET /v1/reports/daily or /v1/reports/weekly
  Cron job generates reports at 21:00 user timezone

Components:
  - Tab toggle (Hôm nay / Tuần này)
  - FluencyHero (gradient card, large score, bar chart)
  - StatsRow (3 mini stat cards)
  - InsightCard × 4 (grammar, vocab, best sentence, pronunciation)
  - SkillRadar (5 horizontal bars)
  - CTA: "Ôn 60 giây" → navigate to /review

Bar chart animation:
  - Use Reanimated 3 SharedValue for bar heights
  - Stagger animation on mount
  - Or use react-native-skia for canvas-based charts
```

### 6.6 Settings

```
File: app/(tabs)/profile.tsx
File: app/conversation/settings.tsx (bottom sheet)

Global settings: stored in Zustand + synced to API
Per-session settings: stored in conversation store, reset on new session

Bottom sheet:
  - Use @gorhom/bottom-sheet or expo-router modal
  - Slide up animation
  - Voice picker grid, segment controls
  - "Áp dụng" button updates conversation store
```

---

## 7. KEY ALGORITHMS

### 7.1 SM-2 Spaced Repetition

```typescript
function sm2(item: VocabularyItem, quality: number): VocabularyItem {
  // quality: 0-5 (0=complete fail, 5=perfect)
  let { easiness, interval, repetitions } = item;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easiness);
    repetitions++;
  } else {
    // Incorrect — reset
    repetitions = 0;
    interval = 1;
  }

  // Update easiness factor
  easiness = Math.max(1.3,
    easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  return {
    ...item,
    easiness,
    intervalDays: interval,
    repetitions,
    nextReviewAt: addDays(new Date(), interval).toISOString(),
  };
}
```

### 7.2 Fluency Score Calculation

```typescript
function calculateFluencyScore(turns: ConversationTurn[]): number {
  const userTurns = turns.filter(t => t.role === 'user');
  if (userTurns.length === 0) return 0;

  const avgPronunciation = avg(userTurns.map(t => t.pronunciationScore || 0));
  const avgFluency = avg(userTurns.map(t => t.fluencyScore || 0));
  const grammarErrorRate = userTurns.reduce((sum, t) =>
    sum + (t.grammarIssues?.length || 0), 0) / userTurns.length;
  const grammarScore = Math.max(0, 100 - grammarErrorRate * 15);

  // Weighted average
  return Math.round(
    avgPronunciation * 0.3 +
    avgFluency * 0.35 +
    grammarScore * 0.35
  );
}
```

---

## 8. ENVIRONMENT VARIABLES

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# AI Services
DEEPGRAM_API_KEY=xxx
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
ELEVENLABS_API_KEY=xxx
AZURE_SPEECH_KEY=xxx
AZURE_SPEECH_REGION=southeastasia

# Payments
REVENUECAT_API_KEY=xxx

# Analytics
POSTHOG_API_KEY=xxx
SENTRY_DSN=https://xxx@sentry.io/xxx

# LLM Gateway
OPENROUTER_API_KEY=xxx
LLM_PRIMARY_MODEL=claude-sonnet-4-20250514
LLM_FALLBACK_MODEL=gpt-4o-mini
```

---

## 9. DEPLOYMENT & CI/CD

```
EAS Build (mobile):
  - Development: eas build --profile development
  - Preview: eas build --profile preview (internal TestFlight/Play Store)
  - Production: eas build --profile production
  - OTA: eas update --branch production

Backend (Cloudflare Workers):
  - wrangler deploy (auto from GitHub Actions on main push)
  - Staging: deploy to staging worker on PR merge to develop
  - DB migrations: supabase db push

Cron Jobs:
  - Daily report: 21:00 per user timezone (Cloudflare Cron Trigger)
  - Streak check: 00:00 UTC (reset if no activity yesterday)
  - AI scenario generation: 06:00 per user timezone (3 new scenarios/day)
```
