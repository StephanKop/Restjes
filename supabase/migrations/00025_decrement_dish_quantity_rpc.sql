-- RPC function to decrement dish quantity and update status.
-- Uses SECURITY DEFINER to bypass RLS so consumers can trigger it.
-- This is a safety net alongside the trigger in 00021.

CREATE OR REPLACE FUNCTION public.decrement_dish_quantity(
  p_dish_id UUID,
  p_quantity INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_qty INTEGER;
BEGIN
  UPDATE public.dishes
  SET quantity_available = GREATEST(0, quantity_available - p_quantity)
  WHERE id = p_dish_id
  RETURNING quantity_available INTO v_new_qty;

  IF v_new_qty <= 0 THEN
    UPDATE public.dishes
    SET status = 'reserved'
    WHERE id = p_dish_id AND status = 'available';
  END IF;
END;
$$;

-- RPC function to mark a dish as collected (if no quantity left).
CREATE OR REPLACE FUNCTION public.mark_dish_collected(p_dish_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.dishes
  SET status = 'collected'
  WHERE id = p_dish_id AND quantity_available <= 0 AND status IN ('available', 'reserved');
END;
$$;
