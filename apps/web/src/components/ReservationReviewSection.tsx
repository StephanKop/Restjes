'use client'

import Link from 'next/link'
import { StarRating } from '@/components/StarRating'

interface ReservationReviewSectionProps {
  reservationId: string
  merchantId: string
  existingRating: number | null
}

export function ReservationReviewSection({
  reservationId,
  existingRating,
}: ReservationReviewSectionProps) {
  if (existingRating !== null) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-warm-500">Jouw beoordeling:</span>
        <StarRating rating={existingRating} size="sm" />
      </div>
    )
  }

  return (
    <Link
      href={`/review/${reservationId}`}
      className="inline-flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-bold text-brand-700 transition-all hover:bg-brand-100 active:scale-[0.97]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
      </svg>
      Beoordeling schrijven
    </Link>
  )
}
