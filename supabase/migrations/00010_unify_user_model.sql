-- Migration: Unify user model
-- Any user can both browse/reserve AND offer dishes.
-- The merchants table becomes an optional "offering profile" any user can create.

-- 1. Remove role-based RLS policy on merchants INSERT
DROP POLICY IF EXISTS "Authenticated users with merchant role can insert" ON public.merchants;

-- 2. Allow any authenticated user to create a merchant (offering) profile
CREATE POLICY "Any authenticated user can create offering profile"
  ON public.merchants FOR INSERT WITH CHECK (
    profile_id = auth.uid()
  );

-- 3. Make role column optional and default to NULL (no longer used for access control)
ALTER TABLE public.profiles ALTER COLUMN role DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- 4. Update the handle_new_user trigger to not set a role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
