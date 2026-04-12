import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-admin'
import { formatDateTime } from '@/lib/format'
import { StatusBadge } from '@/components/StatusBadge'
import { DishStatusSelect } from './DishStatusSelect'
import { EditDishForm } from './EditDishForm'
import { DeleteDishButton } from './DeleteDishButton'

export const metadata: Metadata = {
  title: 'Gerecht details',
}

interface DishDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function DishDetailPage({ params }: DishDetailPageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  const [
    { data: dish },
    { data: ingredients },
    { data: allergies },
    { data: reservations },
  ] = await Promise.all([
    supabase
      .from('dishes')
      .select('*, merchant:merchants!inner(id, business_name)')
      .eq('id', id)
      .single(),
    supabase.from('dish_ingredients').select('id, name').eq('dish_id', id),
    supabase.from('dish_allergies').select('id, allergen').eq('dish_id', id),
    supabase
      .from('reservations')
      .select('id, status, quantity, created_at, consumer:profiles!reservations_consumer_id_fkey(display_name)')
      .eq('dish_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  if (!dish) notFound()

  const merchant = dish.merchant as unknown as { id: string; business_name: string }

  const allergenLabels: Record<string, string> = {
    gluten: 'Gluten', crustaceans: 'Schaaldieren', eggs: 'Eieren', fish: 'Vis',
    peanuts: "Pinda's", soybeans: 'Soja', milk: 'Melk', nuts: 'Noten',
    celery: 'Selderij', mustard: 'Mosterd', sesame: 'Sesam', sulphites: 'Sulfieten',
    lupin: 'Lupine', molluscs: 'Weekdieren',
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dishes" className="text-sm text-warm-500 hover:text-warm-700">
          &larr; Terug naar gerechten
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          {dish.image_url ? (
            <Image src={dish.image_url} alt={dish.title} width={80} height={80} className="h-20 w-20 rounded-xl object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-warm-100 text-warm-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 3h18M3 3v18m0-18 3.75 3.75M21 3v18m0-18-3.75 3.75M3 21h18" />
              </svg>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-warm-900">{dish.title}</h1>
              <StatusBadge status={dish.status} type="dish" />
            </div>
            <Link href={`/merchants/${merchant.id}`} className="text-sm text-warm-500 hover:text-brand-600">
              {merchant.business_name}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DishStatusSelect dishId={id} currentStatus={dish.status} />
          <DeleteDishButton dishId={id} dishTitle={dish.title} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Dish details */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl bg-white p-5 shadow-card">
            <h2 className="mb-4 font-bold text-warm-900">Details</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-warm-500">Beschrijving</dt>
                <dd className="font-medium text-warm-800">{dish.description ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-warm-500">Aantal beschikbaar</dt>
                <dd className="font-medium text-warm-800">{dish.quantity_available}</dd>
              </div>
              <div>
                <dt className="text-warm-500">Ophaalperiode</dt>
                <dd className="font-medium text-warm-800">
                  {dish.pickup_start && dish.pickup_end
                    ? `${formatDateTime(dish.pickup_start)} - ${formatDateTime(dish.pickup_end)}`
                    : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-warm-500">Eigen container</dt>
                <dd className="font-medium text-warm-800">{dish.bring_own_container ? 'Ja' : 'Nee'}</dd>
              </div>
              <div>
                <dt className="text-warm-500">Dieet</dt>
                <dd className="flex gap-1 font-medium text-warm-800">
                  {dish.is_vegetarian && <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">Vegetarisch</span>}
                  {dish.is_vegan && <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Vegan</span>}
                  {!dish.is_vegetarian && !dish.is_vegan && '-'}
                </dd>
              </div>
              <div>
                <dt className="text-warm-500">Aangemaakt</dt>
                <dd className="font-medium text-warm-800">{formatDateTime(dish.created_at)}</dd>
              </div>
              <div>
                <dt className="text-warm-500">Laatst bijgewerkt</dt>
                <dd className="font-medium text-warm-800">{formatDateTime(dish.updated_at)}</dd>
              </div>
            </dl>

            <div className="mt-5">
              <EditDishForm
                dishId={id}
                currentData={{
                  title: dish.title,
                  description: dish.description ?? '',
                  quantity_available: dish.quantity_available,
                  is_vegetarian: dish.is_vegetarian,
                  is_vegan: dish.is_vegan,
                  bring_own_container: dish.bring_own_container,
                }}
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="rounded-xl bg-white p-5 shadow-card">
            <h2 className="mb-3 font-bold text-warm-900">Ingredienten</h2>
            {ingredients && ingredients.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {ingredients.map((ing) => (
                  <span key={ing.id} className="rounded-lg bg-warm-50 px-2.5 py-1 text-xs font-medium text-warm-700">
                    {ing.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-warm-400">Geen ingredienten opgegeven</p>
            )}
          </div>

          {/* Allergies */}
          <div className="rounded-xl bg-white p-5 shadow-card">
            <h2 className="mb-3 font-bold text-warm-900">Allergenen</h2>
            {allergies && allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {allergies.map((a) => (
                  <span key={a.id} className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                    {allergenLabels[a.allergen] ?? a.allergen}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-warm-400">Geen allergenen opgegeven</p>
            )}
          </div>
        </div>

        {/* Reservations for this dish */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white shadow-card">
            <div className="border-b border-warm-100 px-5 py-4">
              <h2 className="font-bold text-warm-900">Reserveringen ({reservations?.length ?? 0})</h2>
            </div>
            <div className="divide-y divide-warm-50">
              {(reservations ?? []).map((res) => {
                const consumer = res.consumer as unknown as { display_name: string | null } | null
                return (
                  <Link
                    key={res.id}
                    href={`/reservations/${res.id}`}
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-warm-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-warm-800">{consumer?.display_name ?? 'Onbekend'}</p>
                      <p className="text-xs text-warm-500">{res.quantity}x · {formatDateTime(res.created_at)}</p>
                    </div>
                    <StatusBadge status={res.status} type="reservation" />
                  </Link>
                )
              })}
              {(!reservations || reservations.length === 0) && (
                <p className="px-5 py-4 text-sm text-warm-400">Geen reserveringen voor dit gerecht</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
