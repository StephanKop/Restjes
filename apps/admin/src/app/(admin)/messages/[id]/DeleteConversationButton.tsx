'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteConversation } from '@/actions/messages'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export function DeleteConversationButton({ conversationId }: { conversationId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    const result = await deleteConversation(conversationId)
    setLoading(false)
    if (!result.error) {
      router.push('/messages')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        Gesprek verwijderen
      </button>
      <ConfirmDialog
        open={open}
        title="Gesprek verwijderen"
        message="Weet je zeker dat je dit gesprek en alle berichten wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
        confirmLabel="Verwijderen"
        variant="danger"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
