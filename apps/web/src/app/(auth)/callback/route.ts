import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  const redirectUrl = code ? `${origin}/browse` : `${origin}/login?error=auth`
  const response = NextResponse.redirect(redirectUrl)

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return Array.from(request.headers.get('cookie')?.split('; ') ?? []).map((c) => {
              const [name, ...rest] = c.split('=')
              return { name, value: rest.join('=') }
            })
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
    if (!error) return response
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
