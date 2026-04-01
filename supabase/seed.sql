-- ============================================================
-- Seed data for local development
-- Run with: supabase db reset  (applies migrations + seed)
-- ============================================================

-- We use fixed UUIDs so foreign keys line up deterministically.

-- Two merchant profiles (inserted directly; the auth trigger won't fire
-- because we're bypassing auth.users in seed mode).
INSERT INTO public.profiles (id, role, display_name, phone) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'merchant', 'Jan de Bakker',   '+31612345678'),
  ('a2222222-2222-2222-2222-222222222222', 'merchant', 'Maria van Dijk',  '+31687654321'),
  ('c1111111-1111-1111-1111-111111111111', 'consumer', 'Pieter Jansen',   '+31699887766'),
  ('c2222222-2222-2222-2222-222222222222', 'consumer', 'Sophie de Vries', '+31611223344');

-- Merchants
INSERT INTO public.merchants (id, profile_id, business_name, description, address_line1, city, postal_code, latitude, longitude, kvk_number, is_verified) VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'Bakkerij Jan',
    'Ambachtelijke bakker in het centrum van Amsterdam. Dagelijks vers brood en gebak.',
    'Haarlemmerstraat 42',
    'Amsterdam',
    '1013 ES',
    52.3792,
    4.8862,
    '12345678',
    TRUE
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'a2222222-2222-2222-2222-222222222222',
    'Trattoria Maria',
    'Italiaanse keuken met een Nederlandse twist. Elke dag verse pasta en pizza.',
    'Witte de Withstraat 18',
    'Rotterdam',
    '3012 BP',
    51.9171,
    4.4759,
    '87654321',
    TRUE
  );

-- Dishes for Bakkerij Jan
INSERT INTO public.dishes (id, merchant_id, title, description, quantity_available, status, pickup_start, pickup_end, is_vegetarian) VALUES
  (
    'd1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'Broodjes mix',
    'Assortiment van 5 broodjes die vandaag niet verkocht zijn. Bevat o.a. volkoren, tijger en croissants.',
    3,
    'available',
    now() + INTERVAL '1 hour',
    now() + INTERVAL '3 hours',
    TRUE
  ),
  (
    'd2222222-2222-2222-2222-222222222222',
    'b1111111-1111-1111-1111-111111111111',
    'Taart van de dag',
    'Halve appeltaart, vers gebakken vanmorgen. Te mooi om weg te gooien!',
    1,
    'available',
    now() + INTERVAL '2 hours',
    now() + INTERVAL '4 hours',
    TRUE
  );

-- Dishes for Trattoria Maria
INSERT INTO public.dishes (id, merchant_id, title, description, quantity_available, status, pickup_start, pickup_end, is_vegetarian, is_vegan) VALUES
  (
    'd3333333-3333-3333-3333-333333333333',
    'b2222222-2222-2222-2222-222222222222',
    'Pasta bolognese portie',
    'Ruime portie huisgemaakte pasta bolognese. Genoeg voor 2 personen.',
    2,
    'available',
    now() + INTERVAL '30 minutes',
    now() + INTERVAL '2 hours',
    FALSE,
    FALSE
  ),
  (
    'd4444444-4444-4444-4444-444444444444',
    'b2222222-2222-2222-2222-222222222222',
    'Minestrone soep (1L)',
    'Verse groentesoep, volledig plantaardig. Eigen container meenemen!',
    4,
    'available',
    now() + INTERVAL '1 hour',
    now() + INTERVAL '3 hours',
    TRUE,
    TRUE
  );

-- Ingredients
INSERT INTO public.dish_ingredients (dish_id, name) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'tarwebloem'),
  ('d1111111-1111-1111-1111-111111111111', 'gist'),
  ('d1111111-1111-1111-1111-111111111111', 'boter'),
  ('d2222222-2222-2222-2222-222222222222', 'appels'),
  ('d2222222-2222-2222-2222-222222222222', 'kaneel'),
  ('d2222222-2222-2222-2222-222222222222', 'boter'),
  ('d2222222-2222-2222-2222-222222222222', 'tarwebloem'),
  ('d3333333-3333-3333-3333-333333333333', 'pasta'),
  ('d3333333-3333-3333-3333-333333333333', 'rundergehakt'),
  ('d3333333-3333-3333-3333-333333333333', 'tomatensaus'),
  ('d4444444-4444-4444-4444-444444444444', 'wortel'),
  ('d4444444-4444-4444-4444-444444444444', 'courgette'),
  ('d4444444-4444-4444-4444-444444444444', 'tomaat'),
  ('d4444444-4444-4444-4444-444444444444', 'bonen');

-- Allergens
INSERT INTO public.dish_allergies (dish_id, allergen) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'gluten'),
  ('d1111111-1111-1111-1111-111111111111', 'milk'),
  ('d2222222-2222-2222-2222-222222222222', 'gluten'),
  ('d2222222-2222-2222-2222-222222222222', 'milk'),
  ('d2222222-2222-2222-2222-222222222222', 'eggs'),
  ('d3333333-3333-3333-3333-333333333333', 'gluten'),
  ('d4444444-4444-4444-4444-444444444444', 'celery');
