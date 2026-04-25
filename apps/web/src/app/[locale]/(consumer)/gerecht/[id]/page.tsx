import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { localeMeta, type Locale } from '@kliekjesclub/i18n'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { getCachedDish, getCachedOtherMerchantDishes } from '@/lib/cached-queries'
import { DishCard, type DishCardData } from '@/components/DishCard'
import { dishPath, merchantPath, uuidFromParam } from '@/lib/slug'
import { formatPickupTime, allergenLabel } from '@/lib/format'
import { ReserveButton } from '@/components/ReserveButton'
import { StartChatButton } from '@/components/StartChatButton'
import { JsonLd } from '@/components/JsonLd'
import { DishIcon, ClockIcon, CubeIcon, ContainerIcon, LeafIcon, StorefrontIcon, CheckBadgeIcon } from '@/components/icons'

interface DishPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: DishPageProps): Promise<Metadata> {
  const { id: rawId } = await params
  const id = uuidFromParam(rawId)
  if (!id) {
    return { title: 'Gerecht niet gevonden - Kliekjesclub' }
  }
  const supabase = await createServerComponentClient()
  const t = await getTranslations('dish.detail')

  const { data: dish } = await supabase
    .from('dishes')
    .select('title, description, image_url, merchant:merchants!inner(business_name)')
    .eq('id', id)
    .single()

  if (!dish) {
    return { title: t('metadataNotFound') }
  }

  const merchant = dish.merchant as unknown as { business_name: string }

  return {
    title: t('metadataTitle', { dishTitle: dish.title, merchantName: merchant.business_name }),
    description: dish.description ?? t('metadataDescriptionFallback', { dishTitle: dish.title, merchantName: merchant.business_name }),
    alternates: {
      canonical: dishPath({ id, title: dish.title }),
    },
    openGraph: {
      title: t('metadataTitle', { dishTitle: dish.title, merchantName: merchant.business_name }),
      description: dish.description ?? undefined,
      type: 'website',
      url: `https://kliekjesclub.nl${dishPath({ id, title: dish.title })}`,
      images: dish.image_url ? [{ url: dish.image_url }] : undefined,
    },
  }
}

