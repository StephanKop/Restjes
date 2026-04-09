import type { Metadata } from 'next'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { BrowseFilters } from '@/components/BrowseFilters'
import { BrowseResults } from '@/components/BrowseResults'
import type { DishCardData } from '@/components/DishCard'

export const metadata: Metadata = {
  title: 'Ontdekken - Restjes',
  description: 'Bekijk beschikbare restjes bij jou in de buurt.',
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
        city
      ),
      dish_allergies (
        allergen
      )
    `,
    )
    .eq('status', 'available')
    .gt('quantity_available', 0)
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
    const merchant = dish.merchant as unknown as { business_name: string; city: string }
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
          <details className="mb-6 rounded-2xl bg-white shadow-card lg:hidden">
            <summary className="cursor-pointer px-5 py-3 text-sm font-semibold text-warm-700">
              Filters
              {(filterCity || hasLocation || vegetarian || vegan || excludeAllergens.length > 0) && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-100 px-1.5 text-[10px] font-bold text-brand-700">
                  !
                </span>
              )}
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
