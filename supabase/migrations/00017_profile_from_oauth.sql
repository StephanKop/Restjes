-- Update handle_new_user to populate profile from OAuth provider data (Google etc.)
-- Google provides: full_name, name, avatar_url, email, email_verified, picture
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, city)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',  -- email signup
      NEW.raw_user_meta_data->>'full_name',      -- Google OAuth
      NEW.raw_user_meta_data->>'name',           -- other OAuth
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',     -- Google OAuth
      NEW.raw_user_meta_data->>'picture'          -- some providers use 'picture'
    ),
    NEW.raw_user_meta_data->>'city'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
