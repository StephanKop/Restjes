import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-admin'
import { formatDateTime } from '@/lib/format'
import { StatusBadge } from '@/components/StatusBadge'
import { ReservationStatusSelect } from './ReservationStatusSelect'
import { DeleteReservationButton } from './DeleteReservationButton'

export const metadata: Metadata = {
  title: 'Reservering details',
}

interface ReservationDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ReservationDetailPage({ params }: ReservationDetailPageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: reservation } = await supabase
    .from('reservations')
    .select(
      `*,
       dish:dishes!inner(id, title, image_url, status),
       consumer:profiles!reservations_consumer_id_fkey(id, display_name, city, phone),
       merchant:merchants!inner(id, business_name)`,
    )
    .eq('id', id)
    .single()

  if (!reservation) notFound()

  const dish = reservation.dish as unknown as { id: string; title: string; image_url: string | null; status: string }
  const consumer = reservation.consumer as unknown as { id: string; display_name: string | null; city: string | null; phone: string | null } | null
  const merchant = reservation.merchant as unknown as { id: string; business_name: string }

  return (
    <div>
      <div className="mb-6">
        <Link href="/reservations" className="text-sm text-warm-500 hover:text-warm-700">
          &larr; Terug naar reserveringen
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-warm-900">Reservering</h1>
            <StatusBadge status={reservation.status} type="reservation" />
          </div>
          <p className="mt-1 text-sm text-warm-500">ID: {reservation.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <ReservationStatusSelect reservationId={id} currentStatus={reservation.status} />
          <DeleteReservationButton reservationId={id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reservation details */}
        <div className="rounded-xl bg-white p-5 shadow-card">
          <h2 className="mb-4 font-bold text-warm-900">Details</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-warm-500">Aantal</dt>
              <dd className="font-medium text-warm-800">{reservation.quantity}x</dd>
            </div>
            <div>
              <dt className="text-warm-500">Ophaaltijd</dt>
              <dd className="font-medium text-warm-800">
                {reservation.pickup_time ? formatDateTime(reservation.pickup_time) : 'Niet opgegeven'}
              </dd>
            </div>
            <div>
              <dt className="text-warm-500">Opmerkingen</dt>
              <dd className="font-medium text-warm-800">{reservation.notes ?? 'Geen'}</dd>
            </div>
            <div>
              <dt className="text-warm-500">Aangemaakt</dt>
              <dd className="font-medium text-warm-800">{formatDateTime(reservation.created_at)}</dd>
            </div>
            <div>
              <dt className="text-warm-500">Laatst bijgewerkt</dt>
              <dd className="font-medium text-warm-800">{formatDateTime(reservation.updated_at)}</dd>
            </div>
          </dl>
        </div>

        {/* Linked entities */}
        <div className="space-y-6 lg:col-span-2">
          {/* Dish */}
          <div className="rounded-xl bg-white p-5 shadow-card">
            <h2 className="mb-3 font-bold text-warm-900">Gerecht</h2>
            <Link href={`/dishes/${dish.id}`} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-warm-50">
              <div>
                <p className="font-medium text-warm-800 hover:text-brand-600">{dish.title}</p>
                <div className="mt-1">
                  <StatusBadge status={dish.status} type="dish" />
                </div>
              </div>
            </Link>
          </div>

          {/* Consumer */}
          <div className="rounded-xl bg-white p-5 shadow-card">
            <h2 className="mb-3 font-bold text-warm-900">Klant</h2>
            {consumer ? (
              <Link href={`/users/${consumer.id}`} className="block rounded-lg p-2 transition-colors hover:bg-warm-50">
                <p className="font-medium text-warm-800">{consumer.display_name ?? 'Onbekend'}</p>
                <p className="text-sm text-warm-500">
                  {[consumer.city, consumer.phone].filter(Boolean).join(' · ') || 'Geen contactgegevens'}
                </p>
              </Link>
            ) : (
              <p className="text-sm text-warm-400">Klant niet gevonden</p>
            )}
          </div>

          {/* Merchant */}
          <div className="rounded-xl bg-white p-5 shadow-card">
            <h2 className="mb-3 font-bold text-warm-900">Aanbieder</h2>
            <Link href={`/merchants/${merchant.id}`} className="block rounded-lg p-2 transition-colors hover:bg-warm-50">
              <p className="font-medium text-warm-800">{merchant.business_name}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
