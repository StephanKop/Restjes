import Image from 'next/image'
import { StarRating } from '@/components/StarRating'
import { formatRelativeDate } from '@/lib/format'

export interface ReviewData {
  id: string
  rating: number
  comment: string | null
  created_at: string
  consumer: {
    display_name: string | null
    avatar_url: string | null
  }
}

interface ReviewListProps {
  reviews: ReviewData[]
}

export function ReviewList({ reviews }: ReviewListProps) {
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

          {review.comment && (
            <p className="text-sm leading-relaxed text-warm-600">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  )
}
