'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface MobileMenuProps {
  isLoggedIn: boolean
  displayName?: string
  initial?: string
  unreadCount?: number
}

const NAV_ITEMS_LOGGED_IN = [
  { href: '/browse', label: 'Ontdekken' },
  { href: '/messages', label: 'Berichten' },
  { href: '/reservations', label: 'Reserveringen' },
  { href: '/aanbieder/dishes', label: 'Mijn aanbod' },
  { href: '/aanbieder/reservations', label: 'Reserveringen (aanbieder)' },
  { href: '/profile', label: 'Mijn profiel' },
]

export function MobileMenu({ isLoggedIn, displayName, initial, unreadCount }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close on navigation
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setOpen(false)
    window.location.href = '/'
  }

  return (
    <div className="sm:hidden">
      {/* Hamburger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-inherit transition-colors hover:bg-white/20 group-data-[scrolled]/header:hover:bg-warm-100"
        aria-label={open ? 'Menu sluiten' : 'Menu openen'}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Overlay + Drawer — portaled to body to escape header's backdrop-blur stacking context */}
      {open && createPortal(
        <>
          <div
            className="fixed inset-0 z-[100] bg-warm-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav className="fixed inset-y-0 right-0 z-[101] flex w-72 flex-col bg-white shadow-lg animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-warm-100 px-5 py-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {initial}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-warm-800">{displayName}</p>
                  </div>
                </div>
              ) : (
                <p className="font-bold text-warm-800">Menu</p>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-warm-400 hover:text-warm-600"
                aria-label="Menu sluiten"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              {isLoggedIn ? (
                <div className="space-y-1">
                  {NAV_ITEMS_LOGGED_IN.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                          isActive
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-warm-700 hover:bg-warm-50'
                        }`}
                      >
                        {item.label}
                        {item.href === '/messages' && unreadCount !== undefined && unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    href="/browse"
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-warm-700 hover:bg-warm-50"
                  >
                    Ontdekken
                  </Link>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-warm-100 px-3 py-4">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  Uitloggen
                </button>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="block rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-brand-600"
                  >
                    Inloggen
                  </Link>
                  <Link
                    href="/signup"
                    className="block rounded-xl border-2 border-brand-500 px-4 py-3 text-center text-sm font-bold text-brand-700 transition-colors hover:bg-brand-50"
                  >
                    Aanmelden
                  </Link>
                </div>
              )}
            </div>

            <style>{`
              .animate-slide-in {
                animation: slide-in 0.2s ease-out;
              }
              @keyframes slide-in {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>
          </nav>
        </>,
        document.body,
      )}
    </div>
  )
}
