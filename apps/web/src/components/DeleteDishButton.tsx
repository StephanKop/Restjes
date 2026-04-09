'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface DeleteDishButtonProps {
  dishId: string
  imageUrl: string | null
  merchantId: string
}

export function DeleteDishButton({ dishId, imageUrl, merchantId }: DeleteDishButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function handleDelete() {
    setLoading(true)
    setError(false)
    try {
      if (imageUrl) {
        const url = new URL(imageUrl)
        const pathParts = url.pathname.split('/dish-images/')
        if (pathParts[1]) {
          await supabase.storage.from('dish-images').remove([pathParts[1]])
        }
      }

      await supabase.from('dish_ingredients').delete().eq('dish_id', dishId)
      await supabase.from('dish_allergies').delete().eq('dish_id', dishId)

      const { error: deleteError } = await supabase
        .from('dishes')
        .delete()
        .eq('id', dishId)
        .eq('merchant_id', merchantId)

      if (deleteError) throw deleteError

      setShowConfirm(false)
      router.refresh()
    } catch {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setShowConfirm(true)}
        className="text-sm text-red-600 hover:text-red-700"
      >
        Verwijder
      </Button>

      <ConfirmModal
        open={showConfirm}
        title="Gerecht verwijderen?"
        description={
          error
            ? 'Er ging iets mis. Probeer het opnieuw.'
            : 'Dit kan niet ongedaan worden gemaakt. Alle reserveringen voor dit gerecht worden ook verwijderd.'
        }
        confirmLabel="Verwijderen"
        variant="danger"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => { setShowConfirm(false); setError(false) }}
      />
    </>
  )
}
