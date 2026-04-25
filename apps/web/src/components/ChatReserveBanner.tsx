'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { useTranslations } from 'next-intl'
import { DishIcon } from '@/components/icons'
import { dishPath } from '@/lib/slug'

interface ChatReserveBannerProps {
  dishId: string
  dishTitle: string
  dishImageUrl: string | null
  merchantId: string
  maxQuantity: number
}

export function ChatReserveBanner({
  dishId,
  dishTitle,
  dishImageUrl,
  merchantId,
  maxQuantity,
}: ChatReserveBannerProps) {
  const t = useTranslations('messages.reserveBanner')
  const [expanded, setExpanded] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReserve() {
    setLoading(true)
    setError(null)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError(t('mustLogin'))
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('reservations').insert({
      dish_id: dishId,
      consumer_id: user.id,
      merchant_id: merchantId,
      quantity,
      status: 'pending',
    })

    if (insertError) {
      setError(t('reserveFailed'))
    } else {
      // Decrement dish quantity via RPC (bypasses RLS)
      await supabase.rpc('decrement_dish_quantity', {
        p_dish_id: dishId,
        p_quantity: quantity,
      })
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex items-center gap-3 border-b border-green-200 bg-green-50 px-4 py-2.5">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-green-600">
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
        </svg>
        <p className="text-sm font-semibold text-green-800">{t('success')}</p>
        <Link href="/reservations" className="ml-auto text-xs font-semibold text-green-700 hover:text-green-900">
          {t('view')}
        </Link>
      </div>
    )
  }

  return (
    <div className="border-b border-warm-100 bg-white">
      {/* Collapsed: dish info + reserve button */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-warm-100">
          {dishImageUrl ? (
            <Image src={dishImageUrl} alt={dishTitle} width={40} height={40} className="h-10 w-10 object-cover" />
          ) : (
            <DishIcon className="h-5 w-5 text-warm-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link href={dishPath({ id: dishId, title: dishTitle })} className="text-sm font-semibold text-warm-800 hover:text-brand-600 line-clamp-1">
            {dishTitle}
          </Link>
          <p className="text-xs text-warm-500">{t('remaining', { count: maxQuantity })}</p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-shrink-0 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-600"
        >
          {expanded ? t('close') : t('reserve')}
        </button>
      </div>

      {/* Expanded: quantity picker + confirm */}
      {expanded && (
        <div className="border-t border-warm-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-warm-600">{t('quantityLabel')}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-warm-200 text-sm text-warm-600 transition-all duration-150 hover:bg-warm-50 active:scale-90 active:bg-warm-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:opacity-40 disabled:active:scale-100"
              >
                -
              </button>
              <span className="w-6 text-center text-sm font-bold text-warm-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                disabled={quantity >= maxQuantity}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-warm-200 text-sm text-warm-600 transition-all duration-150 hover:bg-warm-50 active:scale-90 active:bg-warm-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:opacity-40 disabled:active:scale-100"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={handleReserve}
              disabled={loading}
              className="ml-auto rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
            >
              {loading ? t('loading') : t('confirm')}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}
