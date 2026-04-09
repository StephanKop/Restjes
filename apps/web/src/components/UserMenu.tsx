'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

interface UserMenuProps {
  initial: string
}

export function UserMenu({ initial }: UserMenuProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="group relative">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 transition-colors hover:bg-brand-200"
        aria-label="Gebruikersmenu"
      >
        {initial}
      </button>

      {/* Dropdown */}
      <div className="invisible absolute right-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
        <div className="w-44 overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-warm-100">
          <Link
            href="/profile"
            className="block px-4 py-2.5 text-sm font-medium text-warm-700 transition-colors hover:bg-warm-50 hover:text-warm-900"
          >
            Bekijk profiel
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full px-4 py-2.5 text-left text-sm font-medium text-warm-700 transition-colors hover:bg-warm-50 hover:text-warm-900"
          >
            Uitloggen
          </button>
        </div>
      </div>
    </div>
  )
}
