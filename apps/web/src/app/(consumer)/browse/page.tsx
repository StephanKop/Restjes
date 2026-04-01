import type { Metadata } from 'next'
import { createServerComponentClient } from '@/lib/supabase-server'
import { BrowseFilters } from '@/components/BrowseFilters'
import { DishCard, type DishCardData } from '@/components/DishCard'

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
  const vegetarian = params.vegetarian === '1'
  const vegan = params.vegan === '1'
  const excludeAllergens =
    typeof params.allergens === 'string'
      ? params.allergens.split(',').filter(Boolean)
      : []

  const supabase = await createServerComponentClient()

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

  if (q) {
    query = query.textSearch('search_vector', q, { type: 'websearch' })
  }

  if (vegetarian) {
    query = query.eq('is_vegetarian', true)
  }

  if (vegan) {
    query = query.eq('is_vegan', true)
  }

  const { data: dishes, error } = await query

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

      <BrowseFilters />

      {cards.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-12 text-center shadow-card">
          <p className="mb-2 text-4xl">🍽️</p>
          <h2 className="mb-2 text-xl font-bold text-warm-900">
            Geen gerechten gevonden
          </h2>
          <p className="text-warm-500">
            Geen gerechten gevonden. Probeer andere filters.
          </p>
        </div>
      )}
    </div>
  )
}
