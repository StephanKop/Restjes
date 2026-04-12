-- Realtime filters on non-PK columns require REPLICA IDENTITY FULL
-- Without this, filters like conversation_id=eq.xxx silently drop events
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.reservations REPLICA IDENTITY FULL;
ALTER TABLE public.reviews REPLICA IDENTITY FULL;
ALTER TABLE public.dishes REPLICA IDENTITY FULL;
