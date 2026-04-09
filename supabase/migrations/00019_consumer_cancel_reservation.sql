-- Allow consumers to update their own reservations (e.g. cancel)
CREATE POLICY "Consumer can update own reservations"
  ON public.reservations FOR UPDATE
  USING (auth.uid() = consumer_id)
  WITH CHECK (auth.uid() = consumer_id);
