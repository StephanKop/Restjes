'use client'

import { useState } from 'react'
import { deleteReview } from '@/actions/reviews'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await deleteReview(reviewId)
    setLoading(false)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
      >
        Verwijderen
      </button>
      <ConfirmDialog
        open={open}
        title="Beoordeling verwijderen"
        message="Weet je zeker dat je deze beoordeling wilt verwijderen? De gemiddelde beoordeling van de aanbieder wordt automatisch herberekend."
        confirmLabel="Verwijderen"
        variant="danger"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
