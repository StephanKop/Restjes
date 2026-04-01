CREATE TABLE public.reservations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id     UUID NOT NULL REFERENCES public.dishes ON DELETE RESTRICT,
  consumer_id UUID NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES public.merchants ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1,
  status      public.reservation_status NOT NULL DEFAULT 'pending',
  pickup_time TIMESTAMPTZ,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_reservation_quantity CHECK (quantity >= 1)
);

CREATE INDEX idx_reservations_consumer_id ON public.reservations (consumer_id);
CREATE INDEX idx_reservations_merchant_id ON public.reservations (merchant_id);
CREATE INDEX idx_reservations_dish_id ON public.reservations (dish_id);
CREATE INDEX idx_reservations_status ON public.reservations (status);

CREATE TRIGGER trg_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Now that reservations exists, add the deferred FK from reviews
ALTER TABLE public.reviews
  ADD CONSTRAINT fk_reviews_reservation
  FOREIGN KEY (reservation_id) REFERENCES public.reservations (id)
  ON DELETE SET NULL;

-- Push notification tokens
CREATE TABLE public.push_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
  token      TEXT NOT NULL,
  platform   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_platform CHECK (platform IN ('ios', 'android', 'web')),
  UNIQUE (profile_id, token)
);

CREATE INDEX idx_push_tokens_profile_id ON public.push_tokens (profile_id);
