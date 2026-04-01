'use client'

import { useState } from 'react'

interface StarRatingProps {
  rating: number
  onChange?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<NonNullable<StarRatingProps['size']>, string> = {
  sm: 'text-base gap-0.5',
  md: 'text-xl gap-0.5',
  lg: 'text-3xl gap-1',
}

export function StarRating({ rating, onChange, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState<number>(0)
  const interactive = typeof onChange === 'function'

  const displayRating = interactive && hovered > 0 ? hovered : rating

  return (
    <div
      className={`inline-flex items-center ${sizeClasses[size]}`}
      onMouseLeave={interactive ? () => setHovered(0) : undefined}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`select-none transition-colors ${
            star <= displayRating ? 'text-amber-500' : 'text-warm-200'
          } ${interactive ? 'cursor-pointer' : ''}`}
          onMouseEnter={interactive ? () => setHovered(star) : undefined}
          onClick={interactive ? () => onChange(star) : undefined}
          role={interactive ? 'button' : undefined}
          aria-label={interactive ? `${star} ster${star !== 1 ? 'ren' : ''}` : undefined}
        >
          ★
        </span>
      ))}
    </div>
  )
}
