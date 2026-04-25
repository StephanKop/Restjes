import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createServerComponentClient } from '@/lib/supabase-server'
import {
  getCachedMerchant,
  getCachedMerchantDishes,
  getCachedMerchantReviews,
  getCachedOtherMerchantsInCity,
} from '@/lib/cached-queries'
import { merchantPath, uuidFromParam } from '@/lib/slug'
import { DishCard, type DishCardData } from '@/components/DishCard'
import { ReviewList, type ReviewData } from '@/components/ReviewList'
import { StarRating } from '@/components/StarRating'
import { JsonLd } from '@/components/JsonLd'
import { StorefrontIcon, CheckBadgeIcon, DishIcon } from '@/components/icons'

interface MerchantPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: MerchantPageProps): Promise<Metadata> {
  const { id: rawId } = await params
  const id = uuidFromParam(rawId)
  const t = await getTranslations('merchant.web')
  if (!id) {
    return { title: t('metadataNotFound') }
  }
  const supabase = await createServerComponentClient()

  const { data: merchant } = await supabase
    .from('merchants')
    .select('business_name, description, logo_url')
    .eq('id', id)
    .single()

  if (!merchant) {
    return { title: t('metadataNotFound') }
  }

  return {
    title: t('metadataTitle', { name: merchant.business_name }),
    description: merchant.description ?? t('metadataDescriptionFallback', { name: merchant.business_name }),
    alternates: {
      canonical: merchantPath({ id, business_name: merchant.business_name }),
    },
    openGraph: {
      title: merchant.business_name,
      description: merchant.description ?? undefined,
      type: 'website',
      url: `https://kliekjesclub.nl${merchantPath({ id, business_name: merchant.business_name })}`,
      images: merchant.logo_url ? [{ url: merchant.logo_url }] : undefined,
    },
  }
}

