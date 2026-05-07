-- Auto-sync auth.users.email → public.users.email on UPDATE.
-- Together with the existing `handle_new_user` (INSERT) and our delete-account
-- Edge Function (DELETE), this guarantees public.users.email always matches
-- auth.users.email no matter where the change originates.

CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when email actually changed (avoids needless writes on every
  -- last_sign_in_at update etc.)
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.users
    SET email = NEW.email,
        updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_update();

-- Also: if any user is currently out of sync (drift from before this trigger
-- existed), backfill.
UPDATE public.users p
SET email = a.email,
    updated_at = now()
FROM auth.users a
WHERE p.id = a.id
  AND p.email IS DISTINCT FROM a.email;
