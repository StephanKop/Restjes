CREATE TABLE public.dishes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id         UUID NOT NULL REFERENCES public.merchants ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT,
  image_url           TEXT,
  quantity_available  INTEGER NOT NULL DEFAULT 1,
  status              public.dish_status NOT NULL DEFAULT 'available',
  pickup_start        TIMESTAMPTZ,
  pickup_end          TIMESTAMPTZ,
  bring_own_container BOOLEAN NOT NULL DEFAULT FALSE,
  is_vegetarian       BOOLEAN NOT NULL DEFAULT FALSE,
  is_vegan            BOOLEAN NOT NULL DEFAULT FALSE,
  search_vector       TSVECTOR,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_quantity_non_negative CHECK (quantity_available >= 0),
  CONSTRAINT chk_pickup_window CHECK (pickup_end > pickup_start)
);

-- Full-text search: auto-populate tsvector using Dutch config
CREATE OR REPLACE FUNCTION public.dishes_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('dutch', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('dutch', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_dishes_search_vector
  BEFORE INSERT OR UPDATE OF title, description ON public.dishes
  FOR EACH ROW
  EXECUTE FUNCTION public.dishes_search_vector_update();

CREATE INDEX idx_dishes_search ON public.dishes USING gin (search_vector);
CREATE INDEX idx_dishes_merchant_id ON public.dishes (merchant_id);
CREATE INDEX idx_dishes_status ON public.dishes (status);

CREATE TRIGGER trg_dishes_updated_at
  BEFORE UPDATE ON public.dishes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Junction: ingredients per dish
CREATE TABLE public.dish_ingredients (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id UUID NOT NULL REFERENCES public.dishes ON DELETE CASCADE,
  name    TEXT NOT NULL,
  UNIQUE (dish_id, name)
);

CREATE INDEX idx_dish_ingredients_dish_id ON public.dish_ingredients (dish_id);

-- Junction: allergens per dish
CREATE TABLE public.dish_allergies (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id  UUID NOT NULL REFERENCES public.dishes ON DELETE CASCADE,
  allergen public.allergen NOT NULL,
  UNIQUE (dish_id, allergen)
);

CREATE INDEX idx_dish_allergies_dish_id ON public.dish_allergies (dish_id);
