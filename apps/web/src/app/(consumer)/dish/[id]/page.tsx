import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { formatPickupTime, allergenLabel } from '@/lib/format'
import { ReserveButton } from '@/components/ReserveButton'
import { StartChatButton } from '@/components/StartChatButton'
import { JsonLd } from '@/components/JsonLd'
import { DishIcon, ClockIcon, CubeIcon, ContainerIcon, LeafIcon, StorefrontIcon, CheckBadgeIcon } from '@/components/icons'

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

      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-warm-400" data-reveal>
        <Link href="/browse" className="transition-colors hover:text-brand-600">Ontdekken</Link>
        <span>/</span>
        <span className="text-warm-600">{dish.title}</span>
      </nav>

      {/* Hero: Image + title/merchant/reserve */}
      <div className="overflow-hidden rounded-2xl shadow-card lg:flex" style={{ minHeight: 480 }}>
        {/* Image — 70% on desktop */}
        <div className="relative aspect-[4/3] bg-warm-100 lg:aspect-auto lg:flex-[7_7_0%]" data-reveal="left">
          {dish.image_url ? (
            <Image
              src={dish.image_url}
              alt={dish.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 70vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600">
              <DishIcon className="h-20 w-20 text-white/80" />
            </div>
          )}
        </div>

        {/* Right column — 30% with bg */}
        <div className="flex flex-col justify-between gap-6 bg-white p-6 lg:flex-[3_3_0%] lg:p-8" data-reveal="right">
          <div className="space-y-5">
            <div>
              {/* Badges */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {dish.is_vegan && (
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                    Veganistisch
                  </span>
                )}
                {dish.is_vegetarian && !dish.is_vegan && (
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                    Vegetarisch
                  </span>
                )}
                {dish.bring_own_container && (
                  <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
                    Eigen bakje
                  </span>
                )}
              </div>
              <h1 className="mb-2 text-3xl font-extrabold text-warm-900 lg:text-4xl">{dish.title}</h1>
              {dish.description && (
                <p className="text-warm-600 leading-relaxed">{dish.description}</p>
              )}
            </div>

            {/* Merchant info */}
            <Link
              href={`/merchant/${merchant.id}`}
              className="flex items-center gap-4 rounded-xl p-3 -mx-3 transition-all duration-150 hover:bg-warm-50 active:bg-warm-100"
            >
              {merchant.logo_url ? (
                <Image
                  src={merchant.logo_url}
                  alt={merchant.business_name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
                  <StorefrontIcon className="h-6 w-6 text-brand-600" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-warm-900">{merchant.business_name}</span>
                  {merchant.is_verified && (
                    <CheckBadgeIcon className="h-4 w-4 text-brand-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-warm-500">
                  <span>{merchant.city}</span>
                  {merchant.avg_rating !== null && (
                    <>
                      <span>·</span>
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold text-warm-700">{merchant.avg_rating.toFixed(1)}</span>
                      <span className="text-warm-400">({merchant.review_count})</span>
                    </>
                  )}
                </div>
              </div>
              <span className="text-sm font-medium text-brand-600">→</span>
            </Link>

            {/* Quick info */}
            <div className="flex flex-wrap gap-4 text-sm text-warm-600">
              <span className="flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4 text-warm-400" />
                {pickupLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <CubeIcon className="h-4 w-4 text-warm-400" />
                Nog {dish.quantity_available} beschikbaar
              </span>
            </div>
          </div>

          {/* Unavailable notice */}
          {!isAvailable && (
            <div className="rounded-2xl border border-warm-200 bg-warm-50 p-6 text-center">
              <p className="text-lg font-bold text-warm-700">
                Dit gerecht is niet meer beschikbaar
              </p>
            </div>
          )}

          {/* Reserve + chat */}
          {isAvailable && (
            <div className="space-y-3" data-reveal>
              {user ? (
                <>
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
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center rounded-xl bg-brand-500 px-6 py-3 font-bold text-white shadow-button transition-all duration-150 hover:bg-brand-600 active:scale-[0.97]"
                >
                  Inloggen om te reserveren
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Details section */}
      <div className="mt-10 space-y-8">
        {/* Info grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-reveal-stagger>
          <InfoItem
            icon={<ClockIcon className="h-5 w-5" />}
            label="Ophaalmoment"
            value={pickupLabel}
          />
          <InfoItem
            icon={<CubeIcon className="h-5 w-5" />}
            label="Beschikbaar"
            value={`${dish.quantity_available} portie${dish.quantity_available !== 1 ? 's' : ''}`}
          />
          <InfoItem
            icon={<ContainerIcon className="h-5 w-5" />}
            label="Eigen bakje meenemen"
            value={dish.bring_own_container ? 'Ja, graag!' : 'Niet nodig'}
          />
          <InfoItem
            icon={<LeafIcon className="h-5 w-5" />}
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

        {/* Ingredients & Allergens side by side on desktop */}
        <div className="grid gap-8 lg:grid-cols-2">
          {ingredients.length > 0 && (
            <div data-reveal>
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

          {allergies.length > 0 && (
            <div data-reveal>
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
      </div>
    </div>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card" data-reveal="scale">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          {icon}
        </div>
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
