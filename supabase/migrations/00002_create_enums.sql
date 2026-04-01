-- User roles
CREATE TYPE public.user_role AS ENUM ('consumer', 'merchant');

-- EU-14 allergens
CREATE TYPE public.allergen AS ENUM (
  'gluten',
  'crustaceans',
  'eggs',
  'fish',
  'peanuts',
  'soybeans',
  'milk',
  'nuts',
  'celery',
  'mustard',
  'sesame',
  'sulphites',
  'lupin',
  'molluscs'
);

-- Dish lifecycle
CREATE TYPE public.dish_status AS ENUM ('available', 'reserved', 'collected', 'expired');

-- Reservation lifecycle
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'collected', 'cancelled', 'no_show');
