-- FluentMate · Initial schema
-- Paste this entire file into Supabase Dashboard → SQL Editor → New query → Run.
-- Re-running is safe (uses IF NOT EXISTS / ON CONFLICT).

-- ──────────────────────────────────────────────────────────
-- Extensions
-- ──────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ──────────────────────────────────────────────────────────
-- USERS  (linked 1:1 to auth.users via id)
-- ──────────────────────────────────────────────────────────
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  avatar_url text,
  level text check (level in ('A0','A1','A2','B1','B2','C1','C2')),
  goal text check (goal in ('work','travel','exam','casual')),
  industry text,
  interests text[] default '{}',
  daily_goal_minutes int default 15,
  reminder_time time default '21:00',
  coach_personality text default 'mentor',
  voice_id text default 'sarah',
  native_language text default 'vi',
  timezone text default 'Asia/Ho_Chi_Minh',
  subscription_tier text default 'free',
  subscription_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create row in public.users when auth.users gets new entry
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', null))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ──────────────────────────────────────────────────────────
-- SCENARIOS  (static + AI-generated)
-- ──────────────────────────────────────────────────────────
create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_vi text,
  category text not null,
  level text not null,
  duration_min int,
  goal text,
  system_prompt text not null default '',
  icon_emoji text,
  is_generated boolean default false,
  generated_for uuid references public.users(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists scenarios_category_idx on public.scenarios(category);
create index if not exists scenarios_level_idx on public.scenarios(level);

-- ──────────────────────────────────────────────────────────
-- KEY PHRASES per scenario
-- ──────────────────────────────────────────────────────────
create table if not exists public.key_phrases (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid references public.scenarios(id) on delete cascade,
  english text not null,
  vietnamese text,
  ipa text,
  audio_url text,
  sort_order int default 0
);

create index if not exists key_phrases_scenario_idx on public.key_phrases(scenario_id);

-- ──────────────────────────────────────────────────────────
-- SESSIONS
-- ──────────────────────────────────────────────────────────
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  scenario_id uuid references public.scenarios(id),
  started_at timestamptz default now(),
  ended_at timestamptz,
  duration_sec int,
  words_spoken int default 0,
  turns_count int default 0,
  avg_fluency_score numeric(5,2),
  avg_pronunciation_score numeric(5,2),
  settings jsonb
);

create index if not exists sessions_user_idx on public.sessions(user_id, started_at desc);

-- ──────────────────────────────────────────────────────────
-- TURNS
-- ──────────────────────────────────────────────────────────
create table if not exists public.turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade,
  role text check (role in ('user','ai')),
  text text not null,
  audio_url text,
  pronunciation_score numeric(5,2),
  fluency_score numeric(5,2),
  grammar_issues jsonb,
  created_at timestamptz default now()
);

create index if not exists turns_session_idx on public.turns(session_id, created_at);

-- ──────────────────────────────────────────────────────────
-- VOCABULARY  (SM-2 spaced repetition fields)
-- ──────────────────────────────────────────────────────────
create table if not exists public.vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  english text not null,
  vietnamese text,
  ipa text,
  context_sentence text,
  source_session_id uuid references public.sessions(id) on delete set null,
  easiness numeric(4,2) default 2.5,
  interval_days int default 1,
  repetitions int default 0,
  next_review_at date default current_date,
  last_reviewed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists vocab_user_due_idx on public.vocabulary(user_id, next_review_at);

-- ──────────────────────────────────────────────────────────
-- GRAMMAR
-- ──────────────────────────────────────────────────────────
create table if not exists public.grammar_lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_vi text,
  level text not null,
  sort_order int default 0,
  hook_dialog jsonb,
  rule_content jsonb,
  exercises jsonb,
  created_at timestamptz default now()
);

create table if not exists public.grammar_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  lesson_id uuid references public.grammar_lessons(id) on delete cascade,
  phase_completed int default 0,
  exercises_correct int default 0,
  exercises_total int default 0,
  next_review_at date,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

-- ──────────────────────────────────────────────────────────
-- DAILY REPORTS  (cron job inserts; user-readable)
-- ──────────────────────────────────────────────────────────
create table if not exists public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  date date not null,
  total_minutes int default 0,
  sessions_count int default 0,
  words_spoken int default 0,
  fluency_score numeric(5,2),
  fluency_delta numeric(5,2),
  new_phrases jsonb,
  recurring_mistake jsonb,
  best_sentence text,
  ai_comment text,
  weekly_trend numeric[],
  created_at timestamptz default now(),
  unique (user_id, date)
);

