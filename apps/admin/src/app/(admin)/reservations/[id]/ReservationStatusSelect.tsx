'use client'

import { useState } from 'react'
import { updateReservationStatus } from '@/actions/reservations'

interface ReservationStatusSelectProps {
  reservationId: string
  currentStatus: string
}

const statuses = [
  { value: 'pending', label: 'In afwachting' },
  { value: 'confirmed', label: 'Bevestigd' },
  { value: 'collected', label: 'Opgehaald' },
  { value: 'cancelled', label: 'Geannuleerd' },
  { value: 'no_show', label: 'Niet opgehaald' },
]

export function ReservationStatusSelect({ reservationId, currentStatus }: ReservationStatusSelectProps) {
  const [loading, setLoading] = useState(false)

  async function handleChange(newStatus: string) {
    if (newStatus === currentStatus) return
    setLoading(true)
    await updateReservationStatus(reservationId, newStatus)
    setLoading(false)
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="rounded-lg border border-warm-200 px-3 py-2 text-sm font-medium text-warm-700 outline-none focus:border-brand-500 disabled:opacity-60"
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  )
}
