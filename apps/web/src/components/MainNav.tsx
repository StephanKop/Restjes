import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { UserMenu } from '@/components/UserMenu'

async function UnreadBadge() {
  const user = await getUser()

  if (!user) return null

  const supabase = await createServerComponentClient()
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id')
    .eq('consumer_id', user.id)

  if (!conversations || conversations.length === 0) return null

  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .in('conversation_id', conversations.map((c) => c.id))
    .eq('is_read', false)
    .neq('sender_id', user.id)

  if (!count || count === 0) return null

  return (
    <span className="absolute -right-4 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">
      {count}
    </span>
  )
}

async function AuthNav() {
  const user = await getUser()

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="rounded-xl bg-brand-500 px-5 py-2.5 font-bold text-white shadow-button transition-colors hover:bg-brand-600 sm:bg-transparent sm:text-warm-700 sm:shadow-none sm:hover:bg-warm-100 sm:hover:text-warm-700"
        >
          Inloggen
        </Link>
        <Link
          href="/signup"
          className="hidden rounded-xl bg-brand-500 px-5 py-2.5 font-bold text-white shadow-button transition-colors hover:bg-brand-600 sm:inline-flex"
        >
          Aanmelden
        </Link>
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
        className="font-semibold text-warm-600 transition-colors hover:text-brand-600"
      >
        Mijn aanbod
      </Link>
      <Link
        href="/reservations"
        className="font-semibold text-warm-600 transition-colors hover:text-brand-600"
      >
        Reserveringen
      </Link>
      <Link
        href="/messages"
        className="relative font-semibold text-warm-600 transition-colors hover:text-brand-600"
      >
        Berichten
        <Suspense>
          <UnreadBadge />
        </Suspense>
      </Link>
      <UserMenu initial={initial} />
    </>
  )
}

export function MainNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-warm-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
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
        <nav className="flex items-center gap-6">
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
