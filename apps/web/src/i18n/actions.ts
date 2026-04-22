'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { isLocale } from '@kliekjesclub/i18n'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { LOCALE_COOKIE } from './request'

export async function setLocaleAction(locale: string) {
  if (!isLocale(locale)) return
  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  // Persist to the authenticated user's profile so push notifications and
  // mobile sessions see the same preference.
  try {
    const user = await getUser()
    if (user) {
      const supabase = await createServerComponentClient()
      await supabase
        .from('profiles')
        .update({ locale })
        .eq('id', user.id)
    }
  } catch {
    // Non-fatal — cookie is the primary source for web.
  }

  revalidatePath('/', 'layout')
}
