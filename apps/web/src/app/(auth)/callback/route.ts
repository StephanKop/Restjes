import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServerComponentClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createServerComponentClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      revalidatePath('/', 'layout')
      return NextResponse.redirect(`${origin}/browse`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
