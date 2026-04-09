-- Returns available dish IDs within a given radius (in meters) of a point.
-- Used by the browse page distance filter.
CREATE OR REPLACE FUNCTION public.nearby_dish_ids(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_m DOUBLE PRECISION DEFAULT 10000
)
RETURNS TABLE (dish_id UUID, distance_m DOUBLE PRECISION)
LANGUAGE sql STABLE
AS $$
  SELECT
    d.id AS dish_id,
    extensions.earth_distance(
      extensions.ll_to_earth(user_lat, user_lng),
      extensions.ll_to_earth(m.latitude, m.longitude)
    ) AS distance_m
  FROM public.dishes d
  JOIN public.merchants m ON m.id = d.merchant_id
  WHERE d.status = 'available'
    AND d.quantity_available > 0
    AND m.latitude IS NOT NULL
    AND m.longitude IS NOT NULL
    AND extensions.earth_distance(
      extensions.ll_to_earth(user_lat, user_lng),
      extensions.ll_to_earth(m.latitude, m.longitude)
    ) <= radius_m
  ORDER BY distance_m;
$$;
