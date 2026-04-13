-- CMS: editable page content stored as JSON
CREATE TABLE public.page_content (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug  TEXT NOT NULL UNIQUE,
  content    JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER trg_page_content_updated_at
  BEFORE UPDATE ON public.page_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page content"
  ON public.page_content FOR SELECT
  TO anon, authenticated
  USING (true);
