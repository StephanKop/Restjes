import type { Metadata } from 'next'
import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { formatRelativeDate } from '@/lib/format'
import { StatusBadge } from '@/components/StatusBadge'
import { ReservationActions } from '@/components/ReservationActions'

export const metadata: Metadata = {
  title: 'Reserveringen',
}

type TabFilter = 'alle' | 'nieuw' | 'bevestigd' | 'afgerond'

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'alle', label: 'Alle' },
  { key: 'nieuw', label: 'Nieuw' },
  { key: 'bevestigd', label: 'Bevestigd' },
  { key: 'afgerond', label: 'Afgerond' },
]

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

  const supabase = await createServerComponentClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!merchant) {
    redirect('/aanbieder/settings')
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

  // Count pending for badge
  const pendingCount = allReservations.filter((r) => r.status === 'pending').length

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-warm-900">Reserveringen</h1>
          {pendingCount > 0 && (
            <p className="mt-1 text-sm text-warm-500">
              {pendingCount} {pendingCount === 1 ? 'nieuwe reservering' : 'nieuwe reserveringen'} wachtend op bevestiging
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
          <p className="mb-2 text-4xl">📋</p>
          <h2 className="mb-2 text-xl font-bold text-warm-900">
            {activeTab === 'alle'
              ? 'Er zijn nog geen reserveringen binnengekomen'
              : 'Geen reserveringen in deze categorie'}
          </h2>
          <p className="text-warm-500">
            {activeTab === 'alle'
              ? 'Zodra een klant een gerecht reserveert, verschijnt het hier.'
              : 'Er zijn geen reserveringen die aan dit filter voldoen.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
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
                        Klant: {consumer?.display_name ?? 'Onbekend'}
                      </span>
                      <span>Aantal: {reservation.quantity}</span>
                      <span>{formatRelativeDate(reservation.created_at)}</span>
                      {reservation.pickup_time && (
                        <span>
                          Ophalen:{' '}
                          {new Date(reservation.pickup_time).toLocaleString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    {reservation.notes && (
                      <p className="mt-2 rounded-lg bg-warm-50 px-3 py-2 text-sm text-warm-700">
                        <span className="font-semibold">Opmerking:</span> {reservation.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <ReservationActions
                    reservationId={reservation.id}
                    currentStatus={reservation.status}
                    role="merchant"
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
