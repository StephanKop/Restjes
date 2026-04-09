-- Migration: Remove user role system
-- All users can both browse/reserve and offer dishes.
-- The merchants table determines merchant capability, not a role column.

-- 1. Drop the RLS policy that depends on the role column
DROP POLICY IF EXISTS "Merchant role can create a merchant" ON public.merchants;

-- 2. Drop the role column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- 3. Drop the user_role enum type
DROP TYPE IF EXISTS public.user_role;
