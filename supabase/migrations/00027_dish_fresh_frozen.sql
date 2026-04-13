-- Add fresh/frozen indicator and expiration date for fresh dishes
ALTER TABLE public.dishes
  ADD COLUMN is_frozen BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN expires_at TIMESTAMPTZ;
