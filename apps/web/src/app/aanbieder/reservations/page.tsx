import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { localeMeta, type Locale } from '@kliekjesclub/i18n'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { formatRelativeDate } from '@/lib/format'
import { RealtimeRefresh } from '@/components/RealtimeRefresh'
import { StatusBadge } from '@/components/StatusBadge'
import { ReservationActions } from '@/components/ReservationActions'
import { ClipboardIcon } from '@/components/icons'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('aanbieder.web')
  return { title: t('reservationsMetadataTitle') }
}

type TabFilter = 'alle' | 'nieuw' | 'bevestigd' | 'afgerond'

function matchesTab(status: string, tab: TabFilter): boolean {
  switch (tab) {
    case 'nieuw':
      return status === 'pending'
    case 'bevestigd':
      return status === 'confirmed'
    case 'afgerond':
      return status === 'collected' || status === 'cancelled' || status === 'no_show'
    case 'alle':
    default:
      return true
  }
}

interface MerchantReservationsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function MerchantReservationsPage({
  searchParams,
}: MerchantReservationsPageProps) {
  const params = await searchParams
  const activeTab = (typeof params.tab === 'string' ? params.tab : 'alle') as TabFilter
  const t = await getTranslations('aanbieder')
  const locale = (await getLocale()) as Locale
  const dateLocale = localeMeta[locale]?.htmlLang ?? 'nl-NL'

  const TABS: { key: TabFilter; label: string }[] = [
    { key: 'alle', label: t('reservations.tabs.all') },
    { key: 'nieuw', label: t('reservations.tabs.new') },
    { key: 'bevestigd', label: t('reservations.tabs.confirmed') },
    { key: 'afgerond', label: t('reservations.tabs.completed') },
  ]

  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createServerComponentClient()
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!merchant) {
    redirect('/aanbieder/profile?setup=aanbieder')
  }

  const { data: reservations } = await supabase
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
        image_url
      ),
      consumer:profiles!reservations_consumer_id_fkey (
        display_name
      )
    `,
    )
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })

  const allReservations = reservations ?? []
  const filtered = allReservations.filter((r) => matchesTab(r.status, activeTab))

  const pendingCount = allReservations.filter((r) => r.status === 'pending').length

  return (
    <div>
      <RealtimeRefresh table="reservations" filter={`merchant_id=eq.${merchant.id}`} />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-warm-900">{t('web.reservationsHeading')}</h1>
          {pendingCount > 0 && (
            <p className="mt-1 text-sm text-warm-500">
              {t(pendingCount === 1 ? 'reservations.pendingBannerSingular' : 'reservations.pendingBannerPlural', { count: pendingCount })}
            </p>
          )}
        </div>
      </div>

      {/* Tab filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key
          const count =
            tab.key === 'nieuw' ? pendingCount : undefined
          return (
            <Link
              key={tab.key}
              href={`/aanbieder/reservations${tab.key === 'alle' ? '' : `?tab=${tab.key}`}`}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-warm-600 hover:bg-warm-50 shadow-card'
              }`}
            >
              {tab.label}
              {count !== undefined && count > 0 && (
                <span
                  className={`ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                    isActive ? 'bg-white text-brand-600' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {count}
                </span>
              )}
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
            {activeTab === 'alle' ? t('reservations.empty.all') : t('reservations.empty.other')}
          </h2>
          <p className="text-warm-500">
            {activeTab === 'alle' ? t('reservations.empty.all') : t('reservations.empty.other')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4" data-reveal-stagger>
          {filtered.map((reservation) => {
            const dish = reservation.dish as unknown as {
              id: string
              title: string
              image_url: string | null
            }
            const consumer = reservation.consumer as unknown as {
              display_name: string | null
            } | null

            return (
              <div
                key={reservation.id}
                data-reveal
                className="rounded-2xl bg-white p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-bold text-warm-900 line-clamp-1">{dish.title}</h3>
                      <StatusBadge status={reservation.status} />
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-warm-600">
                      <span>
                        {t('reservations.customerLabel', { name: consumer?.display_name ?? t('reservations.customerUnknown') })}
                      </span>
                      <span>{t('reservations.quantityLabel', { count: reservation.quantity })}</span>
                      <span>{formatRelativeDate(reservation.created_at)}</span>
                      {reservation.pickup_time && (
                        <span>
                          {t('reservations.pickupLabel', {
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

                    {reservation.notes && (
                      <p className="mt-2 rounded-lg bg-warm-50 px-3 py-2 text-sm text-warm-700">
                        <span className="font-semibold">{t('reservations.noteLabel')}</span> {reservation.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <ReservationActions
                    reservationId={reservation.id}
                    dishId={dish.id}
                    quantity={reservation.quantity}
                    currentStatus={reservation.status}
                    view="merchant"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
