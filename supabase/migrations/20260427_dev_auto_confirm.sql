-- DEV ONLY · Auto-confirm email signups so we don't need Dashboard toggles.
-- This trigger sets email_confirmed_at = now() on every new auth.users insert.
-- (confirmed_at is a generated column derived from email_confirmed_at — don't touch it directly.)
--
-- BEFORE PRODUCTION: drop with
--   drop trigger auto_confirm_user on auth.users;

create or replace function public.auto_confirm_email()
returns trigger language plpgsql security definer set search_path = public, auth as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end; $$;

drop trigger if exists auto_confirm_user on auth.users;
create trigger auto_confirm_user
  before insert on auth.users
  for each row execute procedure public.auto_confirm_email();

-- Confirm any existing unconfirmed users
update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;