-- ──────────────────────────────────────────────────────────
-- PRONUNCIATION HEATMAP
-- ──────────────────────────────────────────────────────────
create table if not exists public.pronunciation_heatmap (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  phoneme text not null,
  error_count int default 0,
  total_attempts int default 0,
  accuracy numeric(5,2),
  last_practiced timestamptz,
  unique (user_id, phoneme)
);

-- ──────────────────────────────────────────────────────────
-- STREAKS
-- ──────────────────────────────────────────────────────────
create table if not exists public.streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  current_streak int default 0,
  longest_streak int default 0,
  last_active_date date,
  unique (user_id)
);

-- ──────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────
alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.turns enable row level security;
alter table public.vocabulary enable row level security;
alter table public.daily_reports enable row level security;
alter table public.streaks enable row level security;
alter table public.grammar_progress enable row level security;
alter table public.pronunciation_heatmap enable row level security;
alter table public.scenarios enable row level security;
alter table public.key_phrases enable row level security;
alter table public.grammar_lessons enable row level security;

-- Drop existing policies (so re-running migration is safe)
drop policy if exists "users_own" on public.users;
drop policy if exists "sessions_own" on public.sessions;
drop policy if exists "turns_own" on public.turns;
drop policy if exists "vocab_own" on public.vocabulary;
drop policy if exists "reports_own" on public.daily_reports;
drop policy if exists "streak_own" on public.streaks;
drop policy if exists "grammar_progress_own" on public.grammar_progress;
drop policy if exists "phoneme_own" on public.pronunciation_heatmap;
drop policy if exists "scenarios_read" on public.scenarios;
drop policy if exists "scenarios_insert_own" on public.scenarios;
drop policy if exists "key_phrases_read" on public.key_phrases;
drop policy if exists "grammar_lessons_read" on public.grammar_lessons;

-- Per-user data: full CRUD on own rows
create policy "users_own" on public.users for all using (auth.uid() = id);
create policy "sessions_own" on public.sessions for all using (auth.uid() = user_id);
create policy "turns_own" on public.turns for all
  using (session_id in (select id from public.sessions where user_id = auth.uid()));
create policy "vocab_own" on public.vocabulary for all using (auth.uid() = user_id);
create policy "reports_own" on public.daily_reports for all using (auth.uid() = user_id);
create policy "streak_own" on public.streaks for all using (auth.uid() = user_id);
create policy "grammar_progress_own" on public.grammar_progress for all
  using (auth.uid() = user_id);
create policy "phoneme_own" on public.pronunciation_heatmap for all
  using (auth.uid() = user_id);

-- Public catalog: any authenticated user can read scenarios + key phrases + grammar lessons
create policy "scenarios_read" on public.scenarios for select
  using (
    auth.role() = 'authenticated'
    and (is_generated = false or generated_for = auth.uid())
  );
create policy "scenarios_insert_own" on public.scenarios for insert
  with check (auth.uid() = generated_for and is_generated = true);
create policy "key_phrases_read" on public.key_phrases for select
  using (auth.role() = 'authenticated');
create policy "grammar_lessons_read" on public.grammar_lessons for select
  using (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────
-- SEED DATA (8 starter scenarios — only if table is empty)
-- ──────────────────────────────────────────────────────────
insert into public.scenarios (title, title_vi, category, level, duration_min, goal, icon_emoji, is_generated, system_prompt)
select * from (values
  ('Order coffee at a café',     'Gọi cà phê',                 'survival',  'A1', 5,  'Order a drink, ask about size and milk options', '☕', false, ''),
  ('Daily standup',              'Họp standup hàng ngày',      'workplace', 'B1', 8,  'Share progress, blockers, and plan',             '💼', false, ''),
  ('Check-in at the airport',    'Check-in tại sân bay',       'travel',    'A2', 6,  'Check bags, choose seat, ask about gate',        '✈️', false, ''),
  ('Meet a new colleague',       'Làm quen đồng nghiệp mới',   'social',    'A2', 5,  'Introduce yourself, ask about role and team',    '👋', false, ''),
  ('Make a restaurant reservation','Đặt bàn nhà hàng',         'survival',  'A2', 5,  'Book a table, mention preferences',              '🍽️', false, ''),
  ('Tell me about yourself',     'Phỏng vấn — giới thiệu',     'workplace', 'B1', 10, 'Introduce background, strengths, why this role', '🎤', false, ''),
  ('At the doctor',              'Đi khám bệnh',               'survival',  'A2', 6,  'Describe symptoms, understand instructions',     '🩺', false, ''),
  ('Pitch your idea',            'Trình bày ý tưởng',          'workplace', 'B2', 12, 'Open with hook, walk through structure, close', '📊', false, '')
) as v(title, title_vi, category, level, duration_min, goal, icon_emoji, is_generated, system_prompt)
where not exists (select 1 from public.scenarios limit 1);
