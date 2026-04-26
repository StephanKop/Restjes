-- Mark dishes whose pickup window has passed as `expired`.
--
-- The dish_status enum has had an `expired` value since 00002, but no row
-- ever transitioned to it: clients fall back to showing "Available" on
-- dishes that are actually past their pickup window. This migration adds
-- a pg_cron job that flips overdue dishes every 5 minutes.

-- 1. Ensure pg_cron is available -----------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Helper that performs the transition --------------------------------
CREATE OR REPLACE FUNCTION public.expire_overdue_dishes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.dishes
     SET status = 'expired'::dish_status
   WHERE status IN ('available', 'reserved')
     AND pickup_end IS NOT NULL
     AND pickup_end < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 3. Schedule the job (idempotent) --------------------------------------
DO $$
BEGIN
  PERFORM cron.unschedule('expire-overdue-dishes');
EXCEPTION WHEN OTHERS THEN
  -- No existing job with that name — nothing to remove.
  NULL;
END $$;

SELECT cron.schedule(
  'expire-overdue-dishes',
  '*/5 * * * *',
  $$ SELECT public.expire_overdue_dishes(); $$
);

-- 4. One-shot repair so dishes that are already past their window flip
--    immediately instead of waiting for the next cron tick.
SELECT public.expire_overdue_dishes();
