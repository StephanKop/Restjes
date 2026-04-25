'use client'

import { Suspense, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function linkClass(active: boolean): string {
  // Inactive: inherit the nav's current color (white on hero, dark on scrolled).
  // Active: brand-500 text color — no pill, just highlights which page you're on.
  const base =
    'hidden rounded-lg px-2 py-1 font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 sm:inline-flex'
  if (active) {
    return `${base} text-brand-500`
  }
  return `${base} text-inherit hover:text-brand-300 group-data-[scrolled]/header:hover:text-brand-600 active:text-brand-700`
}

export function MainNavLinks({ unreadBadge }: { unreadBadge: ReactNode }) {
  const pathname = usePathname() ?? ''
  const t = useTranslations('nav')
  return (
    <>
      <Link href="/browse" className={linkClass(isActive(pathname, '/browse'))}>
        {t('discover')}
      </Link>
      <Link
        href="/aanbieder/dishes"
        className={linkClass(isActive(pathname, '/aanbieder'))}
      >
        {t('myOffer')}
      </Link>
      <Link
        href="/reservations"
        className={linkClass(isActive(pathname, '/reservations'))}
      >
        {t('reservations')}
      </Link>
      <Link
        href="/messages"
        className={`relative ${linkClass(isActive(pathname, '/messages'))}`}
      >
        {t('messages')}
        <Suspense>{unreadBadge}</Suspense>
      </Link>
    </>
  )
}
