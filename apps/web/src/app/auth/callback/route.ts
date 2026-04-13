import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/browse'

  if (code) {
    const supabase = await createServerComponentClient()
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

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth error — redirect to login with error indicator
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
