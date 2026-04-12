import Image from 'next/image'
import { StarRating } from '@/components/StarRating'
import { formatRelativeDate } from '@/lib/format'
import { StorefrontIcon } from '@/components/icons'

export interface ReviewData {
  id: string
  rating: number
  comment: string | null
  created_at: string
  merchant_reply?: string | null
  merchant_replied_at?: string | null
  consumer: {
    display_name: string | null
    avatar_url: string | null
  }
  dish_title?: string | null
}

interface ReviewListProps {
  reviews: ReviewData[]
  showDishTitle?: boolean
  merchantView?: boolean
  renderActions?: (review: ReviewData) => React.ReactNode
}

export function ReviewList({
  reviews,
  showDishTitle = false,
  renderActions,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-xl bg-white p-5 shadow-card"
        >
          <div className="mb-3 flex items-center gap-3">
            {/* Avatar */}
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-warm-100">
              {review.consumer.avatar_url ? (
                <Image
                  src={review.consumer.avatar_url}
                  alt={review.consumer.display_name ?? 'Gebruiker'}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-warm-400">
                  {(review.consumer.display_name ?? 'G').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-warm-800">
                {review.consumer.display_name ?? 'Anonieme gebruiker'}
              </p>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-xs text-warm-400">
                  {formatRelativeDate(review.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Dish title badge */}
          {showDishTitle && review.dish_title && (
            <div className="mb-2">
              <span className="inline-block rounded-lg bg-warm-50 px-2 py-0.5 text-xs font-medium text-warm-600">
                {review.dish_title}
              </span>
            </div>
          )}

          {review.comment && (
            <p className="text-sm leading-relaxed text-warm-600">{review.comment}</p>
          )}

          {/* Merchant reply (hidden when renderActions handles replies) */}
          {!renderActions && review.merchant_reply && (
            <div className="mt-3 rounded-xl bg-warm-50 p-4">
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100">
                  <StorefrontIcon className="h-3 w-3 text-brand-600" />
                </div>
                <span className="text-xs font-semibold text-warm-700">Reactie van aanbieder</span>
                {review.merchant_replied_at && (
                  <span className="text-xs text-warm-400">
                    {formatRelativeDate(review.merchant_replied_at)}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-warm-600">{review.merchant_reply}</p>
            </div>
          )}

          {/* Custom actions slot (e.g., reply form for merchants) */}
          {renderActions?.(review)}
        </div>
      ))}
    </div>
  )
}
