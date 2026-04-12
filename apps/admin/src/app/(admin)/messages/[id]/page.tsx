import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-admin'
import { formatDateTime } from '@/lib/format'
import { DeleteConversationButton } from './DeleteConversationButton'

export const metadata: Metadata = {
  title: 'Gesprek details',
}

interface ConversationDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ConversationDetailPage({ params }: ConversationDetailPageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: conversation }, { data: messages }] = await Promise.all([
    supabase
      .from('conversations')
      .select(
        `id, created_at, last_message_at,
         consumer:profiles!conversations_consumer_id_fkey(id, display_name),
         merchant:merchants!inner(id, business_name),
         dish:dishes(id, title)`,
      )
      .eq('id', id)
      .single(),
    supabase
      .from('messages')
      .select('id, content, created_at, is_read, sender:profiles!messages_sender_id_fkey(id, display_name)')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!conversation) notFound()

  const consumer = conversation.consumer as unknown as { id: string; display_name: string | null } | null
  const merchant = conversation.merchant as unknown as { id: string; business_name: string }
  const dish = conversation.dish as unknown as { id: string; title: string } | null

  return (
    <div>
      <div className="mb-6">
        <Link href="/messages" className="text-sm text-warm-500 hover:text-warm-700">
          &larr; Terug naar berichten
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">Gesprek</h1>
          <p className="mt-1 text-sm text-warm-500">
            {consumer?.display_name ?? 'Onbekend'} &harr; {merchant.business_name}
            {dish && <> over {dish.title}</>}
          </p>
        </div>
        <DeleteConversationButton conversationId={id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversation info */}
        <div className="rounded-xl bg-white p-5 shadow-card">
          <h2 className="mb-4 font-bold text-warm-900">Details</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-warm-500">Klant</dt>
              <dd>
                {consumer ? (
                  <Link href={`/users/${consumer.id}`} className="font-medium text-brand-600 hover:text-brand-700">
                    {consumer.display_name ?? 'Onbekend'}
                  </Link>
                ) : (
                  <span className="text-warm-400">Onbekend</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-warm-500">Aanbieder</dt>
              <dd>
                <Link href={`/merchants/${merchant.id}`} className="font-medium text-brand-600 hover:text-brand-700">
                  {merchant.business_name}
                </Link>
              </dd>
            </div>
            {dish && (
              <div>
                <dt className="text-warm-500">Gerecht</dt>
                <dd>
                  <Link href={`/dishes/${dish.id}`} className="font-medium text-brand-600 hover:text-brand-700">
                    {dish.title}
                  </Link>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-warm-500">Gestart</dt>
              <dd className="font-medium text-warm-800">{formatDateTime(conversation.created_at)}</dd>
            </div>
            <div>
              <dt className="text-warm-500">Laatste bericht</dt>
              <dd className="font-medium text-warm-800">
                {conversation.last_message_at ? formatDateTime(conversation.last_message_at) : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-warm-500">Totaal berichten</dt>
              <dd className="font-medium text-warm-800">{messages?.length ?? 0}</dd>
            </div>
          </dl>
        </div>

        {/* Messages */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white shadow-card">
            <div className="border-b border-warm-100 px-5 py-4">
              <h2 className="font-bold text-warm-900">Berichten ({messages?.length ?? 0})</h2>
            </div>
            <div className="max-h-[600px] divide-y divide-warm-50 overflow-y-auto">
              {(messages ?? []).map((msg) => {
                const sender = msg.sender as unknown as { id: string; display_name: string | null } | null
                const isConsumer = sender?.id === consumer?.id
                return (
                  <div key={msg.id} className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${isConsumer ? 'text-blue-600' : 'text-brand-600'}`}>
                        {sender?.display_name ?? 'Onbekend'}
                      </span>
                      <span className="text-xs text-warm-400">{formatDateTime(msg.created_at)}</span>
                      {!msg.is_read && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">Ongelezen</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-warm-700">{msg.content}</p>
                  </div>
                )
              })}
              {(!messages || messages.length === 0) && (
                <p className="px-5 py-4 text-sm text-warm-400">Geen berichten</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
