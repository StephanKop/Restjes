-- Per-user soft-delete for conversations.
-- Each side (consumer / merchant) records when they hid the thread.
-- The conversation reappears for that user once a new message arrives
-- with created_at > their *_deleted_at timestamp.

ALTER TABLE public.conversations
  ADD COLUMN merchant_deleted_at TIMESTAMPTZ,
  ADD COLUMN consumer_deleted_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.soft_delete_conversation(conv_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid          UUID := auth.uid();
  v_consumer_id  UUID;
  v_merchant_id  UUID;
  v_is_merchant  BOOLEAN;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT consumer_id, merchant_id
    INTO v_consumer_id, v_merchant_id
    FROM public.conversations
    WHERE id = conv_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.merchants
    WHERE id = v_merchant_id AND profile_id = v_uid
  ) INTO v_is_merchant;

  IF v_uid = v_consumer_id THEN
    UPDATE public.conversations
      SET consumer_deleted_at = now()
      WHERE id = conv_id;
  ELSIF v_is_merchant THEN
    UPDATE public.conversations
      SET merchant_deleted_at = now()
      WHERE id = conv_id;
  ELSE
    RAISE EXCEPTION 'Not a participant in this conversation';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.soft_delete_conversation(UUID) TO authenticated;
