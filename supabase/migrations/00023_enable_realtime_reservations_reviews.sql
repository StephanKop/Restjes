-- Enable Supabase Realtime for reservations, reviews, and dishes so in-app notifications work
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dishes;
