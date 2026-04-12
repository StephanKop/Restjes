'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteDish } from '@/actions/dishes'
import { ConfirmDialog } from '@/components/ConfirmDialog'

interface DeleteDishButtonProps {
  dishId: string
  dishTitle: string
}

export function DeleteDishButton({ dishId, dishTitle }: DeleteDishButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    setError(null)
    const result = await deleteDish(dishId)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setOpen(false)
      router.push('/dishes')
    }
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setError(null) }}
        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        Verwijderen
      </button>
      <ConfirmDialog
        open={open}
        title="Gerecht verwijderen"
        message={
          error
            ? `Fout: ${error}`
            : `Weet je zeker dat je "${dishTitle}" wilt verwijderen? Alle bijbehorende reserveringen, ingredienten en allergenen worden ook verwijderd.`
        }
        confirmLabel="Verwijderen"
        variant="danger"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
