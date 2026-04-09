import { redirect } from 'next/navigation'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { ConversationList, type ConversationItem } from '@/components/ConversationList'
import { MessagesShell } from './MessagesShell'

export const metadata = {
  title: 'Berichten - Restjes',
}

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createServerComponentClient()

  // Fetch conversations where user is the consumer
  const { data: consumerConvs } = await supabase
    .from('conversations')
    .select(
      `
      id,
      consumer_id,
      last_message_at,
      merchant:merchants!inner (
        id,
        business_name,
        logo_url,
        profile_id
      ),
      dish:dishes (
        title
      )
    `,
    )
    .eq('consumer_id', user.id)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  // Also fetch conversations where user is the merchant
  const { data: merchantRecord } = await supabase
    .from('merchants')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let merchantConvs: any[] = []
  if (merchantRecord) {
    const { data } = await supabase
      .from('conversations')
      .select(
        `
        id,
        consumer_id,
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
      .eq('merchant_id', merchantRecord.id)
      .order('last_message_at', { ascending: false, nullsFirst: false })
    merchantConvs = data ?? []
  }

  const allConvIds = [
    ...(consumerConvs ?? []).map((c) => c.id),
    ...(merchantConvs ?? []).map((c) => c.id),
  ]

  if (allConvIds.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-extrabold text-warm-900">Berichten</h1>
        <div className="rounded-2xl bg-white p-12 text-center shadow-card">
          <p className="text-warm-500">Je hebt nog geen berichten</p>
        </div>
      </div>
    )
  }

  const [{ data: allMessages }, { data: unreadCounts }] = await Promise.all([
    supabase
      .from('messages')
      .select('conversation_id, content, created_at')
      .in('conversation_id', allConvIds)
      .order('created_at', { ascending: false }),
    supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', allConvIds)
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

  const conversationItems: ConversationItem[] = []

  // Consumer conversations — other party is the merchant
  for (const conv of consumerConvs ?? []) {
    const merchant = conv.merchant as unknown as {
      id: string
      business_name: string
      logo_url: string | null
    }
    const dish = conv.dish as unknown as { title: string } | null
    const lastMsg = lastMessageMap.get(conv.id)

    conversationItems.push({
      id: conv.id,
      otherPartyName: merchant.business_name,
      otherPartyAvatar: merchant.logo_url,
      dishTitle: dish?.title ?? null,
      lastMessage: lastMsg?.content ?? null,
      lastMessageAt: lastMsg?.created_at ?? conv.last_message_at,
      unreadCount: unreadCountMap.get(conv.id) ?? 0,
    })
  }

  // Merchant conversations — other party is the consumer
  for (const conv of merchantConvs ?? []) {
    const consumer = conv.consumer as unknown as {
      id: string
      display_name: string | null
      avatar_url: string | null
    }
    const dish = conv.dish as unknown as { title: string } | null
    const lastMsg = lastMessageMap.get(conv.id)

    conversationItems.push({
      id: conv.id,
      otherPartyName: consumer?.display_name ?? 'Onbekende gebruiker',
      otherPartyAvatar: consumer?.avatar_url ?? null,
      dishTitle: dish?.title ?? null,
      lastMessage: lastMsg?.content ?? null,
      lastMessageAt: lastMsg?.created_at ?? conv.last_message_at,
      unreadCount: unreadCountMap.get(conv.id) ?? 0,
    })
  }

  // Sort all by most recent
  conversationItems.sort((a, b) => {
    const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
    const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
    return timeB - timeA
  })

  const sidebar = (
    <ConversationList conversations={conversationItems} basePath="/messages" currentUserId={user.id} />
  )

  return <MessagesShell sidebar={sidebar} basePath="/messages">{children}</MessagesShell>
}
