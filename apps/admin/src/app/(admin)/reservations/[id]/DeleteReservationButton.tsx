'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteReservation } from '@/actions/reservations'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export function DeleteReservationButton({ reservationId }: { reservationId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    const result = await deleteReservation(reservationId)
    setLoading(false)
    if (!result.error) {
      router.push('/reservations')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        Verwijderen
      </button>
      <ConfirmDialog
        open={open}
        title="Reservering verwijderen"
        message="Weet je zeker dat je deze reservering wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
        confirmLabel="Verwijderen"
        variant="danger"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
