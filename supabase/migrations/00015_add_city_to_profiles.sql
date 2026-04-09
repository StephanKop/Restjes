-- Add city column to profiles for city-based dish filtering
ALTER TABLE public.profiles ADD COLUMN city TEXT;

-- Update handle_new_user to store city from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'city'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for filtering
CREATE INDEX idx_profiles_city ON public.profiles (city);
