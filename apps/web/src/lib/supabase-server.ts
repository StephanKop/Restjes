import { cache } from 'react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerComponentClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // This will throw in Server Components — that's expected.
          }
        },
      },
    },
  )
}

/**
 * Cached per-request: deduplicates auth calls across layout, nav, and page
 * components that all need the current user within the same render.
 */
export const getUser = cache(async () => {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})
