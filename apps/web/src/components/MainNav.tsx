import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { UserMenu } from '@/components/UserMenu'
import { NotificationBell } from '@/components/NotificationBell'
import { MobileMenu } from '@/components/MobileMenu'

async function UnreadBadge() {
  const user = await getUser()
  if (!user) return null

  const supabase = await createServerComponentClient()

  // Count unread messages across both consumer and merchant conversations
  const [{ data: consumerConvs }, { data: merchant }] = await Promise.all([
    supabase.from('conversations').select('id').eq('consumer_id', user.id),
    supabase.from('merchants').select('id').eq('profile_id', user.id).maybeSingle(),
  ])

  const allConvIds: string[] = (consumerConvs ?? []).map((c) => c.id)

  if (merchant) {
    const { data: merchantConvs } = await supabase
      .from('conversations')
      .select('id')
      .eq('merchant_id', merchant.id)
    if (merchantConvs) {
      for (const c of merchantConvs) allConvIds.push(c.id)
    }
  }

  if (allConvIds.length === 0) return null

  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .in('conversation_id', allConvIds)
    .eq('is_read', false)
    .neq('sender_id', user.id)

  if (!count || count === 0) return null

  return (
    <span className="absolute -right-4 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">
      {count}
    </span>
  )
}

async function Notifications() {
  const user = await getUser()
  if (!user) return null

  const supabase = await createServerComponentClient()

  type NotificationItem = {
    id: string
    type: 'message' | 'reservation' | 'review'
    title: string
    body: string
    href: string
    time: string
    read: boolean
  }

  const notifications: NotificationItem[] = []

  // 1. Unread messages (latest per conversation)
  const [{ data: consumerConvs }, { data: merchant }] = await Promise.all([
    supabase
      .from('conversations')
      .select('id, merchant:merchants!inner(business_name)')
      .eq('consumer_id', user.id),
    supabase.from('merchants').select('id').eq('profile_id', user.id).maybeSingle(),
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
      .neq('sender_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Dedupe: one notification per conversation (most recent)
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

  // 2. Recent reservation updates (last 7 days, status changes)
  const { data: recentReservations } = await supabase
    .from('reservations')
    .select('id, status, updated_at, dish:dishes!inner(title)')
    .eq('consumer_id', user.id)
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
      read: true, // reservation updates are considered "read" (no unread tracking)
    })
  }

  // Sort all notifications by time
  notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  const topNotifications = notifications.slice(0, 10)

  const unreadCount = topNotifications.filter((n) => !n.read).length

  return (
    <NotificationBell
      userId={user.id}
      initialCount={unreadCount}
      initialItems={topNotifications}
    />
  )
}

async function AuthNav() {
  const user = await getUser()

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="hidden rounded-xl px-5 py-2.5 font-bold text-warm-700 transition-colors hover:bg-warm-100 sm:inline-flex"
        >
          Inloggen
        </Link>
        <Link
          href="/signup"
          className="hidden rounded-xl bg-brand-500 px-5 py-2.5 font-bold text-white shadow-button transition-colors hover:bg-brand-600 sm:inline-flex"
        >
          Aanmelden
        </Link>
        <MobileMenu isLoggedIn={false} />
      </>
    )
  }

  const supabase = await createServerComponentClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name || user.email || '?'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <>
      <Link
        href="/aanbieder/dishes"
        className="hidden font-semibold text-warm-600 transition-colors hover:text-brand-600 sm:inline-flex"
      >
        Mijn aanbod
      </Link>
      <Link
        href="/reservations"
        className="hidden font-semibold text-warm-600 transition-colors hover:text-brand-600 sm:inline-flex"
      >
        Reserveringen
      </Link>
      <Link
        href="/messages"
        className="relative hidden font-semibold text-warm-600 transition-colors hover:text-brand-600 sm:inline-flex"
      >
        Berichten
        <Suspense>
          <UnreadBadge />
        </Suspense>
      </Link>
      <Suspense>
        <Notifications />
      </Suspense>
      <UserMenu initial={initial} />
      <MobileMenu isLoggedIn displayName={displayName} initial={initial} />
    </>
  )
}

export function MainNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-warm-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Restjes"
            width={130}
            height={43}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/browse"
            className="hidden font-semibold text-warm-600 transition-colors hover:text-brand-600 sm:inline-flex"
          >
            Ontdekken
          </Link>
          <Suspense>
            <AuthNav />
          </Suspense>
        </nav>
      </div>
    </header>
  )
}
