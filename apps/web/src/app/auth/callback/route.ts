import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/browse'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const cookieStore = await cookies()
  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          for (const { name, value, options } of cookiesToSet) {
            // Set on the cookie store (for subsequent server reads in this request)
            cookieStore.set(name, value, options)
            // Set on the response (so the browser receives the Set-Cookie headers)
            response.cookies.set(name, value, options as any)
          }
        },
      },
    },
  )

  const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

  console.log('[Auth Callback] exchangeCodeForSession result:', error ? `ERROR: ${error.message}` : `SUCCESS, user: ${sessionData?.user?.email}`)
  console.log('[Auth Callback] Setting cookies on response, redirect to:', `${origin}${next}`)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  // Sync avatar from OAuth provider if profile doesn't have one yet
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url ?? user.user_metadata?.picture
    if (avatarUrl) {
      await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)
        .is('avatar_url', null)
    }
  }

  return response
}
