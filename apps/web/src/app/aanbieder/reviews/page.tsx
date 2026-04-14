import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { ReviewList, type ReviewData } from '@/components/ReviewList'
import { MerchantReplyForm } from '@/components/MerchantReplyForm'
import { StarRating } from '@/components/StarRating'

export const metadata: Metadata = {
  title: 'Beoordelingen',
}

export default async function AanbiederReviewsPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createServerComponentClient()
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, avg_rating, review_count')
    .eq('profile_id', user.id)
    .single()

  if (!merchant) {
    redirect('/aanbieder/profile?setup=aanbieder')
  }

  const { data: reviews } = await supabase
    .from('reviews')
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      merchant_reply,
      merchant_replied_at,
      reservation_id,
      consumer:profiles!consumer_id (
        display_name,
        avatar_url
      ),
      reservation:reservations (
        dish:dishes ( title )
      )
    `,
    )
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })

  const reviewList: ReviewData[] = (reviews ?? []).map((r) => {
    const reservation = r.reservation as unknown as { dish: { title: string } } | null
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      merchant_reply: r.merchant_reply,
      merchant_replied_at: r.merchant_replied_at,
      consumer: r.consumer as unknown as { display_name: string | null; avatar_url: string | null },
      dish_title: reservation?.dish?.title ?? null,
    }
  })

  // Calculate rating distribution
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const review of reviewList) {
    distribution[review.rating] = (distribution[review.rating] ?? 0) + 1
  }
  const totalReviews = reviewList.length

  // Stats
  const unreplied = reviewList.filter((r) => !r.merchant_reply).length

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-warm-900">Beoordelingen</h1>
        {unreplied > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
            {unreplied} onbeantwoord
          </span>
        )}
      </div>

      {totalReviews === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-card">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-100 text-warm-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
            </svg>
          </div>
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

          {/* Review list with reply actions */}
          <ReviewList
            reviews={reviewList}
            showDishTitle
            merchantView
            renderActions={(review) => {
              // Don't render the reply form if a reply already exists (it's shown by ReviewList)
              if (review.merchant_reply) {
                return (
                  <MerchantReplyForm
                    key={`reply-${review.id}`}
                    reviewId={review.id}
                    existingReply={review.merchant_reply}
                  />
                )
              }
              return (
                <MerchantReplyForm
                  key={`reply-${review.id}`}
                  reviewId={review.id}
                />
              )
            }}
          />
        </>
      )}
    </div>
  )
}