export default async function MerchantPage({ params }: MerchantPageProps) {
  const { id: rawId } = await params
  const id = uuidFromParam(rawId)
  if (!id) {
    notFound()
  }
  const t = await getTranslations('merchant.web')

  const [merchant, dishes, latestReviews] = await Promise.all([
    getCachedMerchant(id),
    getCachedMerchantDishes(id),
    getCachedMerchantReviews(id, 3),
  ])

  if (!merchant) {
    notFound()
  }

  // Redirect bare-UUID or stale-slug URLs to canonical slug form.
  const canonicalPath = merchantPath({ id, business_name: merchant.business_name })
  if (`/aanbieder/${rawId}` !== canonicalPath) {
    const locale = await getLocale()
    redirect(canonicalPath, locale)
  }

  const otherMerchants = await getCachedOtherMerchantsInCity(merchant.city, id, 4)

  const reviewList: ReviewData[] = (latestReviews ?? [])// eslint-disable-next-line @typescript-eslint/no-explicit-any
  .map((r: any) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    merchant_reply: r.merchant_reply,
    merchant_replied_at: r.merchant_replied_at,
    consumer: r.consumer as unknown as { display_name: string | null; avatar_url: string | null },
  }))

  const dishCards: DishCardData[] = (dishes ?? []).map((dish) => ({
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
  }))

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
        name: t('breadcrumbDiscover'),
        item: 'https://kliekjesclub.nl/browse',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: merchant.business_name,
        item: `https://kliekjesclub.nl${canonicalPath}`,
      },
    ],
  }

  const foodEstablishmentJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    '@id': `https://kliekjesclub.nl${canonicalPath}`,
    url: `https://kliekjesclub.nl${canonicalPath}`,
    name: merchant.business_name,
    description: merchant.description ?? undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: merchant.address_line1 ?? undefined,
      addressLocality: merchant.city ?? undefined,
      postalCode: merchant.postal_code ?? undefined,
      addressCountry: merchant.country ?? 'NL',
    },
    ...(merchant.latitude !== null && merchant.longitude !== null
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: merchant.latitude,
            longitude: merchant.longitude,
          },
        }
      : {}),
    ...(merchant.phone ? { telephone: merchant.phone } : {}),
    ...(merchant.website ? { sameAs: [merchant.website] } : {}),
    priceRange: 'Free',
    servesCuisine: 'Leftovers',
    ...(merchant.avg_rating !== null
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
    image: merchant.logo_url ?? undefined,
  }

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={foodEstablishmentJsonLd} />

      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-warm-400" data-reveal>
        <Link href="/browse" className="transition-colors hover:text-brand-600">{t('breadcrumbDiscover')}</Link>
        <span>/</span>
        <span className="text-warm-600">{merchant.business_name}</span>
      </nav>

      {/* Banner */}
      <div className="relative -mx-6 -mt-8 mb-8 aspect-[16/5] w-[calc(100%+3rem)] overflow-hidden sm:rounded-2xl sm:mx-0 sm:mt-0 sm:w-full">
        {merchant.banner_url ? (
          <Image
            src={merchant.banner_url}
            alt={t('bannerAlt', { name: merchant.business_name })}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-400 to-brand-600" />
        )}
      </div>

      {/* Merchant info */}
      <div className="mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-end">
        {/* Logo */}
        <div className="-mt-16 sm:-mt-20 relative z-10 shrink-0">
          {merchant.logo_url ? (
            <Image
              src={merchant.logo_url}
              alt={merchant.business_name}
              width={96}
              height={96}
              className="rounded-2xl border-4 border-white object-cover shadow-card sm:h-28 sm:w-28"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-brand-100 shadow-card sm:h-28 sm:w-28">
              <StorefrontIcon className="h-10 w-10 text-brand-600" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-warm-900">
              {merchant.business_name}
            </h1>
            {merchant.is_verified && (
              <CheckBadgeIcon className="h-6 w-6 text-brand-500" />
            )}
          </div>

          <p className="mt-1 text-warm-500">
            {merchant.address_line1}, {merchant.postal_code} {merchant.city}
          </p>

          {merchant.avg_rating !== null && (
            <div className="mt-2 flex items-center gap-1.5">
              <StarRating rating={Math.round(merchant.avg_rating ?? 0)} size="sm" />
              <span className="font-semibold text-warm-700">
                {(merchant.avg_rating ?? 0).toFixed(1)}
              </span>
              <span className="text-warm-400">
                {t('reviewCountParens', { count: merchant.review_count })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {merchant.description && (
        <div className="mb-10 rounded-2xl bg-white p-6 shadow-card">
          <h2 className="mb-3 text-xl font-bold text-warm-900">{t('about')}</h2>
          <p className="text-warm-600 leading-relaxed">{merchant.description}</p>
        </div>
      )}

      {/* Available dishes */}
      <div>
        <h2 className="mb-6 text-2xl font-extrabold text-warm-900">
          {t('availableDishes')}
        </h2>

        {dishCards.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
            {dishCards.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-12 text-center shadow-card">
            <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-100 text-warm-400">
              <DishIcon className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-warm-900">
              {t('noDishesTitle')}
            </h3>
            <p className="text-warm-500">
              {t('noDishesBody')}
            </p>
          </div>
        )}
      </div>

      {/* Reviews section */}
      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-warm-900">{t('reviewsHeading')}</h2>
          {reviewList.length > 0 && (
            <Link
              href={`${canonicalPath}/reviews`}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              {t('seeAllReviews')}
            </Link>
          )}
        </div>

        {reviewList.length > 0 ? (
          <>
            <ReviewList reviews={reviewList} />
            {(merchant.review_count ?? 0) > 3 && (
              <div className="mt-6 text-center">
                <Link
                  href={`${canonicalPath}/reviews`}
                  className="inline-block rounded-xl bg-white px-6 py-3 font-bold text-brand-600 shadow-card transition-colors hover:bg-brand-50"
                >
                  {t('seeAllCount', { count: merchant.review_count })}
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center shadow-card">
            <p className="text-warm-500">{t('noReviews')}</p>
          </div>
        )}
      </div>

      {/* Other merchants in the same city — internal linking for SEO + discovery */}
      {otherMerchants.length > 0 && (
        <div className="mt-12" data-reveal>
          <h2 className="mb-6 text-2xl font-extrabold text-warm-900">
            {t('otherMerchantsInCity', { city: merchant.city ?? '' })}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-reveal-stagger>
            {otherMerchants.map((m) => (
              <Link
                key={m.id}
                href={merchantPath({ id: m.id, business_name: m.business_name })}
                className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card transition-all duration-150 hover:shadow-card-hover active:scale-[0.98]"
              >
                {m.logo_url ? (
                  <Image
                    src={m.logo_url}
                    alt={m.business_name}
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-100">
                    <StorefrontIcon className="h-6 w-6 text-brand-600" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="truncate font-bold text-warm-900 group-hover:text-brand-700">
                      {m.business_name}
                    </span>
                    {m.is_verified && <CheckBadgeIcon className="h-4 w-4 shrink-0 text-brand-500" />}
                  </div>
                  {m.avg_rating !== null && m.review_count > 0 && (
                    <div className="text-sm text-warm-500">
                      <span className="text-yellow-500">★</span>{' '}
                      <span className="font-semibold text-warm-700">{m.avg_rating.toFixed(1)}</span>{' '}
                      <span className="text-warm-400">({m.review_count})</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
