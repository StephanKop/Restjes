-- ============================================================
-- Enable Row Level Security on every table
-- ============================================================
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dish_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dish_allergies  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens     ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "Profiles are publicly readable"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- MERCHANTS
-- ============================================================
CREATE POLICY "Merchants are publicly readable"
  ON public.merchants FOR SELECT
  USING (true);

CREATE POLICY "Merchant role can create a merchant"
  ON public.merchants FOR INSERT
  WITH CHECK (
    auth.uid() = profile_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'merchant'
    )
  );

CREATE POLICY "Owner can update their merchant"
  ON public.merchants FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- ============================================================
-- DISHES
-- ============================================================
CREATE POLICY "Dishes are publicly readable"
  ON public.dishes FOR SELECT
  USING (true);

CREATE POLICY "Merchant owner can insert dishes"
  ON public.dishes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.merchants
      WHERE id = merchant_id AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Merchant owner can update dishes"
  ON public.dishes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.merchants
      WHERE id = merchant_id AND profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.merchants
      WHERE id = merchant_id AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Merchant owner can delete dishes"
  ON public.dishes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.merchants
      WHERE id = merchant_id AND profile_id = auth.uid()
    )
  );

-- ============================================================
-- DISH INGREDIENTS
-- ============================================================
CREATE POLICY "Dish ingredients are publicly readable"
  ON public.dish_ingredients FOR SELECT
  USING (true);

CREATE POLICY "Merchant owner can manage dish ingredients"
  ON public.dish_ingredients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.dishes d
      JOIN public.merchants m ON m.id = d.merchant_id
      WHERE d.id = dish_id AND m.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dishes d
      JOIN public.merchants m ON m.id = d.merchant_id
      WHERE d.id = dish_id AND m.profile_id = auth.uid()
    )
  );

-- ============================================================
-- DISH ALLERGIES
-- ============================================================
CREATE POLICY "Dish allergies are publicly readable"
  ON public.dish_allergies FOR SELECT
  USING (true);

CREATE POLICY "Merchant owner can manage dish allergies"
  ON public.dish_allergies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.dishes d
      JOIN public.merchants m ON m.id = d.merchant_id
      WHERE d.id = dish_id AND m.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dishes d
      JOIN public.merchants m ON m.id = d.merchant_id
      WHERE d.id = dish_id AND m.profile_id = auth.uid()
    )
  );

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE POLICY "Reviews are publicly readable"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Consumer can insert review for collected reservation"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = consumer_id
    AND EXISTS (
      SELECT 1 FROM public.reservations
      WHERE id = reservation_id
        AND consumer_id = auth.uid()
        AND status = 'collected'
    )
  );

CREATE POLICY "Consumer can update own review"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = consumer_id)
  WITH CHECK (auth.uid() = consumer_id);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE POLICY "Participants can view conversations"
  ON public.conversations FOR SELECT
  USING (
    auth.uid() = consumer_id
    OR EXISTS (
      SELECT 1 FROM public.merchants
      WHERE id = merchant_id AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Consumer can start a conversation"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = consumer_id);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (
          c.consumer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.merchants m
            WHERE m.id = c.merchant_id AND m.profile_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (
          c.consumer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.merchants m
            WHERE m.id = c.merchant_id AND m.profile_id = auth.uid()
          )
        )
    )
  );

-- ============================================================
-- RESERVATIONS
-- ============================================================
CREATE POLICY "Consumer can view own reservations"
  ON public.reservations FOR SELECT
  USING (auth.uid() = consumer_id);

CREATE POLICY "Merchant can view their reservations"
  ON public.reservations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.merchants
      WHERE id = merchant_id AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Consumer can create reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "Merchant can update reservation status"
  ON public.reservations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.merchants
      WHERE id = merchant_id AND profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.merchants
      WHERE id = merchant_id AND profile_id = auth.uid()
    )
  );

-- ============================================================
-- PUSH TOKENS
-- ============================================================
CREATE POLICY "Users can view own push tokens"
  ON public.push_tokens FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage own push tokens"
  ON public.push_tokens FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);
