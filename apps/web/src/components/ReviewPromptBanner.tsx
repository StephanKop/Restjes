'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { CookingPotIcon } from '@/components/icons'

interface UnreviewedReservation {
  id: string
  dish: {
    title: string
    image_url: string | null
  }
  merchant: {
    business_name: string
  }
}

const DISMISS_KEY = 'kliekjesclub_review_prompt_dismissed'

function getDismissedIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(DISMISS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function dismissId(id: string) {
  const ids = getDismissedIds()
  if (!ids.includes(id)) {
    ids.push(id)
    localStorage.setItem(DISMISS_KEY, JSON.stringify(ids))
  }
}

export function ReviewPromptBanner() {
  const [reservation, setReservation] = useState<UnreviewedReservation | null>(null)
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    async function fetch() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get collected reservations
      const { data: collected } = await supabase
        .from('reservations')
        .select(`
          id,
          dish:dishes!inner ( title, image_url ),
          merchant:merchants!inner ( business_name )
        `)
        .eq('consumer_id', user.id)
        .eq('status', 'collected')
        .order('updated_at', { ascending: false })
        .limit(10)

      if (!collected || collected.length === 0) return

      // Get reviewed reservation IDs
      const { data: reviews } = await supabase
        .from('reviews')
        .select('reservation_id')
        .eq('consumer_id', user.id)
        .in('reservation_id', collected.map((r) => r.id))

      const reviewedIds = new Set((reviews ?? []).map((r) => r.reservation_id))
      const dismissedIds = new Set(getDismissedIds())

      const unreviewed = collected.find(
        (r) => !reviewedIds.has(r.id) && !dismissedIds.has(r.id),
      )

      if (unreviewed) {
        const dish = unreviewed.dish as unknown as { title: string; image_url: string | null }
        const merchant = unreviewed.merchant as unknown as { business_name: string }
        setReservation({ id: unreviewed.id, dish, merchant })
        // Small delay for entrance animation
        requestAnimationFrame(() => setVisible(true))
      }
    }

    fetch()
  }, [])

  function handleDismiss() {
    if (!reservation) return
    dismissId(reservation.id)
    setClosing(true)
    setTimeout(() => setVisible(false), 300)
  }

  if (!reservation || (!visible && !closing)) return null

  return (
    <div
      className={`mb-6 overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 ${
        visible && !closing
          ? 'translate-y-0 opacity-100'
          : '-translate-y-2 opacity-0'
      }`}
    >
      <div className="relative p-4 sm:p-5">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-warm-400 transition-colors hover:bg-warm-50 hover:text-warm-600"
          aria-label="Sluiten"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>

        <div className="flex items-center gap-4 pr-8 sm:pr-0">
          {/* Dish image */}
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-warm-100">
            {reservation.dish.image_url ? (
              <Image
                src={reservation.dish.image_url}
                alt={reservation.dish.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-warm-300">
                <CookingPotIcon className="h-6 w-6" />
              </div>
            )}
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-warm-900">
              Hoe was {reservation.dish.title}?
            </p>
            <p className="text-sm text-warm-500">
              Opgehaald bij {reservation.merchant.business_name} — laat een beoordeling achter!
            </p>
          </div>

          {/* Desktop CTA */}
          <Link
            href={`/review/${reservation.id}`}
            className="hidden flex-shrink-0 rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-600 active:scale-[0.97] sm:inline-flex"
          >
            Beoordelen
          </Link>
        </div>

        {/* Mobile CTA */}
        <Link
          href={`/review/${reservation.id}`}
          className="mt-3 flex w-full items-center justify-center rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-600 active:scale-[0.97] sm:hidden"
        >
          Beoordelen
        </Link>
      </div>
    </div>
  )
}
