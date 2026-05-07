-- FluentMate · Add user preferences columns
-- Adds speech_speed + notification_prefs to public.users so all settings sync.
-- Safe to re-run.

alter table public.users
  add column if not exists speech_speed numeric(3,2) default 1.0,
  add column if not exists notification_prefs jsonb default jsonb_build_object(
    'reminders',     true,
    'weeklyReport',  true,
    'streakWarning', true,
    'newScenarios',  false
  );

-- Optional sanity check on speed values
alter table public.users
  drop constraint if exists users_speech_speed_check;
alter table public.users
  add constraint users_speech_speed_check
  check (speech_speed in (0.7, 0.85, 1.0, 1.15, 1.25));
