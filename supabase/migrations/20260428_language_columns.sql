-- FluentMate · Add language preference columns
-- Safe to re-run.

alter table public.users
  add column if not exists translation_language text default 'vi',
  add column if not exists app_language text default 'vi';

alter table public.users
  drop constraint if exists users_translation_language_check;
alter table public.users
  add constraint users_translation_language_check
  check (translation_language in ('vi', 'en'));

alter table public.users
  drop constraint if exists users_app_language_check;
alter table public.users
  add constraint users_app_language_check
  check (app_language in ('vi', 'en'));
