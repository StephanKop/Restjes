'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/Button'

interface ReservationActionsProps {
  reservationId: string
  currentStatus: string
  role: 'consumer' | 'merchant'
}

export function ReservationActions({
  reservationId,
  currentStatus,
  role,
}: ReservationActionsProps) {
  const router = useRouter()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function updateStatus(newStatus: string, actionKey: string, confirmMessage?: string) {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return
    }

    setLoadingAction(actionKey)
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', reservationId)

      if (error) {
        console.error('Fout bij bijwerken reservering:', error)
        alert('Er is iets misgegaan. Probeer het opnieuw.')
        return
      }

      router.refresh()
    } finally {
      setLoadingAction(null)
    }
  }

  // Consumer actions
  if (role === 'consumer') {
    if (currentStatus === 'pending' || currentStatus === 'confirmed') {
      return (
        <Button
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50 text-sm"
          loading={loadingAction === 'cancel'}
          onClick={() =>
            updateStatus(
              'cancelled',
              'cancel',
              'Weet je zeker dat je deze reservering wilt annuleren?',
            )
          }
        >
          Annuleren
        </Button>
      )
    }
    return null
  }

  // Merchant actions
  if (currentStatus === 'pending') {
    return (
      <div className="flex gap-2">
        <Button
          variant="primary"
          className="text-sm"
          loading={loadingAction === 'confirm'}
          onClick={() => updateStatus('confirmed', 'confirm')}
        >
          Bevestigen
        </Button>
        <Button
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50 text-sm"
          loading={loadingAction === 'decline'}
          onClick={() =>
            updateStatus(
              'cancelled',
              'decline',
              'Weet je zeker dat je deze reservering wilt afwijzen?',
            )
          }
        >
          Afwijzen
        </Button>
      </div>
    )
  }

  if (currentStatus === 'confirmed') {
    return (
      <div className="flex gap-2">
        <Button
          variant="primary"
          className="text-sm"
          loading={loadingAction === 'collected'}
          onClick={() => updateStatus('collected', 'collected')}
        >
          Markeer als opgehaald
        </Button>
        <Button
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50 text-sm"
          loading={loadingAction === 'no_show'}
          onClick={() =>
            updateStatus(
              'no_show',
              'no_show',
              'Weet je zeker dat je deze reservering als niet opgehaald wilt markeren?',
            )
          }
        >
          Niet opgehaald
        </Button>
      </div>
    )
  }

  return null
}
