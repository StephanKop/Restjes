import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { getCachedMerchant, getCachedMerchantReviewsFull } from '@/lib/cached-queries'
import { ReviewList, type ReviewData } from '@/components/ReviewList'
import { StarRating } from '@/components/StarRating'
import { JsonLd } from '@/components/JsonLd'

interface MerchantReviewsPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: MerchantReviewsPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerComponentClient()

  const { data: merchant } = await supabase
    .from('merchants')
    .select('business_name')
    .eq('id', id)
    .single()

  if (!merchant) {
    return { title: 'Beoordelingen - Kliekjesclub' }
  }

  return {
    title: `${merchant.business_name} - Beoordelingen`,
  }
}

export default async function MerchantReviewsPage({ params }: MerchantReviewsPageProps) {
  const { id } = await params

  const [merchant, reviews] = await Promise.all([
    getCachedMerchant(id),
    getCachedMerchantReviewsFull(id),
  ])

  if (!merchant) {
    notFound()
  }

  const reviewList: ReviewData[] = (reviews ?? []).map((r: Record<string, unknown>) => {
    const reservation = r.reservation as { dish: { title: string } } | null
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      merchant_reply: r.merchant_reply,
      merchant_replied_at: r.merchant_replied_at,
      consumer: r.consumer as { display_name: string | null; avatar_url: string | null },
      dish_title: reservation?.dish?.title ?? null,
    }
  })

  // Calculate rating distribution
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const review of reviewList) {
    distribution[review.rating] = (distribution[review.rating] ?? 0) + 1
  }
  const totalReviews = reviewList.length

  const reviewsJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: merchant.business_name,
    url: `https://kliekjesclub.nl/aanbieder/${id}`,
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
    review: reviewList.slice(0, 10).map((r) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.consumer?.display_name ?? 'Anoniem',
      },
      datePublished: r.created_at,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      ...(r.comment ? { reviewBody: r.comment } : {}),
    })),
  }

  return (
    <div>
      <JsonLd data={reviewsJsonLd} />
      {/* Back link */}
      <Link
        href={`/aanbieder/${id}`}
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <span aria-hidden="true">&larr;</span> Terug naar {merchant.business_name}
      </Link>

      <h1 className="mb-8 text-3xl font-extrabold text-warm-900">Beoordelingen</h1>

      {/* Rating summary */}
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-card sm:flex sm:items-center sm:gap-10">
        {/* Average rating */}
        <div className="mb-6 text-center sm:mb-0 sm:min-w-[140px]">
          <p className="text-5xl font-extrabold text-warm-900">
            {merchant.avg_rating !== null ? (merchant.avg_rating as number).toFixed(1) : '-'}
          </p>
          <div className="mt-1 flex justify-center">
            <StarRating rating={Math.round(merchant.avg_rating ?? 0)} size="md" />
          </div>
          <p className="mt-1 text-sm text-warm-400">
            {merchant.review_count} {merchant.review_count === 1 ? 'beoordeling' : 'beoordelingen'}
          </p>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] ?? 0
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-12 text-right font-medium text-warm-600">
                  {star} ster{star !== 1 ? 'ren' : ''}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-warm-100">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-warm-400">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review list */}
      {reviewList.length > 0 ? (
        <ReviewList reviews={reviewList} showDishTitle />
      ) : (
        <div className="rounded-2xl bg-white p-12 text-center shadow-card">
          <p className="mb-2 text-4xl">&#9734;</p>
          <h2 className="mb-2 text-xl font-bold text-warm-900">Nog geen beoordelingen</h2>
          <p className="text-warm-500">
            Deze aanbieder heeft nog geen beoordelingen ontvangen.
          </p>
        </div>
      )}
    </div>
  )
}
