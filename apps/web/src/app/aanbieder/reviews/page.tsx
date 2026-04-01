import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { ReviewList, type ReviewData } from '@/components/ReviewList'
import { StarRating } from '@/components/StarRating'

export const metadata: Metadata = {
  title: 'Beoordelingen',
}

export default async function AanbiederReviewsPage() {
  const supabase = await createServerComponentClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, avg_rating, review_count')
    .eq('user_id', user.id)
    .single()

  if (!merchant) {
    redirect('/aanbieder/settings')
  }

  const { data: reviews } = await supabase
    .from('reviews')
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      consumer:profiles!consumer_id (
        display_name,
        avatar_url
      )
    `,
    )
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })

  const reviewList: ReviewData[] = (reviews ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    consumer: r.consumer as unknown as { display_name: string | null; avatar_url: string | null },
  }))

  // Calculate rating distribution
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const review of reviewList) {
    distribution[review.rating] = (distribution[review.rating] ?? 0) + 1
  }
  const totalReviews = reviewList.length

  return (
    <div>
      <h1 className="mb-8 text-3xl font-extrabold text-warm-900">Beoordelingen</h1>

      {totalReviews === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-card">
          <p className="mb-2 text-4xl">&#9734;</p>
          <h2 className="mb-2 text-xl font-bold text-warm-900">
            Je hebt nog geen beoordelingen ontvangen
          </h2>
          <p className="text-warm-500">
            Zodra klanten een beoordeling achterlaten, verschijnen ze hier.
          </p>
        </div>
      ) : (
        <>
          {/* Rating overview */}
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-card sm:flex sm:items-center sm:gap-10">
            {/* Average rating */}
            <div className="mb-6 text-center sm:mb-0 sm:min-w-[140px]">
              <p className="text-5xl font-extrabold text-warm-900">
                {merchant.avg_rating !== null
                  ? (merchant.avg_rating as number).toFixed(1)
                  : '-'}
              </p>
              <div className="mt-1 flex justify-center">
                <StarRating rating={Math.round(merchant.avg_rating ?? 0)} size="md" />
              </div>
              <p className="mt-1 text-sm text-warm-400">
                {merchant.review_count}{' '}
                {merchant.review_count === 1 ? 'beoordeling' : 'beoordelingen'}
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
          <ReviewList reviews={reviewList} />
        </>
      )}
    </div>
  )
}
