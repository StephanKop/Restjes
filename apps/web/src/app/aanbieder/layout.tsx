import Link from 'next/link'
import { MainNav } from '@/components/MainNav'
import { Footer } from '@/components/Footer'

const subNavItems = [
  { href: '/aanbieder/dishes', label: 'Gerechten' },
  { href: '/aanbieder/reservations', label: 'Reserveringen' },
  { href: '/aanbieder/reviews', label: 'Beoordelingen' },
  { href: '/aanbieder/messages', label: 'Berichten' },
  { href: '/profile', label: 'Profiel' },
]

export default function AanbiederLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-offwhite">
      <MainNav />
      <div className="border-b border-warm-100 bg-white">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 py-2">
          {subNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold text-warm-600 transition-colors hover:bg-brand-50 hover:text-brand-600"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
      <Footer />
    </div>
  )
}
