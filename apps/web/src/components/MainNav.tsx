import { Suspense } from 'react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { UserMenu } from '@/components/UserMenu'
import { NotificationBell } from '@/components/NotificationBell'
import { RealtimeUnreadBadge } from '@/components/RealtimeUnreadBadge'
import { MobileMenu } from '@/components/MobileMenu'
import { StickyHeader } from '@/components/StickyHeader'
import { MainNavLinks } from '@/components/MainNavLinks'

async function UnreadBadge() {
  const user = await getUser()
  if (!user) return null
  return <RealtimeUnreadBadge userId={user.id} />
}

async function Notifications() {
  const user = await getUser()
  if (!user) return null

  const supabase = await createServerComponentClient()
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle()

  return (
    <NotificationBell
      userId={user.id}
      merchantId={merchant?.id ?? null}
      initialCount={0}
      initialItems={[]}
    />
  )
}

/** Async: resolves the user-dependent parts (avatar, notifications, mobile menu) */
async function UserNav() {
  const user = await getUser()
  const t = await getTranslations('nav')

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="hidden rounded-xl px-5 py-2.5 font-bold text-inherit transition-colors hover:bg-white/20 group-data-[scrolled]/header:hover:bg-warm-100 sm:inline-flex"
        >
          {t('signIn')}
        </Link>
        <Link
          href="/signup"
          className="hidden rounded-xl bg-brand-500 px-5 py-2.5 font-bold text-white shadow-button transition-colors hover:bg-brand-600 sm:inline-flex"
        >
          {t('signUp')}
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
        href="/aanbieder/dishes/new"
        className="hidden items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-button transition-all duration-150 hover:bg-brand-600 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 sm:inline-flex"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
        {t('newDish')}
      </Link>
      <UserMenu initial={initial} />
      <MobileMenu isLoggedIn displayName={displayName} initial={initial} />
    </>
  )
}

export function MainNav({ transparent = false }: { transparent?: boolean }) {
  return (
    <StickyHeader transparent={transparent}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Kliekjesclub"
            width={200}
            height={200}
            className="h-14 w-auto"
            priority
          />
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4">
          <MainNavLinks unreadBadge={<UnreadBadge />} />
          {/* Notification bell — icon renders instantly, data streams in */}
          <Suspense fallback={
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full text-inherit opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </div>
          }>
            <Notifications />
          </Suspense>
          {/* Avatar + mobile menu — placeholder same size as avatar */}
          <Suspense fallback={<div className="h-9 w-9 animate-pulse rounded-full bg-warm-100" />}>
            <UserNav />
          </Suspense>
        </nav>
      </div>
    </StickyHeader>
  )
}
