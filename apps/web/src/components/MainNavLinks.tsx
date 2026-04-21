'use client'

import { Suspense, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function linkClass(active: boolean): string {
  // Inactive: inherit the nav's current color (white on hero, dark on scrolled).
  // Active: solid brand-500 pill with white text — stands out on both states.
  const base =
    'hidden rounded-lg px-3 py-1.5 font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 sm:inline-flex'
  if (active) {
    return `${base} bg-brand-500 text-white shadow-button hover:bg-brand-600`
  }
  return `${base} text-inherit hover:text-brand-300 group-data-[scrolled]/header:hover:text-brand-600 active:text-brand-700`
}

export function MainNavLinks({ unreadBadge }: { unreadBadge: ReactNode }) {
  const pathname = usePathname()
  return (
    <>
      <Link href="/browse" className={linkClass(isActive(pathname, '/browse'))}>
        Ontdekken
      </Link>
      <Link
        href="/aanbieder/dishes"
        className={linkClass(isActive(pathname, '/aanbieder'))}
      >
        Mijn aanbod
      </Link>
      <Link
        href="/reservations"
        className={linkClass(isActive(pathname, '/reservations'))}
      >
        Reserveringen
      </Link>
      <Link
        href="/messages"
        className={`relative ${linkClass(isActive(pathname, '/messages'))}`}
      >
        Berichten
        <Suspense>{unreadBadge}</Suspense>
      </Link>
    </>
  )
}
