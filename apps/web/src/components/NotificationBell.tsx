'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { formatRelativeDate } from '@/lib/format'

interface Notification {
  id: string
  type: 'message' | 'reservation' | 'review'
  title: string
  body: string
  href: string
  time: string
  read: boolean
}

interface NotificationBellProps {
  userId: string
  merchantId?: string | null
  initialCount: number
  initialItems: Notification[]
}

export function NotificationBell({ userId, merchantId, initialCount, initialItems }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [items, setItems] = useState(initialItems)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const ref = useRef<HTMLDivElement>(null)
  const knownIds = useRef<Set<string>>(new Set())
  const initialized = useRef(false)

  const supabase = useMemo(
    () => createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ),
    [],
  )

  // Check browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) return
    const result = await window.Notification.requestPermission()
    setPermission(result)
  }

  const showBrowserNotification = useCallback((item: Notification) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    // Don't show if the tab is focused and the bell is open
    if (document.hasFocus() && open) return

    const n = new window.Notification(item.title, {
      body: item.body,
      icon: '/favicon.png',
      tag: item.id,
    })
    n.onclick = () => {
      window.focus()
      window.location.href = item.href
      n.close()
    }
  }, [open])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Fetch notifications from the database
  const fetchNotifications = useCallback(async () => {
    const notifications: Notification[] = []

    // 1. Unread messages (latest per conversation)
    const [{ data: consumerConvs }, { data: merchant }] = await Promise.all([
      supabase
        .from('conversations')
        .select('id, merchant:merchants!inner(business_name)')
        .eq('consumer_id', userId),
      supabase.from('merchants').select('id').eq('profile_id', userId).maybeSingle(),
    ])

    const convMap = new Map<string, { name: string; basePath: string }>()
    for (const c of consumerConvs ?? []) {
      const m = c.merchant as unknown as { business_name: string }
      convMap.set(c.id, { name: m.business_name, basePath: '/messages' })
    }

    if (merchant) {
      const { data: merchantConvs } = await supabase
        .from('conversations')
        .select('id, consumer:profiles!conversations_consumer_id_fkey(display_name)')
        .eq('merchant_id', merchant.id)
      for (const c of merchantConvs ?? []) {
        const consumer = c.consumer as unknown as { display_name: string | null }
        convMap.set(c.id, {
          name: consumer?.display_name ?? 'Klant',
          basePath: '/aanbieder/messages',
        })
      }
    }

    if (convMap.size > 0) {
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('id, conversation_id, content, created_at')
        .in('conversation_id', Array.from(convMap.keys()))
        .eq('is_read', false)
        .neq('sender_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      const seenConvs = new Set<string>()
      for (const msg of unreadMessages ?? []) {
        if (seenConvs.has(msg.conversation_id)) continue
        seenConvs.add(msg.conversation_id)
        const conv = convMap.get(msg.conversation_id)
        if (!conv) continue
        notifications.push({
          id: `msg-${msg.id}`,
          type: 'message',
          title: `Nieuw bericht van ${conv.name}`,
          body: msg.content,
          href: `${conv.basePath}/${msg.conversation_id}`,
          time: msg.created_at,
          read: false,
        })
      }
    }

    // 2. Recent reservation updates (last 7 days)
    const { data: recentReservations } = await supabase
      .from('reservations')
      .select('id, status, updated_at, dish:dishes!inner(title)')
      .eq('consumer_id', userId)
      .in('status', ['confirmed', 'cancelled', 'collected'])
      .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('updated_at', { ascending: false })
      .limit(5)

    const statusLabels: Record<string, string> = {
      confirmed: 'bevestigd',
      cancelled: 'geannuleerd',
      collected: 'opgehaald',
    }

    for (const res of recentReservations ?? []) {
      const dish = res.dish as unknown as { title: string }
      notifications.push({
        id: `res-${res.id}`,
        type: 'reservation',
        title: `Reservering ${statusLabels[res.status] ?? res.status}`,
        body: dish.title,
        href: '/reservations',
        time: res.updated_at,
        read: true,
      })
    }

    // 3. New reservations for merchants
    if (merchant) {
      const { data: merchantReservations } = await supabase
        .from('reservations')
        .select('id, status, quantity, created_at, consumer:profiles!reservations_consumer_id_fkey(display_name), dish:dishes!inner(title)')
        .eq('merchant_id', merchant.id)
        .in('status', ['pending', 'confirmed'])
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10)

      for (const res of merchantReservations ?? []) {
        const consumer = res.consumer as unknown as { display_name: string | null }
        const dish = res.dish as unknown as { title: string }
        const consumerName = consumer?.display_name ?? 'Iemand'
        const isPending = res.status === 'pending'
        notifications.push({
          id: `mres-${res.id}`,
          type: 'reservation',
          title: isPending ? 'Nieuwe reservering' : 'Reservering bevestigd',
          body: `${consumerName} — ${res.quantity}x ${dish.title}`,
          href: '/aanbieder/reservations',
          time: res.created_at,
          read: !isPending,
        })
      }
    }

    // Sort by time
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    const top = notifications.slice(0, 10)

    // Show browser notifications for new unread items (skip the initial fetch)
    if (initialized.current) {
      for (const item of top) {
        if (!item.read && !knownIds.current.has(item.id)) {
          showBrowserNotification(item)
        }
      }
    }

    // Update known IDs
    knownIds.current = new Set(top.map((n) => n.id))
    initialized.current = true

    setItems(top)
    setCount(top.filter((n) => !n.read).length)
  }, [userId, supabase, showBrowserNotification])

  // Subscribe to realtime events and re-fetch
  useEffect(() => {
    fetchNotifications()

    const channel = supabase
      .channel('nav-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => fetchNotifications(),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        () => fetchNotifications(),
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reservations' },
        () => fetchNotifications(),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'reservations' },
        () => fetchNotifications(),
      )

    if (merchantId) {
      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reviews' },
        () => fetchNotifications(),
      )
    }

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, merchantId, supabase, fetchNotifications])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o)
          if (!open) setCount(0)
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-inherit transition-all duration-150 hover:bg-warm-100 hover:text-warm-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
        aria-label="Meldingen"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="fixed inset-x-3 top-14 z-50 mx-auto max-w-sm overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-warm-100 sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-80">
          <div className="border-b border-warm-100 px-4 py-3">
            <h3 className="text-sm font-bold text-warm-800">Meldingen</h3>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-warm-400">
              Geen meldingen
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block border-b border-warm-50 px-4 py-3 transition-colors hover:bg-warm-50 active:bg-warm-100 focus-visible:outline-none focus-visible:bg-warm-50 ${
                    !item.read ? 'bg-brand-50/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                      item.type === 'message'
                        ? 'bg-blue-100 text-blue-600'
                        : item.type === 'reservation'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {item.type === 'message' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0 1 10 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.202 41.202 0 0 1-5.183.501l-2.9 2.9a.75.75 0 0 1-1.28-.53v-2.42a41.087 41.087 0 0 1-1.777-.288C4.993 13.245 4 11.986 4 10.574V5.426c0-1.413.993-2.67 2.43-2.902Z" clipRule="evenodd" />
                        </svg>
                      ) : item.type === 'reservation' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path fillRule="evenodd" d="M15.988 3.012A2.25 2.25 0 0 1 18 5.25v6.5A2.25 2.25 0 0 1 15.75 14H13.5V7A2.5 2.5 0 0 0 11 4.5H8.128a2.252 2.252 0 0 1 1.884-1.488A2.25 2.25 0 0 1 12.25 1h1.5a2.25 2.25 0 0 1 2.238 2.012ZM11.5 3.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v.25h-3v-.25Z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M2 7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7Zm2 3.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm0 3.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-warm-800">{item.title}</p>
                      <p className="truncate text-xs text-warm-500">{item.body}</p>
                      <p className="mt-1 text-[11px] text-warm-400">{formatRelativeDate(item.time)}</p>
                    </div>
                    {!item.read && (
                      <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Browser notification permission prompt */}
          {permission === 'default' && (
            <div className="border-t border-warm-100 px-4 py-3">
              <button
                type="button"
                onClick={requestPermission}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6ZM8.05 14.943a33.54 33.54 0 0 0 3.9 0 2 2 0 0 1-3.9 0Z" clipRule="evenodd" />
                </svg>
                Browsermeldingen inschakelen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
