import type { Metadata } from 'next'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { BrowseFilters } from '@/components/BrowseFilters'
import { BrowseResults } from '@/components/BrowseResults'
import type { DishCardData } from '@/components/DishCard'

export const metadata: Metadata = {
  title: 'Ontdekken',
  description: 'Bekijk beschikbare kliekjes bij jou in de buurt. Filter op dieet, allergenen en locatie.',
  openGraph: {
    title: 'Ontdekken - Kliekjesclub',
    description: 'Bekijk beschikbare kliekjes bij jou in de buurt.',
  },
  alternates: { canonical: '/browse' },
}

interface BrowsePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q : undefined
  const city = typeof params.city === 'string' ? params.city : undefined
  const vegetarian = params.vegetarian === '1'
  const vegan = params.vegan === '1'
  const frozen = params.frozen === '1'
  const fresh = params.fresh === '1'
  const excludeAllergens =
    typeof params.allergens === 'string'
      ? params.allergens.split(',').filter(Boolean)
      : []

  // Geolocation params
  const lat = typeof params.lat === 'string' ? parseFloat(params.lat) : undefined
  const lng = typeof params.lng === 'string' ? parseFloat(params.lng) : undefined
  const radiusKm = typeof params.radius === 'string' ? parseFloat(params.radius) : 5
  const hasLocation = lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)

  const supabase = await createServerComponentClient()

  // If using geolocation, get nearby dish IDs first via RPC
  let nearbyDishIds: string[] | null = null
  if (hasLocation) {
    const { data: nearby, error: rpcError } = await supabase.rpc('nearby_dish_ids', {
      user_lat: lat,
      user_lng: lng,
      radius_m: radiusKm * 1000,
    })
    if (rpcError) {
      console.error('nearby_dish_ids RPC error:', rpcError)
      // Fall back to showing all dishes rather than showing nothing
    } else if (nearby && nearby.length > 0) {
      nearbyDishIds = nearby.map((r: { dish_id: string }) => r.dish_id)
    } else {
      // RPC succeeded but no dishes in range — return empty results
      nearbyDishIds = []
    }
  }

  // If no city filter in URL, use the user's profile city. "alle" means show all.
  // Skip city filter when geolocation is active.
  let filterCity = city === 'alle' || hasLocation ? undefined : city
  if (filterCity === undefined && city !== 'alle' && !hasLocation) {
    const user = await getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('city')
        .eq('id', user.id)
        .single()
      filterCity = profile?.city ?? undefined
    }
  }

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
    .or(`pickup_end.gt.${new Date().toISOString()},pickup_end.is.null`)
    .order('pickup_start', { ascending: true })

  if (nearbyDishIds !== null && nearbyDishIds.length > 0) {
    query = query.in('id', nearbyDishIds)
  }

  if (filterCity) {
    query = query.eq('merchant.city', filterCity)
  }

  if (q) {
    query = query.textSearch('search_vector', q, { type: 'websearch' })
  }

  if (vegetarian) {
    query = query.eq('is_vegetarian', true)
  }

  if (vegan) {
    query = query.eq('is_vegan', true)
  }

  if (frozen) {
    query = query.eq('is_frozen', true)
  }

  if (fresh) {
    query = query.eq('is_frozen', false)
  }

  // If location filter is active but no dishes are in range, skip the query
  const noNearbyResults = nearbyDishIds !== null && nearbyDishIds.length === 0
  const { data: dishes, error } = noNearbyResults
    ? { data: [] as typeof query extends PromiseLike<{ data: infer D }> ? D : never, error: null }
    : await query

  if (error) {
    console.error('Error fetching dishes:', error)
  }

  // Filter out dishes that contain excluded allergens (done in JS since
  // Supabase doesn't support NOT EXISTS on related tables easily via PostgREST)
  let filteredDishes = dishes ?? []

  if (excludeAllergens.length > 0) {
    filteredDishes = filteredDishes.filter((dish) => {
      const dishAllergens = (dish.dish_allergies as { allergen: string }[]).map(
        (a) => a.allergen,
      )
      return !excludeAllergens.some((allergen) => dishAllergens.includes(allergen))
    })
  }

  // Map to DishCardData
  const cards: DishCardData[] = filteredDishes.map((dish) => {
    const merchant = dish.merchant as unknown as { business_name: string; city: string; latitude: number | null; longitude: number | null }
    return {
      id: dish.id,
      title: dish.title,
      description: dish.description,
      image_url: dish.image_url,
      quantity_available: dish.quantity_available,
      pickup_start: dish.pickup_start,
      pickup_end: dish.pickup_end,
      bring_own_container: dish.bring_own_container,
      is_vegetarian: dish.is_vegetarian,
      is_vegan: dish.is_vegan,
      merchant: {
        business_name: merchant.business_name,
        city: merchant.city,
        latitude: merchant.latitude,
        longitude: merchant.longitude,
      },
      allergen_count: (dish.dish_allergies as { allergen: string }[]).length,
    }
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-extrabold text-warm-900">Ontdekken</h1>
        <p className="text-warm-500">Bekijk wat er bij jou in de buurt beschikbaar is</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters — hidden on mobile, shown on lg+ */}
        <div className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl bg-white p-5 shadow-card">
            <BrowseFilters userCity={filterCity} />
          </div>
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Mobile filters — shown below lg */}
          <details className="group mb-6 rounded-2xl bg-white shadow-card lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 text-sm font-semibold text-warm-700 [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-warm-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
                Filters
                {(filterCity || hasLocation || vegetarian || vegan || frozen || fresh || excludeAllergens.length > 0) && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-100 px-1.5 text-[10px] font-bold text-brand-700">
                    !
                  </span>
                )}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-warm-400 transition-transform group-open:rotate-180">
                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </summary>
            <div className="border-t border-warm-100 p-5">
              <BrowseFilters userCity={filterCity} />
            </div>
          </details>

          <BrowseResults dishes={cards} />
        </div>
      </div>
    </div>
  )
}
