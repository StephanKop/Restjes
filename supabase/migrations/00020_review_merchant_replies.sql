-- Add merchant reply fields to reviews
ALTER TABLE public.reviews
  ADD COLUMN merchant_reply TEXT,
  ADD COLUMN merchant_replied_at TIMESTAMPTZ;

-- Allow the merchant who owns the review's merchant_id to update only the reply fields
CREATE POLICY "Merchant can reply to their reviews"
  ON public.reviews FOR UPDATE
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
