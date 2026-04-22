import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createServerComponentClient } from '@/lib/supabase-server'
import { getCachedMerchant, getCachedMerchantDishes, getCachedMerchantReviews } from '@/lib/cached-queries'
import { DishCard, type DishCardData } from '@/components/DishCard'
import { ReviewList, type ReviewData } from '@/components/ReviewList'
import { StarRating } from '@/components/StarRating'
import { JsonLd } from '@/components/JsonLd'
import { StorefrontIcon, CheckBadgeIcon, DishIcon } from '@/components/icons'

interface MerchantPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: MerchantPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerComponentClient()
  const t = await getTranslations('merchant.web')

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
    openGraph: {
      title: merchant.business_name,
      description: merchant.description ?? undefined,
      type: 'website',
      images: merchant.logo_url ? [{ url: merchant.logo_url }] : undefined,
    },
  }
}

export default async function MerchantPage({ params }: MerchantPageProps) {
  const { id } = await params
  const t = await getTranslations('merchant.web')

  const [merchant, dishes, latestReviews] = await Promise.all([
    getCachedMerchant(id),
    getCachedMerchantDishes(id),
    getCachedMerchantReviews(id, 3),
  ])

  if (!merchant) {
    notFound()
  }

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

  const foodEstablishmentJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: merchant.business_name,
    description: merchant.description ?? undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: merchant.address_line1 ?? undefined,
      addressLocality: merchant.city ?? undefined,
      postalCode: merchant.postal_code ?? undefined,
      addressCountry: 'NL',
    },
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
      <JsonLd data={foodEstablishmentJsonLd} />

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
              href={`/aanbieder/${id}/reviews`}
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
                  href={`/aanbieder/${id}/reviews`}
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
    </div>
  )
}
