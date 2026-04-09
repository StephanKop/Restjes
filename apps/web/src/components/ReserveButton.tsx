'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/Button'

interface ReserveButtonProps {
  dishId: string
  merchantId: string
  maxQuantity: number
}

export function ReserveButton({ dishId, merchantId, maxQuantity }: ReserveButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReserve() {
    setLoading(true)
    setError(null)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('Je moet ingelogd zijn om te reserveren.')
        setLoading(false)
        return
      }

      const { error: insertError } = await supabase.from('reservations').insert({
        dish_id: dishId,
        consumer_id: user.id,
        merchant_id: merchantId,
        quantity,
        status: 'pending',
        notes: notes.trim() || null,
      })

      if (insertError) {
        setError('Er ging iets mis bij het plaatsen van je reservering. Probeer het opnieuw.')
        console.error('Reservation error:', insertError)
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Er ging iets mis. Controleer je verbinding en probeer het opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="mb-1 text-2xl">✅</p>
        <p className="font-bold text-green-800">
          Je reservering is geplaatst!
        </p>
        <p className="mt-1 text-sm text-green-700">
          De aanbieder krijgt hiervan bericht.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div>
        <label
          htmlFor="quantity"
          className="mb-1.5 block text-sm font-semibold text-warm-800"
        >
          Aantal
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            disabled={quantity <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-warm-200 text-warm-600 transition-all duration-150 hover:bg-warm-50 active:scale-90 active:bg-warm-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
          >
            -
          </button>
          <span className="min-w-[2rem] text-center text-lg font-bold text-warm-900">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.min(maxQuantity, prev + 1))}
            disabled={quantity >= maxQuantity}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-warm-200 text-warm-600 transition-all duration-150 hover:bg-warm-50 active:scale-90 active:bg-warm-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
          >
            +
          </button>
          <span className="text-sm text-warm-500">
            (max. {maxQuantity})
          </span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="mb-1.5 block text-sm font-semibold text-warm-800"
        >
          Opmerkingen voor de aanbieder
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Bijv. ophalen met de fiets, eerder ophalen, etc."
          rows={3}
          className="w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-warm-800 placeholder:text-warm-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <Button
        variant="primary"
        loading={loading}
        onClick={handleReserve}
        className="w-full"
      >
        Reserveren
      </Button>
    </div>
  )
}
