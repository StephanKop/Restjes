-- Kennisbank: editable articles backed by Supabase
-- Replaces the hand-coded TSX articles in apps/web/src/content/articles/.

CREATE TABLE public.articles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN (
                    'voedselverspilling',
                    'praktisch',
                    'recepten',
                    'duurzaamheid'
                  )),
  -- Markdown body. NL is required; EN is optional and falls back to NL on
  -- the public site when blank/null.
  body_md         TEXT NOT NULL,
  body_md_en      TEXT,
  -- Hero image. URL is the public Storage URL (article-images bucket).
  image_url       TEXT,
  image_alt       TEXT,
  image_credit    TEXT,
  reading_minutes INT NOT NULL DEFAULT 5,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by      UUID REFERENCES auth.users(id)
);

CREATE INDEX articles_category_idx ON public.articles (category);
CREATE INDEX articles_published_at_idx ON public.articles (published_at DESC);

CREATE TRIGGER trg_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public read so the website can render articles without auth.
CREATE POLICY "Anyone can read articles"
  ON public.articles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Writes go exclusively through the admin app, which uses the service role
-- key (RLS bypassed). No INSERT/UPDATE/DELETE policy on purpose.

-- ============================================================
-- Storage: article-images bucket (public read; admin writes via service role).
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view article images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-images');

-- No INSERT/UPDATE/DELETE policy — admin app uploads via service role.
