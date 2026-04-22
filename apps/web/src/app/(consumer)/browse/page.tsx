import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { getCachedBrowseDishes, getCachedBrowseMerchants } from '@/lib/cached-queries'
import { BrowseFilters } from '@/components/BrowseFilters'
import { BrowseResults } from '@/components/BrowseResults'
import type { DishCardData } from '@/components/DishCard'
import { JsonLd } from '@/components/JsonLd'

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
  const t0 = Date.now()
  const mark = (label: string) => {
    console.log(`[browse] ${label}: ${Date.now() - t0}ms`)
  }
  const params = await searchParams
  mark('params resolved')
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
  mark('supabase client ready')

  // If using geolocation, get nearby dish IDs first via RPC
  let nearbyDishIds: string[] | null = null
  if (hasLocation) {
    const { data: nearby, error: rpcError } = await supabase.rpc('nearby_dish_ids', {
      user_lat: lat,
      user_lng: lng,
      radius_m: radiusKm * 1000,
    })
    mark('nearby_dish_ids RPC')
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

  // City filter: explicit URL param wins; "alle" or geolocation = no city filter.
  // We deliberately DO NOT look up the user's profile.city here — that query was
  // ~1400ms on cold Supabase and blocked the whole page. Users pick their city
  // from the sidebar filter (which sets ?city=), and we persist it via URL.
  const filterCity = city === 'alle' || hasLocation ? undefined : city

  const noNearbyResults = nearbyDishIds !== null && nearbyDishIds.length === 0
  const minuteBucket = Math.floor(Date.now() / 60_000)

  const [dishes, merchantMatches] = await Promise.all([
    noNearbyResults
      ? Promise.resolve([])
      : getCachedBrowseDishes({
          city: filterCity,
          q,
          vegetarian,
          vegan,
          frozen,
          fresh,
          nearbyDishIds,
          minuteBucket,
        }),
    q && q.trim()
      ? getCachedBrowseMerchants(q.trim(), filterCity)
      : Promise.resolve([]),
  ])

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

  const itemListJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Beschikbare gerechten',
    description: 'Bekijk beschikbare kliekjes bij jou in de buurt.',
    numberOfItems: cards.length,
    itemListElement: cards.slice(0, 20).map((dish, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://kliekjesclub.nl/gerecht/${dish.id}`,
      name: dish.title,
    })),
  }

  return (
    <div>
      <JsonLd data={itemListJsonLd} />
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

          {merchantMatches.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-warm-500">
                Aanbieders
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {merchantMatches.map((m) => (
                  <Link
                    key={m.id}
                    href={`/merchant/${m.id}`}
                    className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card transition-shadow hover:shadow-lg"
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-brand-100">
                      {m.logo_url ? (
                        <Image
                          src={m.logo_url}
                          alt={m.business_name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-brand-500">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                            <path d="M2.25 9 12 2.25 21.75 9v12.75a.75.75 0 0 1-.75.75h-5.25a.75.75 0 0 1-.75-.75V15h-4.5v6.75a.75.75 0 0 1-.75.75H3a.75.75 0 0 1-.75-.75V9Z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="truncate text-sm font-bold text-warm-900">
                          {m.business_name}
                        </p>
                        {m.is_verified && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0 text-brand-500">
                            <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-warm-500">
                        {m.city && <span>{m.city}</span>}
                        {m.review_count > 0 && m.avg_rating != null && (
                          <span className="inline-flex items-center gap-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#f59e0b" className="h-3.5 w-3.5">
                              <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                            </svg>
                            {Number(m.avg_rating).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <BrowseResults dishes={cards} />
        </div>
      </div>

      {/* CTA section */}
      <BrowseCta />
    </div>
  )
}

async function BrowseCta() {
  const user = await getUser()

  return (
    <section className="mt-12 overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-[4/3] sm:aspect-auto sm:w-2/5">
          <Image
            src="/cta-section.png"
            alt="Iemand deelt een zelfgemaakt gerecht bij de voordeur"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 40vw"
          />
        </div>
        <div className="flex flex-1 flex-col justify-center p-8 sm:p-10">
          {user ? (
            <>
              <h2 className="mb-3 text-2xl font-extrabold text-warm-900">
                Heb je iets lekkers over?
              </h2>
              <p className="mb-6 text-warm-500">
                Maak iemand blij met je kliekjes! Plaats je gerecht in een paar stappen en help mee tegen voedselverspilling in jouw buurt.
              </p>
              <Link
                href="/aanbieder/dishes/new"
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-bold text-white shadow-button transition-all duration-150 hover:bg-brand-600 active:scale-[0.97]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
                Gerecht plaatsen
              </Link>
            </>
          ) : (
            <>
              <h2 className="mb-3 text-2xl font-extrabold text-warm-900">
                Doe mee met de Kliekjesclub
              </h2>
              <p className="mb-6 text-warm-500">
                Deel je kliekjes met buren of ontdek heerlijke gerechten bij jou in de buurt. Samen maken we voedselverspilling een stuk leuker.
              </p>
              <Link
                href="/signup"
                className="inline-flex w-fit rounded-xl bg-brand-500 px-6 py-3 font-bold text-white shadow-button transition-all duration-150 hover:bg-brand-600 active:scale-[0.97]"
              >
                Gratis aanmelden
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
