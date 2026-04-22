'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useTranslations } from 'next-intl'
import { StarRating } from '@/components/StarRating'
import { Button } from '@/components/ui/Button'

interface ReviewPageFormProps {
  merchantId: string
  reservationId: string
  dishTitle: string
  merchantName: string
}

export function ReviewPageForm({
  merchantId,
  reservationId,
  dishTitle,
  merchantName,
}: ReviewPageFormProps) {
  const router = useRouter()
  const t = useTranslations('reviews')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const maxChars = 500

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (rating < 1 || rating > 5) {
      setError(t('webPage.form.errors.needRating'))
      return
    }

    setLoading(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError(t('webPage.form.errors.notSignedIn'))
        setLoading(false)
        return
      }

      const { error: insertError } = await supabase.from('reviews').insert({
        merchant_id: merchantId,
        consumer_id: user.id,
        reservation_id: reservationId,
        rating,
        comment: comment.trim() || null,
      })

      if (insertError) {
        if (insertError.code === '23505') {
          setError(t('webPage.form.errors.duplicate'))
        } else {
          setError(t('webPage.form.errors.generic'))
        }
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError(t('webPage.form.errors.network'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-brand-600">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-extrabold text-warm-900">
          {t('webPage.form.successTitle')}
        </h2>
        <p className="mb-6 text-warm-500">
          {t('webPage.form.successBody', { merchantName })}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="primary" onClick={() => router.push('/reservations')}>
            {t('webPage.form.backToReservations')}
          </Button>
          <Button variant="outline" onClick={() => router.refresh()}>
            {t('webPage.form.viewReview')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating section */}
      <div className="text-center">
        <p className="mb-2 text-sm font-semibold text-warm-800">
          {t('webPage.form.howWasDish', { dishTitle })}
        </p>
        <div className="flex justify-center">
          <StarRating rating={rating} onChange={setRating} size="lg" />
        </div>
        {rating > 0 && (
          <p className="mt-2 text-sm font-medium text-amber-600">
            {t(`form.ratingLabels.${rating}`)}
          </p>
        )}
      </div>

      {/* Comment */}
      {rating > 0 && (
        <div className="space-y-2">
          <label
            htmlFor="review-comment"
            className="block text-sm font-semibold text-warm-800"
          >
            {t('webPage.form.tellMore')}
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => {
              if (e.target.value.length <= maxChars) {
                setComment(e.target.value)
              }
            }}
            rows={4}
            className="w-full resize-none rounded-xl border border-warm-200 bg-white px-4 py-3 text-warm-800 placeholder:text-warm-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder={rating >= 1 && rating <= 5 ? t(`form.placeholders.${rating}`) : t('webPage.form.fallbackPlaceholder')}
          />
          <div className="flex justify-end">
            <span className={`text-xs ${comment.length > maxChars * 0.9 ? 'text-red-500' : 'text-warm-400'}`}>
              {comment.length}/{maxChars}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        loading={loading}
        disabled={rating === 0}
        className="w-full"
      >
        {t('webPage.form.submit')}
      </Button>
    </form>
  )
}
