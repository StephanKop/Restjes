'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { StarRating } from '@/components/StarRating'
import { Button } from '@/components/ui/Button'

interface ReviewFormProps {
  merchantId: string
  reservationId: string
  onSuccess?: () => void
}

export function ReviewForm({ merchantId, reservationId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
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

      const {
        data: { user },
      } = await supabase.auth.getUser()

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
          setError('Er ging iets mis bij het plaatsen van je beoordeling. Probeer het opnieuw.')
        }
        setLoading(false)
        return
      }

      setSuccess(true)
      onSuccess?.()
    } catch {
      setError('Er ging iets mis. Controleer je internetverbinding en probeer het opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl bg-brand-50 p-4 text-center">
        <p className="font-semibold text-brand-700">Bedankt voor je beoordeling!</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-warm-800">
          Beoordeling
        </label>
        <StarRating rating={rating} onChange={setRating} size="lg" />
      </div>

      <div>
        <label
          htmlFor={`review-comment-${reservationId}`}
          className="mb-1.5 block text-sm font-semibold text-warm-800"
        >
          Deel je ervaring (optioneel)
        </label>
        <textarea
          id={`review-comment-${reservationId}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-warm-800 placeholder:text-warm-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          placeholder="Hoe was je ervaring?"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <Button type="submit" loading={loading} disabled={rating === 0}>
        Beoordeling plaatsen
      </Button>
    </form>
  )
}
