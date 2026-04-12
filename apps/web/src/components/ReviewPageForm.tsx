'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { StarRating } from '@/components/StarRating'
import { Button } from '@/components/ui/Button'

interface ReviewPageFormProps {
  merchantId: string
  reservationId: string
  dishTitle: string
  merchantName: string
}

const RATING_LABELS: Record<number, string> = {
  1: 'Slecht',
  2: 'Matig',
  3: 'Oké',
  4: 'Goed',
  5: 'Uitstekend',
}

const PLACEHOLDERS: Record<number, string> = {
  1: 'Wat ging er mis? Je feedback helpt de aanbieder verbeteren.',
  2: 'Wat kan er beter? Deel je ervaring zodat de aanbieder kan verbeteren.',
  3: 'Vertel meer over je ervaring. Was er iets dat opviel?',
  4: 'Leuk dat je het goed vond! Wat vond je het beste?',
  5: 'Geweldig! Vertel anderen waarom je zo tevreden bent.',
}

export function ReviewPageForm({
  merchantId,
  reservationId,
  dishTitle,
  merchantName,
}: ReviewPageFormProps) {
  const router = useRouter()
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
      setError('Selecteer een beoordeling van 1 tot 5 sterren.')
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
        setError('Je moet ingelogd zijn om een beoordeling te plaatsen.')
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
          setError('Je hebt al een beoordeling geplaatst voor deze reservering.')
        } else {
          setError('Er ging iets mis. Probeer het opnieuw.')
        }
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('Er ging iets mis. Controleer je internetverbinding.')
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
          Bedankt voor je beoordeling!
        </h2>
        <p className="mb-6 text-warm-500">
          Je helpt {merchantName} en andere gebruikers met je feedback.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="primary" onClick={() => router.push('/reservations')}>
            Terug naar reserveringen
          </Button>
          <Button variant="outline" onClick={() => router.refresh()}>
            Bekijk je beoordeling
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
          Hoe was {dishTitle}?
        </p>
        <div className="flex justify-center">
          <StarRating rating={rating} onChange={setRating} size="lg" />
        </div>
        {rating > 0 && (
          <p className="mt-2 text-sm font-medium text-amber-600">
            {RATING_LABELS[rating]}
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
            Vertel meer (optioneel)
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
            placeholder={PLACEHOLDERS[rating] ?? 'Deel je ervaring...'}
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
        Beoordeling plaatsen
      </Button>
    </form>
  )
}
