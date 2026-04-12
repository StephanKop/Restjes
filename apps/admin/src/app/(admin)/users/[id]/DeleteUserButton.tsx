'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteUser } from '@/actions/users'
import { ConfirmDialog } from '@/components/ConfirmDialog'

interface DeleteUserButtonProps {
  userId: string
  userName: string
}

export function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    const result = await deleteUser(userId)
    setLoading(false)
    if (!result.error) {
      router.push('/users')
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
        title="Gebruiker verwijderen"
        message={`Weet je zeker dat je "${userName}" wilt verwijderen? Dit verwijdert het account en alle bijbehorende gegevens permanent.`}
        confirmLabel="Verwijderen"
        variant="danger"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
