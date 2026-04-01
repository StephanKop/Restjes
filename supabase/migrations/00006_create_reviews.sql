CREATE TABLE public.reviews (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id    UUID NOT NULL REFERENCES public.merchants ON DELETE CASCADE,
  consumer_id    UUID NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
  reservation_id UUID,  -- FK added in 00008 after reservations table exists
  rating         SMALLINT NOT NULL,
  comment        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_rating_range CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT uq_consumer_reservation UNIQUE (consumer_id, reservation_id)
);

CREATE INDEX idx_reviews_merchant_id ON public.reviews (merchant_id);
CREATE INDEX idx_reviews_consumer_id ON public.reviews (consumer_id);

-- Recalculate avg_rating and review_count on the merchant after any review change
CREATE OR REPLACE FUNCTION public.update_merchant_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_merchant_id UUID;
BEGIN
  target_merchant_id := COALESCE(NEW.merchant_id, OLD.merchant_id);

  UPDATE public.merchants
  SET avg_rating   = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE merchant_id = target_merchant_id), 0),
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE merchant_id = target_merchant_id)
  WHERE id = target_merchant_id;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_reviews_update_merchant_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_merchant_rating();

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
