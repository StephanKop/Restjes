import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import { ConversationList, type ConversationItem } from '@/components/ConversationList'

export const metadata = {
  title: 'Berichten - Restjes',
}

export default async function ConsumerMessagesPage() {
  const supabase = await createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: conversations } = await supabase
    .from('conversations')
    .select(
      `
      id,
      last_message_at,
      merchant:merchants!inner (
        id,
        business_name,
        logo_url
      ),
      dish:dishes (
        title
      )
    `,
    )
    .eq('consumer_id', user.id)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (!conversations || conversations.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-extrabold text-warm-900">Berichten</h1>
        <div className="rounded-2xl bg-white p-12 text-center shadow-card">
          <p className="text-warm-500">Je hebt nog geen berichten</p>
        </div>
      </div>
    )
  }

  // Fetch last message and unread count for each conversation
  const conversationItems: ConversationItem[] = await Promise.all(
    conversations.map(async (conv) => {
      const merchant = conv.merchant as unknown as {
        id: string
        business_name: string
        logo_url: string | null
      }
      const dish = conv.dish as unknown as { title: string } | null

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

      return {
        id: conv.id,
        otherPartyName: merchant.business_name,
        otherPartyAvatar: merchant.logo_url,
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
      <ConversationList conversations={conversationItems} basePath="/messages" />
    </div>
  )
}
