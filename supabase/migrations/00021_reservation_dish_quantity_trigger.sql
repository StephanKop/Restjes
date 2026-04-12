-- Automatically update dish quantity_available and status when reservations change.
-- This replaces the Edge Function approach for quantity management (more reliable, atomic).

CREATE OR REPLACE FUNCTION public.handle_reservation_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Status changed to collected: mark dish as collected if fully claimed
  IF TG_OP = 'UPDATE'
     AND OLD.status = 'confirmed'
     AND NEW.status = 'collected'
  THEN
    UPDATE public.dishes
    SET status = CASE
          WHEN quantity_available <= 0 THEN 'collected'::dish_status
          ELSE status
        END
    WHERE id = NEW.dish_id;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reservation_dish_quantity
  AFTER INSERT OR UPDATE OF status ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_reservation_quantity();
