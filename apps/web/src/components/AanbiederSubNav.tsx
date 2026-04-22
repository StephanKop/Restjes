'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AanbiederSubNav() {
  const pathname = usePathname()
  const t = useTranslations('nav.aanbiederSub')
  const items = [
    { href: '/aanbieder/dishes', label: t('dishes') },
    { href: '/aanbieder/reservations', label: t('reservations') },
    { href: '/aanbieder/reviews', label: t('reviews') },
    { href: '/aanbieder/messages', label: t('messages') },
    { href: '/aanbieder/profile', label: t('profile') },
  ]
  return (
    <div className="border-b border-warm-100 bg-white">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 py-2">
        {items.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'text-brand-500'
                  : 'text-warm-600 hover:bg-brand-50 hover:text-brand-600'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
