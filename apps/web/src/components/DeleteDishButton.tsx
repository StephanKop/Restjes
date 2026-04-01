'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/Button'

interface DeleteDishButtonProps {
  dishId: string
  imageUrl: string | null
  merchantId: string
}

export function DeleteDishButton({ dishId, imageUrl, merchantId }: DeleteDishButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function handleDelete() {
    setLoading(true)
    try {
      // Delete image from storage if it exists
      if (imageUrl) {
        const url = new URL(imageUrl)
        const pathParts = url.pathname.split('/dish-images/')
        if (pathParts[1]) {
          await supabase.storage.from('dish-images').remove([pathParts[1]])
        }
      }

      // Delete related records first
      await supabase.from('dish_ingredients').delete().eq('dish_id', dishId)
      await supabase.from('dish_allergies').delete().eq('dish_id', dishId)

      // Delete the dish
      const { error } = await supabase.from('dishes').delete().eq('id', dishId).eq('merchant_id', merchantId)

      if (error) throw error

      router.refresh()
    } catch {
      alert('Er ging iets mis bij het verwijderen. Probeer het opnieuw.')
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="mb-2 text-lg font-bold text-warm-900">Gerecht verwijderen</h3>
          <p className="mb-6 text-sm text-warm-600">
            Weet je zeker dat je dit gerecht wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="flex-1"
            >
              Annuleren
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              loading={loading}
              className="flex-1 !bg-red-600 hover:!bg-red-700"
            >
              Verwijderen
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="secondary"
      onClick={() => setShowConfirm(true)}
      className="text-sm text-red-600 hover:text-red-700"
    >
      Verwijder
    </Button>
  )
}
