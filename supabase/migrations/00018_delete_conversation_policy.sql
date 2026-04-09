-- Allow participants to delete their own conversations
CREATE POLICY "Participants can delete conversations"
  ON public.conversations FOR DELETE
  USING (
    auth.uid() = consumer_id
    OR EXISTS (
      SELECT 1 FROM public.merchants
      WHERE id = merchant_id AND profile_id = auth.uid()
    )
  );
