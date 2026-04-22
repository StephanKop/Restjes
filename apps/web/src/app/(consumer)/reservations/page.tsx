import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { localeMeta, type Locale } from '@kliekjesclub/i18n'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { formatRelativeDate } from '@/lib/format'
import { StatusBadge } from '@/components/StatusBadge'
import { ReservationActions } from '@/components/ReservationActions'
import { ReservationReviewSection } from '@/components/ReservationReviewSection'
import { ClipboardIcon, CookingPotIcon } from '@/components/icons'
import { RealtimeRefresh } from '@/components/RealtimeRefresh'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('reservations.web')
  return { title: t('metadataTitle') }
}

type TabFilter = 'alle' | 'actief' | 'afgerond' | 'geannuleerd'

function matchesTab(status: string, tab: TabFilter): boolean {
  switch (tab) {
    case 'actief':
      return status === 'pending' || status === 'confirmed'
    case 'afgerond':
      return status === 'collected'
    case 'geannuleerd':
      return status === 'cancelled' || status === 'no_show'
    case 'alle':
    default:
      return true
  }
}

interface ConsumerReservationsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ConsumerReservationsPage({
  searchParams,
}: ConsumerReservationsPageProps) {
  const t = await getTranslations('reservations.web')
  const locale = (await getLocale()) as Locale
  const dateLocale = localeMeta[locale]?.htmlLang ?? 'nl-NL'
  const params = await searchParams
  const activeTab = (typeof params.tab === 'string' ? params.tab : 'alle') as TabFilter

  const TABS: { key: TabFilter; label: string }[] = [
    { key: 'alle', label: t('tabs.all') },
    { key: 'actief', label: t('tabs.active') },
    { key: 'afgerond', label: t('tabs.completed') },
    { key: 'geannuleerd', label: t('tabs.cancelled') },
  ]

  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createServerComponentClient()

  // Fetch reservations and the user's reviews in parallel — both are scoped
  // by consumer_id so reviews don't need to wait for reservations.
  const [reservationsRes, reviewsRes] = await Promise.all([
    supabase
      .from('reservations')
      .select(
        `
        id,
        quantity,
        status,
        pickup_time,
        notes,
        created_at,
        dish:dishes!inner (
          id,
          title,
          image_url,
          merchant_id
        ),
        merchant:merchants!inner (
          id,
          business_name,
          city
        )
      `,
      )
      .eq('consumer_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('reviews')
      .select('reservation_id, rating')
      .eq('consumer_id', user.id),
  ])

  const allReservations = reservationsRes.data ?? []

  const reviewMap: Record<string, number> = {}
  for (const review of reviewsRes.data ?? []) {
    if (review.reservation_id) {
      reviewMap[review.reservation_id] = review.rating
    }
  }

  const filtered = allReservations.filter((r) => matchesTab(r.status, activeTab))

  return (
    <div>
      <RealtimeRefresh table="reservations" filter={`consumer_id=eq.${user.id}`} />
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-warm-900">{t('heading')}</h1>
      </div>

      {/* Tab filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <Link
              key={tab.key}
              href={`/reservations${tab.key === 'alle' ? '' : `?tab=${tab.key}`}`}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-warm-600 hover:bg-warm-50 shadow-card'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-card">
          <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-100 text-warm-400">
            <ClipboardIcon className="h-7 w-7" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-warm-900">
            {activeTab === 'alle' ? t('emptyHeadingAll') : t('emptyHeadingOther')}
          </h2>
          <p className="text-warm-500">
            {activeTab === 'alle' ? t('emptyBodyAll') : t('emptyBodyOther')}
          </p>
          {activeTab === 'alle' && (
            <Link
              href="/browse"
              className="mt-4 inline-block rounded-xl bg-brand-500 px-6 py-3 font-bold text-white transition-colors hover:bg-brand-600"
            >
              {t('discoverCta')}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4" data-reveal-stagger>
          {filtered.map((reservation) => {
            const dish = reservation.dish as unknown as {
              id: string
              title: string
              image_url: string | null
              merchant_id: string
            }
            const merchant = reservation.merchant as unknown as {
              id: string
              business_name: string
              city: string
            }

            const isCollected = reservation.status === 'collected'
            const existingRating = reviewMap[reservation.id] ?? null

            return (
              <div
                key={reservation.id}
                data-reveal
                className="flex gap-4 rounded-2xl bg-white p-4 shadow-card sm:p-5"
              >
                {/* Dish image */}
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-warm-100 sm:h-28 sm:w-28">
                  {dish.image_url ? (
                    <Image
                      src={dish.image_url}
                      alt={dish.title}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-warm-300">
                      <CookingPotIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <Link href={`/gerecht/${dish.id}`}>
                        <h3 className="font-bold text-warm-900 hover:text-brand-600 line-clamp-1">
                          {dish.title}
                        </h3>
                      </Link>
                      <StatusBadge status={reservation.status} />
                    </div>
                    <p className="text-sm text-warm-500">{merchant.business_name} - {merchant.city}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-warm-600">
                      <span>{t('quantityLabel', { count: reservation.quantity })}</span>
                      <span>{formatRelativeDate(reservation.created_at)}</span>
                      {reservation.pickup_time && (
                        <span>
                          {t('pickupLabel', {
                            time: new Date(reservation.pickup_time).toLocaleString(dateLocale, {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            }),
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <ReservationActions
                      reservationId={reservation.id}
                      dishId={dish.id}
                      quantity={reservation.quantity}
                      currentStatus={reservation.status}
                      view="consumer"
                    />
                  </div>

                  {/* Review section for collected reservations */}
                  {isCollected && (
                    <div className="mt-3 border-t border-warm-100 pt-3">
                      <ReservationReviewSection
                        reservationId={reservation.id}
                        merchantId={merchant.id}
                        existingRating={existingRating}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
