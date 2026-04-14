import { redirect } from 'next/navigation'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { ConversationList, type ConversationItem } from '@/components/ConversationList'
import { MessagesShell } from '@/app/(consumer)/messages/MessagesShell'

export const metadata = {
  title: 'Berichten - Kliekjesclub Aanbieder',
}

export default async function MerchantMessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createServerComponentClient()

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!merchant) {
    redirect('/aanbieder/profile?setup=aanbieder')
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

  const conversationIds = conversations.map((c) => c.id)

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
    const consumer = conv.consumer as unknown as {
      id: string
      display_name: string | null
      avatar_url: string | null
    }
    const dish = conv.dish as unknown as { title: string } | null
    const lastMsg = lastMessageMap.get(conv.id)

    return {
      id: conv.id,
      otherPartyName: consumer?.display_name ?? 'Onbekende gebruiker',
      otherPartyAvatar: consumer?.avatar_url ?? null,
      dishTitle: dish?.title ?? null,
      lastMessage: lastMsg?.content ?? null,
      lastMessageAt: lastMsg?.created_at ?? conv.last_message_at,
      unreadCount: unreadCountMap.get(conv.id) ?? 0,
    }
  })

  const sidebar = (
    <ConversationList conversations={conversationItems} basePath="/aanbieder/messages" currentUserId={user.id} />
  )

  return <MessagesShell sidebar={sidebar} basePath="/aanbieder/messages">{children}</MessagesShell>
}
