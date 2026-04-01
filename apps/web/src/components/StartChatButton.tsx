'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/Button'

interface StartChatButtonProps {
  merchantId: string
  dishId?: string
  merchantName: string
}

export function StartChatButton({
  merchantId,
  dishId,
  merchantName,
}: StartChatButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleClick = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Check for existing conversation
      let query = supabase
        .from('conversations')
        .select('id')
        .eq('merchant_id', merchantId)
        .eq('consumer_id', user.id)

      if (dishId) {
        query = query.eq('dish_id', dishId)
      } else {
        query = query.is('dish_id', null)
      }

      const { data: existing } = await query.maybeSingle()

      if (existing) {
        router.push(`/messages/${existing.id}`)
        return
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          merchant_id: merchantId,
          consumer_id: user.id,
          dish_id: dishId ?? null,
        })
        .select('id')
        .single()

      if (error || !newConversation) {
        console.error('Failed to create conversation:', error)
        return
      }

      router.push(`/messages/${newConversation.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" loading={loading} onClick={handleClick} className="w-full">
      Stuur {merchantName} een bericht
    </Button>
  )
}
