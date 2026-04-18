import { unstable_cache } from 'next/cache'
import { createServerComponentClient } from '@/lib/supabase-server'

/**
 * Cached dish detail — revalidates every 60 seconds.
 * Public data only (no auth-dependent fields).
 */
export const getCachedDish = unstable_cache(
  async (id: string) => {
    const supabase = await createServerComponentClient()
    const { data, error } = await supabase
      .from('dishes')
      .select(
        `
        id, merchant_id, title, description, image_url, quantity_available, status,
        pickup_start, pickup_end, bring_own_container, is_vegetarian, is_vegan, is_frozen,
        expires_at,
        dish_ingredients (id, name),
        dish_allergies (id, allergen),
        merchant:merchants!inner (
          id, business_name, city, address_line1, logo_url,
          avg_rating, review_count, is_verified
        )
      `,
      )
      .eq('id', id)
      .single()

    if (error) return null
    return data
  },
  ['dish-detail'],
  { revalidate: 60, tags: ['dishes'] },
)

/**
 * Cached merchant profile — revalidates every 5 minutes.
 */
export const getCachedMerchant = unstable_cache(
  async (id: string) => {
    const supabase = await createServerComponentClient()
    const { data } = await supabase
      .from('merchants')
      .select(
        `id, business_name, description, address_line1, city, postal_code,
         logo_url, banner_url, avg_rating, review_count, is_verified`,
      )
      .eq('id', id)
      .single()

    return data
  },
  ['merchant-detail'],
  { revalidate: 300, tags: ['merchants'] },
)

/**
 * Cached merchant dishes — revalidates every 60 seconds.
 */
export const getCachedMerchantDishes = unstable_cache(
  async (merchantId: string) => {
    const supabase = await createServerComponentClient()
    const { data } = await supabase
      .from('dishes')
      .select(
        `id, title, description, image_url, quantity_available,
         pickup_start, pickup_end, bring_own_container, is_vegetarian, is_vegan,
         dish_allergies (allergen)`,
      )
      .eq('merchant_id', merchantId)
      .eq('status', 'available')
      .gt('quantity_available', 0)
      .order('pickup_start', { ascending: true })

    return data ?? []
  },
  ['merchant-dishes'],
  { revalidate: 60, tags: ['dishes'] },
)

/**
 * Cached merchant reviews — revalidates every 5 minutes.
 */
export const getCachedMerchantReviews = unstable_cache(
  async (merchantId: string, limit?: number) => {
    const supabase = await createServerComponentClient()
    let query = supabase
      .from('reviews')
      .select(
        `id, rating, comment, created_at, merchant_reply, merchant_replied_at,
         consumer:profiles!consumer_id (display_name, avatar_url)`,
      )
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })

    if (limit) query = query.limit(limit)

    const { data } = await query
    return data ?? []
  },
  ['merchant-reviews'],
  { revalidate: 300, tags: ['reviews'] },
)

/**
 * Cached all reviews with dish titles — revalidates every 5 minutes.
 */
export const getCachedMerchantReviewsFull = unstable_cache(
  async (merchantId: string) => {
    const supabase = await createServerComponentClient()
    const { data } = await supabase
      .from('reviews')
      .select(
        `id, rating, comment, created_at, merchant_reply, merchant_replied_at,
         consumer:profiles!consumer_id (display_name, avatar_url),
         reservation:reservations (dish:dishes (title))`,
      )
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })

    return data ?? []
  },
  ['merchant-reviews-full'],
  { revalidate: 300, tags: ['reviews'] },
)

/**
 * Cached browse dishes — revalidates every 30 seconds.
 * Note: only used for non-personalized browse (no city/location filter).
 */
export const getCachedBrowseDishes = unstable_cache(
  async () => {
    const supabase = await createServerComponentClient()
    const { data } = await supabase
      .from('dishes')
      .select(
        `id, title, description, image_url, quantity_available,
         pickup_start, pickup_end, bring_own_container, is_vegetarian, is_vegan,
         merchant:merchants!inner (business_name, city, latitude, longitude),
         dish_allergies (allergen)`,
      )
      .eq('status', 'available')
      .gt('quantity_available', 0)
      .or(`pickup_end.gt.${new Date().toISOString()},pickup_end.is.null`)
      .order('pickup_start', { ascending: true })

    return data ?? []
  },
  ['browse-dishes'],
  { revalidate: 30, tags: ['dishes'] },
)
