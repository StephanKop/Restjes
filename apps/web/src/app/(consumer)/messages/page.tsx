import { redirect } from 'next/navigation'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { ConversationList, type ConversationItem } from '@/components/ConversationList'

export const metadata = {
  title: 'Berichten - Restjes',
}

export default async function ConsumerMessagesPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createServerComponentClient()
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

  const conversationIds = conversations.map((c) => c.id)

  // Batch: fetch the most recent message per conversation and unread counts in 2 queries total
  const [{ data: allMessages }, { data: unreadCounts }] = await Promise.all([
    supabase
      .from('messages')
      .select('conversation_id, content, created_at')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false }),
    supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', conversationIds)
      .eq('is_read', false)
      .neq('sender_id', user.id),
  ])

  // Build lookup maps
  const lastMessageMap = new Map<string, { content: string; created_at: string }>()
  for (const msg of allMessages ?? []) {
    if (!lastMessageMap.has(msg.conversation_id)) {
      lastMessageMap.set(msg.conversation_id, msg)
    }
  }

  const unreadCountMap = new Map<string, number>()
  for (const row of unreadCounts ?? []) {
    unreadCountMap.set(row.conversation_id, (unreadCountMap.get(row.conversation_id) ?? 0) + 1)
  }

  const conversationItems: ConversationItem[] = conversations.map((conv) => {
    const merchant = conv.merchant as unknown as {
      id: string
      business_name: string
      logo_url: string | null
    }
    const dish = conv.dish as unknown as { title: string } | null
    const lastMsg = lastMessageMap.get(conv.id)

    return {
      id: conv.id,
      otherPartyName: merchant.business_name,
      otherPartyAvatar: merchant.logo_url,
      dishTitle: dish?.title ?? null,
      lastMessage: lastMsg?.content ?? null,
      lastMessageAt: lastMsg?.created_at ?? conv.last_message_at,
      unreadCount: unreadCountMap.get(conv.id) ?? 0,
    }
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-warm-900">Berichten</h1>
      <ConversationList conversations={conversationItems} basePath="/messages" />
    </div>
  )
}
