'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface ReservationActionsProps {
  reservationId: string
  dishId?: string
  quantity?: number
  currentStatus: string
  view: 'consumer' | 'merchant'
}

export function ReservationActions({
  reservationId,
  dishId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  quantity,
  currentStatus,
  view,
}: ReservationActionsProps) {
  const router = useRouter()
  const t = useTranslations('reservations.webActions')
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{
    action: string
    newStatus: string
    title: string
    description: string
    label: string
    cancelledBy?: 'consumer' | 'merchant'
  } | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function updateStatus(newStatus: string, actionKey: string, cancelledBy?: 'consumer' | 'merchant') {
    setLoadingAction(actionKey)
    setConfirm(null)
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', reservationId)

      // Try setting cancelled_by separately (column may not exist yet)
      if (!error && cancelledBy) {
        try {
          await supabase
            .from('reservations')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .update({ cancelled_by: cancelledBy } as any)
            .eq('id', reservationId)
        } catch {
          // Ignore — column may not exist yet
        }
      }

      if (error) {
        console.error('Fout bij bijwerken reservering:', error)
      }

      // Update dish status via RPC (bypasses RLS)
      if (!error && dishId && newStatus === 'collected') {
        await supabase.rpc('mark_dish_collected', { p_dish_id: dishId })
      }

      router.refresh()
    } finally {
      setLoadingAction(null)
    }
  }

  function requestConfirm(action: string, newStatus: string, title: string, description: string, label: string, cancelledBy?: 'consumer' | 'merchant') {
    setConfirm({ action, newStatus, title, description, label, cancelledBy })
  }

  // Consumer actions
  if (view === 'consumer') {
    if (currentStatus === 'pending' || currentStatus === 'confirmed') {
      return (
        <>
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 text-sm"
            loading={loadingAction === 'cancel'}
            onClick={() =>
              requestConfirm(
                'cancel',
                'cancelled',
                t('consumerCancelTitle'),
                t('consumerCancelBody'),
                t('cancel'),
                'consumer',
              )
            }
          >
            {t('cancel')}
          </Button>
          <ConfirmModal
            open={confirm !== null}
            title={confirm?.title ?? ''}
            description={confirm?.description}
            confirmLabel={confirm?.label ?? t('confirm')}
            variant="danger"
            loading={loadingAction !== null}
            onConfirm={() => confirm && updateStatus(confirm.newStatus, confirm.action, confirm.cancelledBy)}
            onCancel={() => setConfirm(null)}
          />
        </>
      )
    }
    return null
  }

  // Merchant actions
  if (currentStatus === 'pending') {
    return (
      <>
        <div className="flex gap-2">
          <Button
            variant="primary"
            className="text-sm"
            loading={loadingAction === 'confirm'}
            onClick={() => updateStatus('confirmed', 'confirm')}
          >
            {t('confirm')}
          </Button>
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 text-sm"
            loading={loadingAction === 'decline'}
            onClick={() =>
              requestConfirm(
                'decline',
                'cancelled',
                t('merchantDeclineTitle'),
                t('merchantDeclineBody'),
                t('decline'),
                'merchant',
              )
            }
          >
            {t('decline')}
          </Button>
        </div>
        <ConfirmModal
          open={confirm !== null}
          title={confirm?.title ?? ''}
          description={confirm?.description}
          confirmLabel={confirm?.label ?? t('confirm')}
          variant="danger"
          loading={loadingAction !== null}
          onConfirm={() => confirm && updateStatus(confirm.newStatus, confirm.action, confirm.cancelledBy)}
          onCancel={() => setConfirm(null)}
        />
      </>
    )
  }

  if (currentStatus === 'confirmed') {
    return (
      <>
        <div className="flex gap-2">
          <Button
            variant="primary"
            className="text-sm"
            loading={loadingAction === 'collected'}
            onClick={() => updateStatus('collected', 'collected')}
          >
            {t('markCollected')}
          </Button>
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 text-sm"
            loading={loadingAction === 'no_show'}
            onClick={() =>
              requestConfirm(
                'no_show',
                'no_show',
                t('noShowTitle'),
                t('noShowBody'),
                t('confirm'),
              )
            }
          >
            {t('noShow')}
          </Button>
        </div>
        <ConfirmModal
          open={confirm !== null}
          title={confirm?.title ?? ''}
          description={confirm?.description}
          confirmLabel={confirm?.label ?? t('confirm')}
          variant="danger"
          loading={loadingAction !== null}
          onConfirm={() => confirm && updateStatus(confirm.newStatus, confirm.action, confirm.cancelledBy)}
          onCancel={() => setConfirm(null)}
        />
      </>
    )
  }

  return null
}
