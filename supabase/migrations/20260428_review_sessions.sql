-- review_sessions: append-only log of every flashcard review the user does.
-- One row per quality button press in /review. Used by the Progress screen
-- to show "cards reviewed today" without conflating with conversation sessions.

CREATE TABLE IF NOT EXISTS public.review_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vocabulary_id uuid NOT NULL REFERENCES public.vocabulary(id) ON DELETE CASCADE,
  quality smallint NOT NULL CHECK (quality BETWEEN 0 AND 5),
  reviewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS review_sessions_user_date_idx
  ON public.review_sessions (user_id, reviewed_at DESC);

ALTER TABLE public.review_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS review_sessions_select_own ON public.review_sessions;
CREATE POLICY review_sessions_select_own ON public.review_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS review_sessions_insert_own ON public.review_sessions;
CREATE POLICY review_sessions_insert_own ON public.review_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
