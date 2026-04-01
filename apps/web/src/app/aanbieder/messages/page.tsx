import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { ConversationList, type ConversationItem } from '@/components/ConversationList'

export const metadata = {
  title: 'Berichten - Restjes Aanbieder',
}

export default async function MerchantMessagesPage() {
  const supabase = await createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get the merchant record for this user
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!merchant) {
    redirect('/aanbieder/settings')
  }

  const { data: conversations } = await supabase
    .from('conversations')
    .select(
      `
      id,
      last_message_at,
      consumer:profiles!conversations_consumer_id_fkey (
        id,
        display_name,
        avatar_url
      ),
      dish:dishes (
        title
      )
    `,
    )
    .eq('merchant_id', merchant.id)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (!conversations || conversations.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-extrabold text-warm-900">Berichten</h1>
        <div className="rounded-2xl bg-white p-12 text-center shadow-card">
          <p className="text-warm-500">Je hebt nog geen berichten ontvangen</p>
        </div>
      </div>
    )
  }

  const conversationItems: ConversationItem[] = await Promise.all(
    conversations.map(async (conv) => {
      const consumer = conv.consumer as unknown as {
        id: string
        display_name: string | null
        avatar_url: string | null
      }

      const { data: lastMsg } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { count: unreadCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('is_read', false)
        .neq('sender_id', user.id)

      const dish = conv.dish as unknown as { title: string } | null

      return {
        id: conv.id,
        otherPartyName: consumer?.display_name ?? 'Onbekende gebruiker',
        otherPartyAvatar: consumer?.avatar_url ?? null,
        dishTitle: dish?.title ?? null,
        lastMessage: lastMsg?.content ?? null,
        lastMessageAt: lastMsg?.created_at ?? conv.last_message_at,
        unreadCount: unreadCount ?? 0,
      }
    }),
  )

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-warm-900">Berichten</h1>
      <ConversationList
        conversations={conversationItems}
        basePath="/aanbieder/messages"
      />
    </div>
  )
}
