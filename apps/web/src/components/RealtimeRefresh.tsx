'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface RealtimeRefreshProps {
  /** Table to subscribe to */
  table: string
  /** Optional filter, e.g. "consumer_id=eq.abc123" */
  filter?: string
  /** Events to listen for */
  events?: ('INSERT' | 'UPDATE' | 'DELETE')[]
}

/**
 * Invisible component that subscribes to Supabase Realtime changes
 * and calls router.refresh() to re-render the server component tree.
 */
export function RealtimeRefresh({ table, filter, events = ['INSERT', 'UPDATE'] }: RealtimeRefreshProps) {
  const router = useRouter()

  const supabase = useMemo(
    () => createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ),
    [],
  )

  useEffect(() => {
    const channel = supabase.channel(`realtime-refresh-${table}-${filter ?? 'all'}`)

    for (const event of events) {
      channel.on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        () => router.refresh(),
      )
    }

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, events, supabase, router])

  return null
}
