import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { Pagination } from '@/components/Pagination'
import { formatDateTime, formatRelativeDate } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Berichten',
}

const PAGE_SIZE = 20

interface MessagesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function ConversationsTable({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createAdminClient()
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)

  const { data: conversations, count } = await supabase
    .from('conversations')
    .select(
      `id, last_message_at, created_at,
       consumer:profiles!conversations_consumer_id_fkey(id, display_name),
       merchant:merchants!inner(id, business_name),
       dish:dishes(id, title)`,
      { count: 'exact' },
    )
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  // Get message counts and latest message per conversation
  const convIds = (conversations ?? []).map((c) => c.id)
  const { data: allMessages } = convIds.length > 0
    ? await supabase
        .from('messages')
        .select('conversation_id, created_at')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const countMap = new Map<string, number>()
  const latestMessageMap = new Map<string, string>()
  for (const m of allMessages ?? []) {
    countMap.set(m.conversation_id, (countMap.get(m.conversation_id) ?? 0) + 1)
    if (!latestMessageMap.has(m.conversation_id)) {
      latestMessageMap.set(m.conversation_id, m.created_at)
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-warm-100 text-xs font-semibold uppercase tracking-wider text-warm-500">
              <th className="px-5 py-3">Klant</th>
              <th className="px-5 py-3">Aanbieder</th>
              <th className="px-5 py-3">Gerecht</th>
              <th className="px-5 py-3">Berichten</th>
              <th className="px-5 py-3">Laatste bericht</th>
              <th className="px-5 py-3">Gestart</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-50">
            {(conversations ?? []).map((conv) => {
              const consumer = conv.consumer as unknown as { id: string; display_name: string | null } | null
              const merchant = conv.merchant as unknown as { id: string; business_name: string }
              const dish = conv.dish as unknown as { id: string; title: string } | null
              return (
                <tr key={conv.id} className="transition-colors hover:bg-warm-50">
                  <td className="px-5 py-3">
                    {consumer ? (
                      <Link href={`/users/${consumer.id}`} className="font-medium text-warm-800 hover:text-brand-600">
                        {consumer.display_name ?? 'Onbekend'}
                      </Link>
                    ) : (
                      <span className="text-warm-400">Onbekend</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/merchants/${merchant.id}`} className="text-warm-600 hover:text-brand-600">
                      {merchant.business_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    {dish ? (
                      <Link href={`/dishes/${dish.id}`} className="text-warm-600 hover:text-brand-600">
                        {dish.title}
                      </Link>
                    ) : (
                      <span className="text-warm-400">-</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-warm-600">{countMap.get(conv.id) ?? 0}</td>
                  <td className="px-5 py-3 text-warm-500">
                    {conv.last_message_at
                      ? formatRelativeDate(conv.last_message_at)
                      : latestMessageMap.get(conv.id)
                        ? formatRelativeDate(latestMessageMap.get(conv.id)!)
                        : '-'}
                  </td>
                  <td className="px-5 py-3 text-warm-500">{formatDateTime(conv.created_at)}</td>
                  <td className="px-5 py-3">
                    <Link href={`/messages/${conv.id}`} className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50">
                      Bekijken
                    </Link>
                  </td>
                </tr>
              )
            })}
            {(!conversations || conversations.length === 0) && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-warm-400">
                  Geen gesprekken
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/messages"
      />
    </>
  )
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const params = await searchParams
  const flatParams: Record<string, string | undefined> = {}
  for (const [key, val] of Object.entries(params)) {
    flatParams[key] = Array.isArray(val) ? val[0] : val
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">Berichten</h1>
        <p className="text-sm text-warm-500">Bekijk alle gesprekken op het platform</p>
      </div>

      <Suspense fallback={<div className="rounded-xl bg-white p-8 text-center text-warm-400 shadow-card">Laden...</div>}>
        <ConversationsTable searchParams={flatParams} />
      </Suspense>
    </div>
  )
}
