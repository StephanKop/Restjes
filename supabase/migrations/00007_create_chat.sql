-- Conversations between a consumer and a merchant, optionally tied to a dish
CREATE TABLE public.conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES public.merchants ON DELETE CASCADE,
  consumer_id     UUID NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
  dish_id         UUID REFERENCES public.dishes ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (merchant_id, consumer_id, dish_id)
);

CREATE INDEX idx_conversations_merchant_id ON public.conversations (merchant_id);
CREATE INDEX idx_conversations_consumer_id ON public.conversations (consumer_id);

-- Individual messages
CREATE TABLE public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
  content         TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation_created
  ON public.messages (conversation_id, created_at);
CREATE INDEX idx_messages_sender_id ON public.messages (sender_id);
CREATE INDEX idx_messages_unread
  ON public.messages (conversation_id)
  WHERE is_read = FALSE;

-- Keep conversation.last_message_at up to date
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_messages_update_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();

-- Enable Supabase Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
