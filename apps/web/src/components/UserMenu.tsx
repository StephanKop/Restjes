'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

interface UserMenuProps {
  initial: string
}

export function UserMenu({ initial }: UserMenuProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 transition-all duration-150 hover:bg-brand-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
        aria-label="Gebruikersmenu"
        aria-expanded={open}
      >
        {initial}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full pt-2">
          <div className="w-44 overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-warm-100">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-warm-700 transition-colors hover:bg-warm-50 hover:text-warm-900 active:bg-warm-100 focus-visible:outline-none focus-visible:bg-warm-50 focus-visible:text-warm-900"
            >
              Bekijk profiel
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full px-4 py-2.5 text-left text-sm font-medium text-warm-700 transition-colors hover:bg-warm-50 hover:text-warm-900 active:bg-warm-100 focus-visible:outline-none focus-visible:bg-warm-50 focus-visible:text-warm-900"
            >
              Uitloggen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
