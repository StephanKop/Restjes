import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/browse'

  const redirectUrl = code ? `${origin}${next}` : `${origin}/login?error=auth`
  const response = NextResponse.redirect(redirectUrl)

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [...new URL(request.url).searchParams].length
              ? Array.from(request.headers.get('cookie')?.split('; ') ?? []).map((c) => {
                  const [name, ...rest] = c.split('=')
                  return { name, value: rest.join('=') }
                })
              : []
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            for (const { name, value, options } of cookiesToSet) {
              response.cookies.set(name, value, options as any)
            }
          },
        },
      },
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
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
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
