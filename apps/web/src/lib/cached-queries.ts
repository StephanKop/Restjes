import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

/**
 * Anonymous Supabase client for cached queries.
 * Does NOT use cookies — only for public data that doesn't need auth.
 */
function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

/**
 * Cached dish detail — revalidates every 60 seconds.
 */
export const getCachedDish = unstable_cache(
  async (id: string) => {
    const supabase = getPublicClient()
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
    const supabase = getPublicClient()
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
    const supabase = getPublicClient()
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
    const supabase = getPublicClient()
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
 * Cached /browse dishes query — revalidates every 60 seconds.
 *
 * Cache key includes every filter + a per-minute `minuteBucket` so the
 * `pickup_end > now()` filter stays reasonably fresh without breaking the
 * cache on every request.
 */
export type BrowseDishFilters = {
  city?: string
  q?: string
  vegetarian: boolean
  vegan: boolean
  frozen: boolean
  fresh: boolean
  nearbyDishIds: string[] | null
  minuteBucket: number
}

export const getCachedBrowseDishes = unstable_cache(
  async (filters: BrowseDishFilters) => {
    const supabase = getPublicClient()
    const cutoff = new Date(filters.minuteBucket * 60_000).toISOString()

    let query = supabase
      .from('dishes')
      .select(
        `
        id,
        title,
        description,
        image_url,
        quantity_available,
        pickup_start,
        pickup_end,
        bring_own_container,
        is_vegetarian,
        is_vegan,
        merchant:merchants!inner (
          business_name,
          city,
          latitude,
          longitude
        ),
        dish_allergies (
          allergen
        )
      `,
      )
      .eq('status', 'available')
      .gt('quantity_available', 0)
      .or(`pickup_end.gt.${cutoff},pickup_end.is.null`)
      .order('pickup_start', { ascending: true })

    if (filters.nearbyDishIds !== null && filters.nearbyDishIds.length > 0) {
      query = query.in('id', filters.nearbyDishIds)
    }
    if (filters.city) query = query.eq('merchant.city', filters.city)
    if (filters.q) query = query.textSearch('search_vector', filters.q, { type: 'websearch' })
    if (filters.vegetarian) query = query.eq('is_vegetarian', true)
    if (filters.vegan) query = query.eq('is_vegan', true)
    if (filters.frozen) query = query.eq('is_frozen', true)
    if (filters.fresh) query = query.eq('is_frozen', false)

    const { data, error } = await query
    if (error) {
      console.error('[getCachedBrowseDishes] error:', error)
      return []
    }
    return data ?? []
  },
  ['browse-dishes'],
  { revalidate: 60, tags: ['dishes'] },
)

/**
 * Cached merchant search by business_name for /browse — 60s TTL.
 */
export const getCachedBrowseMerchants = unstable_cache(
  async (q: string, city?: string) => {
    const supabase = getPublicClient()
    let query = supabase
      .from('merchants')
      .select('id, business_name, city, logo_url, avg_rating, review_count, is_verified')
      .ilike('business_name', `%${q}%`)
      .order('business_name', { ascending: true })
      .limit(5)
    if (city) query = query.eq('city', city)
    const { data } = await query
    return data ?? []
  },
  ['browse-merchants'],
  { revalidate: 60, tags: ['merchants'] },
)

/**
 * Cached all reviews with dish titles — revalidates every 5 minutes.
 */
export const getCachedMerchantReviewsFull = unstable_cache(
  async (merchantId: string) => {
    const supabase = getPublicClient()
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
