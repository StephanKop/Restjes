'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/Button'

interface MerchantReplyFormProps {
  reviewId: string
  existingReply?: string | null
}

export function MerchantReplyForm({ reviewId, existingReply }: MerchantReplyFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reply, setReply] = useState(existingReply ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const maxChars = 300

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = reply.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          merchant_reply: trimmed,
          merchant_replied_at: new Date().toISOString(),
        })
        .eq('id', reviewId)

      if (updateError) {
        setError('Kon reactie niet opslaan. Probeer het opnieuw.')
        setLoading(false)
        return
      }

      setOpen(false)
      router.refresh()
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  // Show existing reply
  if (existingReply && !open) {
    return (
      <div className="mt-3 rounded-xl bg-brand-50 p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold text-brand-700">Jouw reactie</span>
          <button
            onClick={() => setOpen(true)}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Bewerken
          </button>
        </div>
        <p className="text-sm text-brand-800">{existingReply}</p>
      </div>
    )
  }

  // Toggle button when no reply yet and form is closed
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
      >
        Reageren
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <textarea
        value={reply}
        onChange={(e) => {
          if (e.target.value.length <= maxChars) {
            setReply(e.target.value)
          }
        }}
        rows={3}
        className="w-full resize-none rounded-xl border border-warm-200 bg-white px-4 py-3 text-sm text-warm-800 placeholder:text-warm-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        placeholder="Reageer op deze beoordeling..."
        autoFocus
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs ${reply.length > maxChars * 0.9 ? 'text-red-500' : 'text-warm-400'}`}>
          {reply.length}/{maxChars}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="px-4 py-2 text-sm"
            onClick={() => {
              setOpen(false)
              setReply(existingReply ?? '')
              setError(null)
            }}
          >
            Annuleren
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!reply.trim()}
            className="px-4 py-2 text-sm"
          >
            {existingReply ? 'Bijwerken' : 'Plaatsen'}
          </Button>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </form>
  )
}