export default async function DishPage({ params }: DishPageProps) {
  const { id: rawId } = await params
  const id = uuidFromParam(rawId)
  if (!id) {
    notFound()
  }
  const t = await getTranslations('dish')
  const locale = (await getLocale()) as Locale
  const dateLocale = localeMeta[locale]?.htmlLang ?? 'nl-NL'

  const dish = await getCachedDish(id)

  if (!dish) {
    notFound()
  }

  // Redirect bare-UUID or stale-slug URLs to the canonical slug form.
  const canonicalPath = dishPath({ id, title: dish.title })
  if (`/gerecht/${rawId}` !== canonicalPath) {
    redirect(canonicalPath, locale)
  }

  const otherDishesRaw = await getCachedOtherMerchantDishes(dish.merchant_id, id, 3)

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

  // Check if the current user is the owner of this dish
  let isOwner = false
  if (user) {
    const supabase = await createServerComponentClient()
    const { data: ownMerchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('profile_id', user.id)
      .eq('id', merchant.id)
      .maybeSingle()
    isOwner = !!ownMerchant
  }

  const breadcrumbJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Kliekjesclub',
        item: 'https://kliekjesclub.nl',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('detail.breadcrumbDiscover'),
        item: 'https://kliekjesclub.nl/browse',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: dish.title,
        item: `https://kliekjesclub.nl${canonicalPath}`,
      },
    ],
  }

  const productJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: dish.title,
    description: dish.description ?? undefined,
    image: dish.image_url ?? undefined,
    url: `https://kliekjesclub.nl${canonicalPath}`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: isAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
      seller: {
        '@type': 'Organization',
        name: merchant.business_name,
        url: `https://kliekjesclub.nl${merchantPath({ id: merchant.id, business_name: merchant.business_name })}`,
      },
    },
    ...(merchant.avg_rating !== null && merchant.review_count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: merchant.avg_rating,
            reviewCount: merchant.review_count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  }

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={productJsonLd} />

      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-warm-400" data-reveal>
        <Link href="/browse" className="transition-colors hover:text-brand-600">{t('detail.breadcrumbDiscover')}</Link>
        <span>/</span>
        <span className="text-warm-600">{dish.title}</span>
      </nav>

      {/* Hero: Image + title/aanbieder/reserve */}
      <div className="gap-6 lg:flex" style={{ minHeight: 480 }}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-warm-100 shadow-card lg:aspect-auto lg:flex-[7_7_0%]" data-reveal="left">
          {dish.image_url ? (
            <Image
              src={dish.image_url}
              alt={dish.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 70vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600">
              <DishIcon className="h-20 w-20 text-white/80" />
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="mt-6 flex flex-col justify-between gap-6 rounded-2xl bg-white p-6 shadow-card lg:mt-0 lg:flex-[3_3_0%] lg:p-8" data-reveal="right">
          <div className="space-y-5">
            <div>
              {/* Badges */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {!isAvailable && (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    dish.status === 'reserved'
                      ? 'bg-amber-100 text-amber-800'
                      : dish.status === 'collected'
                        ? 'bg-warm-100 text-warm-700'
                        : dish.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-warm-100 text-warm-700'
                  }`}>
                    {dish.status === 'reserved' && t('detail.badges.reserved')}
                    {dish.status === 'collected' && t('detail.badges.collected')}
                    {dish.status === 'expired' && t('detail.badges.expired')}
                    {dish.status === 'available' && t('detail.badges.unavailable')}
                  </span>
                )}
                {dish.is_vegan && (
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                    {t('badges.vegan')}
                  </span>
                )}
                {dish.is_vegetarian && !dish.is_vegan && (
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                    {t('badges.vegetarian')}
                  </span>
                )}
                {dish.bring_own_container && (
                  <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
                    {t('badges.bringOwnContainer')}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  dish.is_frozen
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {dish.is_frozen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3 w-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M12 6l-3-3m3 3 3-3M12 18l-3 3m3-3 3 3M2 12h20M6 12l-3-3m3 3-3 3M18 12l3-3m-3 3 3 3M7.05 4.93l9.9 9.9M7.05 4.93 5.64 7.76m1.41-2.83 2.83 1.42M16.95 19.07l-2.83-1.42m2.83 1.42 1.41-2.83M16.95 4.93l-9.9 9.9M16.95 4.93l1.41 2.83m-1.41-2.83-2.83 1.42M7.05 19.07l2.83-1.42m-2.83 1.42L5.64 16.24" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3 w-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
                  )}
                  {dish.is_frozen ? t('detail.badges.frozen') : t('detail.badges.fresh')}
                </span>
              </div>
              <h1 className="mb-2 text-3xl font-extrabold text-warm-900 lg:text-4xl">{dish.title}</h1>
              {dish.description && (
                <p className="text-warm-600 leading-relaxed">{dish.description}</p>
              )}
            </div>

            {/* Merchant info */}
            <Link
              href={merchantPath({ id: merchant.id, business_name: merchant.business_name })}
              className="flex items-center gap-4 rounded-xl border border-warm-200 bg-warm-50/50 p-4 transition-all duration-150 hover:border-brand-200 hover:bg-brand-50/50 active:scale-[0.98]"
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
                  <span className="text-lg font-extrabold text-warm-900">{merchant.business_name}</span>
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
              {isAvailable && (
                <span className="flex items-center gap-1.5">
                  <CubeIcon className="h-4 w-4 text-warm-400" />
                  {t('detail.stats.remaining', { count: dish.quantity_available })}
                </span>
              )}
            </div>
          </div>

          {/* Unavailable notice */}
          {!isAvailable && (
            <div className={`rounded-2xl border p-6 text-center ${
              dish.status === 'reserved'
                ? 'border-amber-200 bg-amber-50'
                : dish.status === 'expired'
                  ? 'border-red-200 bg-red-50'
                  : 'border-warm-200 bg-warm-50'
            }`}>
              <p className={`text-lg font-bold ${
                dish.status === 'reserved'
                  ? 'text-amber-800'
                  : dish.status === 'expired'
                    ? 'text-red-800'
                    : 'text-warm-700'
              }`}>
                {dish.status === 'reserved' && t('detail.unavailable.reserved')}
                {dish.status === 'collected' && t('detail.unavailable.collected')}
                {dish.status === 'expired' && t('detail.unavailable.expired')}
                {dish.status === 'available' && dish.quantity_available <= 0 && t('detail.unavailable.noQuantity')}
              </p>
              <p className="mt-1 text-sm text-warm-500">
                <Link href="/browse" className="font-medium text-brand-600 hover:text-brand-700">
                  {t('detail.unavailable.seeMore')}
                </Link>
              </p>
            </div>
          )}

          {/* Reserve + chat */}
          {isAvailable && (
            <div className="space-y-3" data-reveal>
              {isOwner ? (
                <Link
                  href={`/aanbieder/dishes/${dish.id}/edit`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-warm-100 px-6 py-3 font-bold text-warm-700 transition-all duration-150 hover:bg-warm-200 active:scale-[0.97]"
                >
                  {t('detail.cta.ownerEdit')}
                </Link>
              ) : user ? (
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
                  {t('detail.cta.loginToReserve')}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Details section */}
      <div className="mt-10 space-y-6" data-reveal>
        <h2 className="text-xl font-extrabold text-warm-900">{t('detail.sections.details')}</h2>

        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          {/* Info rows */}
          <div className="divide-y divide-warm-100">
            <InfoItem
              icon={<ClockIcon className="h-5 w-5" />}
              label={t('detail.info.pickupMoment')}
              value={pickupLabel}
            />
            <InfoItem
              icon={<CubeIcon className="h-5 w-5" />}
              label={t('detail.info.available')}
              value={t(dish.quantity_available === 1 ? 'detail.info.portionsSingular' : 'detail.info.portionsPlural', { count: dish.quantity_available })}
            />
            <InfoItem
              icon={dish.is_frozen
                ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M12 6l-3-3m3 3 3-3M12 18l-3 3m3-3 3 3M2 12h20M6 12l-3-3m3 3-3 3M18 12l3-3m-3 3 3 3M7.05 4.93l9.9 9.9M7.05 4.93 5.64 7.76m1.41-2.83 2.83 1.42M16.95 19.07l-2.83-1.42m2.83 1.42 1.41-2.83M16.95 4.93l-9.9 9.9M16.95 4.93l1.41 2.83m-1.41-2.83-2.83 1.42M7.05 19.07l2.83-1.42m-2.83 1.42L5.64 16.24" /></svg>
                : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
              }
              label={t('detail.info.type')}
              value={dish.is_frozen ? t('detail.badges.frozen') : t('detail.badges.fresh')}
            />
            {!dish.is_frozen && dish.expires_at && (
              <InfoItem
                icon={<ClockIcon className="h-5 w-5" />}
                label={t('detail.info.bestBy')}
                value={new Date(dish.expires_at).toLocaleString(dateLocale, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              />
            )}
            <InfoItem
              icon={<ContainerIcon className="h-5 w-5" />}
              label={t('detail.info.bringOwnContainer')}
              value={dish.bring_own_container ? t('detail.info.bringOwnContainerYes') : t('detail.info.bringOwnContainerNo')}
            />
            <InfoItem
              icon={<LeafIcon className="h-5 w-5" />}
              label={t('detail.info.diet')}
              value={
                dish.is_vegan
                  ? t('detail.info.dietVegan')
                  : dish.is_vegetarian
                    ? t('detail.info.dietVegetarian')
                    : t('detail.info.dietNone')
              }
            />
          </div>
        </div>

        {/* Ingredients & Allergens as separate cards */}
        {(ingredients.length > 0 || allergies.length > 0) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {ingredients.length > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-card">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <LeafIcon className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-warm-900">{t('detail.sections.ingredients')}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient) => (
                    <span
                      key={ingredient.id}
                      className="rounded-full border border-warm-200 bg-warm-50 px-3 py-1 text-sm font-medium text-warm-700"
                    >
                      {ingredient.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {allergies.length > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-card">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <DishIcon className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-warm-900">{t('detail.sections.allergens')}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy) => (
                    <span
                      key={allergy.id}
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-semibold text-red-700"
                    >
                      {allergenLabel(allergy.allergen)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Other dishes from this merchant — internal linking for SEO + discovery */}
      {otherDishesRaw.length > 0 && (
        <div className="mt-12" data-reveal>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-extrabold text-warm-900">
              {t('detail.moreFromMerchant', { merchantName: merchant.business_name })}
            </h2>
            <Link
              href={merchantPath({ id: merchant.id, business_name: merchant.business_name })}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              {t('detail.viewAllFromMerchant')}
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
            {otherDishesRaw.map((d) => {
              const card: DishCardData = {
                id: d.id,
                title: d.title,
                description: d.description,
                image_url: d.image_url,
                quantity_available: d.quantity_available,
                pickup_start: d.pickup_start,
                pickup_end: d.pickup_end,
                bring_own_container: d.bring_own_container,
                is_vegetarian: d.is_vegetarian,
                is_vegan: d.is_vegan,
                merchant: {
                  business_name: merchant.business_name,
                  city: merchant.city,
                },
                allergen_count: (d.dish_allergies as { allergen: string }[]).length,
              }
              return <DishCard key={d.id} dish={card} />
            })}
          </div>
        </div>
      )}
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
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium text-warm-500">{label}</span>
      <span className="text-right font-semibold text-warm-900">{value}</span>
    </div>
  )
}
