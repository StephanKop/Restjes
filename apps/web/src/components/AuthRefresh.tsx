'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export function AuthRefresh() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthRefresh] Initial session:', session ? `logged in as ${session.user.email}` : 'no session')
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthRefresh] Auth state changed:', event, session ? `user: ${session.user.email}` : 'no session')
      // When the user signs in or out, refresh the server components
      // so the navigation re-renders with the correct auth state
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        console.log('[AuthRefresh] Calling router.refresh()')
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return null
}
