-- Allow conversation participants to update messages (e.g. mark as read)
CREATE POLICY "Participants can update messages"
  ON public.messages FOR UPDATE
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
  )
  WITH CHECK (
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
