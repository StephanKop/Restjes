'use client'

import { useState } from 'react'
import { StarRating } from '@/components/StarRating'
import { ReviewForm } from '@/components/ReviewForm'
import { Button } from '@/components/ui/Button'

interface ReservationReviewSectionProps {
  reservationId: string
  merchantId: string
  existingRating: number | null
}

export function ReservationReviewSection({
  reservationId,
  merchantId,
  existingRating,
}: ReservationReviewSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (existingRating !== null || submitted) {
    const displayRating = existingRating ?? 0
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-warm-500">Jouw beoordeling:</span>
        <StarRating rating={displayRating} size="sm" />
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="mt-3 rounded-xl border border-warm-100 bg-warm-50 p-4">
        <ReviewForm
          merchantId={merchantId}
          reservationId={reservationId}
          onSuccess={() => setSubmitted(true)}
        />
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      className="text-sm px-4 py-2"
      onClick={() => setShowForm(true)}
    >
      Beoordeling schrijven
    </Button>
  )
}
