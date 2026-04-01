CREATE TABLE public.merchants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL UNIQUE REFERENCES public.profiles ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  description   TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city          TEXT,
  postal_code   TEXT,
  country       TEXT NOT NULL DEFAULT 'NL',
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  phone         TEXT,
  website       TEXT,
  kvk_number    TEXT,
  logo_url      TEXT,
  banner_url    TEXT,
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  avg_rating    NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count  INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX idx_merchants_profile_id ON public.merchants (profile_id);
CREATE INDEX idx_merchants_city ON public.merchants (city);
CREATE INDEX idx_merchants_location ON public.merchants
  USING gist (extensions.ll_to_earth(latitude, longitude))
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Keep updated_at current
CREATE TRIGGER trg_merchants_updated_at
  BEFORE UPDATE ON public.merchants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
