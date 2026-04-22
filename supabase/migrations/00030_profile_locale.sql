-- ============================================================
-- Add a locale preference to profiles.
-- Used by edge functions to send push copy in the user's language,
-- and by Supabase auth email templates (once we configure EN versions).
-- Defaults to 'nl' so existing rows keep current behaviour.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'nl'
  CONSTRAINT profiles_locale_check CHECK (locale IN ('nl', 'en'));

COMMENT ON COLUMN public.profiles.locale IS
  'User-preferred locale. Used for push notification copy and auth email templates.';
