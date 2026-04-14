-- Fix: mark_dish_collected should check actual reservation state, not just
-- quantity_available.  When every reservation for a dish is terminal
-- (collected / cancelled / no_show), the dish is done regardless of what
-- quantity_available says (it may have drifted if the trigger was added
-- after existing reservations were created).

-- 1. Updated RPC -----------------------------------------------------------

CREATE OR REPLACE FUNCTION public.mark_dish_collected(p_dish_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active INTEGER;
BEGIN
  -- Count reservations that are still in progress
  SELECT count(*)::int INTO v_active
    FROM public.reservations
   WHERE dish_id = p_dish_id
     AND status IN ('pending', 'confirmed');

  -- No active reservations left → mark the dish as collected
  IF v_active = 0 THEN
    UPDATE public.dishes
       SET status = 'collected',
           quantity_available = 0
     WHERE id = p_dish_id
       AND status IN ('available', 'reserved');
  END IF;
END;
$$;

-- 2. Updated trigger function ----------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_reservation_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active INTEGER;
BEGIN
  -- New reservation placed: decrement quantity
  IF TG_OP = 'INSERT' AND NEW.status IN ('pending', 'confirmed') THEN
    UPDATE public.dishes
    SET quantity_available = GREATEST(0, quantity_available - NEW.quantity),
        status = CASE
          WHEN quantity_available - NEW.quantity <= 0 THEN 'reserved'::dish_status
          ELSE status
        END
    WHERE id = NEW.dish_id;
    RETURN NEW;
  END IF;

  -- Status changed to cancelled or no_show: restore quantity
  IF TG_OP = 'UPDATE'
     AND OLD.status IN ('pending', 'confirmed')
     AND NEW.status IN ('cancelled', 'no_show')
  THEN
    UPDATE public.dishes
    SET quantity_available = quantity_available + OLD.quantity,
        status = CASE
          WHEN status = 'reserved' THEN 'available'::dish_status
          ELSE status
        END
    WHERE id = NEW.dish_id;
    RETURN NEW;
  END IF;

  -- Status changed to collected: mark dish as collected if no active
  -- reservations remain (safer than checking quantity_available alone).
  IF TG_OP = 'UPDATE'
     AND OLD.status = 'confirmed'
     AND NEW.status = 'collected'
  THEN
    SELECT count(*)::int INTO v_active
      FROM public.reservations
     WHERE dish_id = NEW.dish_id
       AND status IN ('pending', 'confirmed');

    IF v_active = 0 THEN
      UPDATE public.dishes
         SET status = 'collected'::dish_status,
             quantity_available = 0
       WHERE id = NEW.dish_id
         AND status IN ('available', 'reserved');
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Data repair: fix any dishes that are stuck as available/reserved but
--    have no active reservations left (all are collected/cancelled/no_show).

UPDATE public.dishes d
   SET status = 'collected',
       quantity_available = 0
 WHERE d.status IN ('available', 'reserved')
   AND EXISTS (
     SELECT 1 FROM public.reservations r
      WHERE r.dish_id = d.id
        AND r.status = 'collected'
   )
   AND NOT EXISTS (
     SELECT 1 FROM public.reservations r
      WHERE r.dish_id = d.id
        AND r.status IN ('pending', 'confirmed')
   );
