import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { formatPickupTime, allergenLabel } from '@/lib/format'
import { ReserveButton } from '@/components/ReserveButton'
import { StartChatButton } from '@/components/StartChatButton'
import { JsonLd } from '@/components/JsonLd'

interface DishPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: DishPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerComponentClient()

  const { data: dish } = await supabase
    .from('dishes')
    .select('title, description, image_url, merchant:merchants!inner(business_name)')
    .eq('id', id)
    .single()

  if (!dish) {
    return { title: 'Gerecht niet gevonden - Restjes' }
  }

  const merchant = dish.merchant as unknown as { business_name: string }

  return {
    title: `${dish.title} bij ${merchant.business_name} - Restjes`,
    description: dish.description ?? `Bekijk ${dish.title} bij ${merchant.business_name} op Restjes.`,
    openGraph: {
      title: `${dish.title} bij ${merchant.business_name}`,
      description: dish.description ?? undefined,
      type: 'website',
      images: dish.image_url ? [{ url: dish.image_url }] : undefined,
    },
  }
}

export default async function DishPage({ params }: DishPageProps) {
  const { id } = await params
  const supabase = await createServerComponentClient()

  const { data: dish, error } = await supabase
    .from('dishes')
    .select(
      `
      id,
      merchant_id,
      title,
      description,
      image_url,
      quantity_available,
      status,
      pickup_start,
      pickup_end,
      bring_own_container,
      is_vegetarian,
      is_vegan,
      dish_ingredients (
        id,
        name
      ),
      dish_allergies (
        id,
        allergen
      ),
      merchant:merchants!inner (
        id,
        business_name,
        city,
        logo_url,
        avg_rating,
        review_count,
        is_verified
      )
    `,
    )
    .eq('id', id)
    .single()

  if (error || !dish) {
    notFound()
  }

  const merchant = dish.merchant as unknown as {
    id: string
    business_name: string
    city: string
    logo_url: string | null
    avg_rating: number | null
    review_count: number
    is_verified: boolean
  }

  const ingredients = dish.dish_ingredients as { id: string; name: string }[]
  const allergies = dish.dish_allergies as { id: string; allergen: string }[]

  const isAvailable = dish.status === 'available' && dish.quantity_available > 0
  const pickupLabel = formatPickupTime(dish.pickup_start, dish.pickup_end)

  // Check auth for reserve button
  const user = await getUser()

  const productJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: dish.title,
    description: dish.description ?? undefined,
    image: dish.image_url ?? undefined,
    offers: {
      '@type': 'Offer',
      availability: isAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
      seller: {
        '@type': 'Organization',
        name: merchant.business_name,
      },
    },
  }

  return (
    <div>
      <JsonLd data={productJsonLd} />

      {/* Image header */}
      <div className="relative -mx-6 -mt-8 mb-8 aspect-[16/7] w-[calc(100%+3rem)] overflow-hidden sm:rounded-2xl sm:mx-0 sm:mt-0 sm:w-full">
        {dish.image_url ? (
          <Image
            src={dish.image_url}
            alt={dish.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600">
            <span className="text-7xl" role="img" aria-label="Gerecht">
              🍽️
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold text-warm-900">{dish.title}</h1>
            {dish.description && (
              <p className="text-warm-600 leading-relaxed">{dish.description}</p>
            )}
          </div>

          {/* Unavailable notice */}
          {!isAvailable && (
            <div className="rounded-2xl border border-warm-200 bg-warm-50 p-6 text-center">
              <p className="text-lg font-bold text-warm-700">
                Dit gerecht is niet meer beschikbaar
              </p>
            </div>
          )}

          {/* Info grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem
              icon="🕐"
              label="Ophaalmoment"
              value={pickupLabel}
            />
            <InfoItem
              icon="📦"
              label="Beschikbaar"
              value={`${dish.quantity_available} portie${dish.quantity_available !== 1 ? 's' : ''}`}
            />
            <InfoItem
              icon="🥡"
              label="Eigen bakje meenemen"
              value={dish.bring_own_container ? 'Ja, graag!' : 'Niet nodig'}
            />
            <InfoItem
              icon="🌱"
              label="Dieet"
              value={
                dish.is_vegan
                  ? 'Veganistisch'
                  : dish.is_vegetarian
                    ? 'Vegetarisch'
                    : 'Geen specifiek dieet'
              }
            />
          </div>

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <div>
              <h2 className="mb-3 text-xl font-bold text-warm-900">Ingredienten</h2>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient) => (
                  <span
                    key={ingredient.id}
                    className="rounded-full bg-cream px-3 py-1 text-sm font-medium text-warm-700"
                  >
                    {ingredient.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens */}
          {allergies.length > 0 && (
            <div>
              <h2 className="mb-3 text-xl font-bold text-warm-900">Allergenen</h2>
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy) => (
                  <span
                    key={allergy.id}
                    className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700"
                  >
                    {allergenLabel(allergy.allergen)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Merchant card */}
          <Link
            href={`/merchant/${merchant.id}`}
            className="block rounded-2xl bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <div className="flex items-center gap-4">
              {merchant.logo_url ? (
                <Image
                  src={merchant.logo_url}
                  alt={merchant.business_name}
                  width={56}
                  height={56}
                  className="rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100">
                  <span className="text-2xl">🏪</span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-warm-900">
                    {merchant.business_name}
                  </h3>
                  {merchant.is_verified && (
                    <span className="text-brand-500" title="Geverifieerd">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-sm text-warm-500">{merchant.city}</p>
                {merchant.avg_rating !== null && (
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold text-warm-700">
                      {merchant.avg_rating.toFixed(1)}
                    </span>
                    <span className="text-warm-400">
                      ({merchant.review_count} beoordelingen)
                    </span>
                  </div>
                )}
              </div>
            </div>
            <p className="mt-3 text-sm font-medium text-brand-600">
              Bekijk profiel →
            </p>
          </Link>

          {/* Reserve section */}
          {isAvailable && (
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <h2 className="mb-4 text-xl font-bold text-warm-900">Reserveren</h2>
              {user ? (
                <div className="space-y-3">
                  <ReserveButton
                    dishId={dish.id}
                    merchantId={dish.merchant_id}
                    maxQuantity={dish.quantity_available}
                  />
                  <StartChatButton
                    merchantId={merchant.id}
                    dishId={dish.id}
                    merchantName={merchant.business_name}
                  />
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-4 text-sm text-warm-500">
                    Log in om dit gerecht te reserveren.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-6 py-3 font-bold text-white shadow-button transition-colors hover:bg-brand-600"
                  >
                    Inloggen om te reserveren
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-warm-400">
            {label}
          </p>
          <p className="font-semibold text-warm-800">{value}</p>
        </div>
      </div>
    </div>
  )
}
