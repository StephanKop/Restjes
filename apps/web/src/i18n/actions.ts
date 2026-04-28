'use server'

import { cookies } from 'next/headers'
import { isLocale } from '@kliekjesclub/i18n'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'

const LOCALE_COOKIE = 'kc_locale'
const ONE_YEAR = 60 * 60 * 24 * 365

export async function setLocaleAction(locale: string) {
  if (!isLocale(locale)) return

  // Write the locale cookie ourselves so it is updated BEFORE the client
  // triggers `router.replace(..., { locale })`. If we left this to the
  // next-intl middleware, the middleware would see the stale cookie value
  // (e.g. `en`) when the user navigates from `/en/about` to `/about` (NL)
  // and — because `localeDetection: true` is the default — would redirect
  // `/about` back to `/en/about`, making the switcher appear to do nothing.
  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: ONE_YEAR,
    sameSite: 'lax',
  })

  // Mirror to the user's profile so mobile sessions and push notifications
  // see the same preference.
  try {
    const user = await getUser()
    if (!user) return
    const supabase = await createServerComponentClient()
    await supabase
      .from('profiles')
      .update({ locale })
      .eq('id', user.id)
  } catch {
    // Non-fatal — the cookie + URL are the primary source for web.
  }
}
