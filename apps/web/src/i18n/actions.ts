'use server'

import { revalidatePath } from 'next/cache'
import { isLocale } from '@kliekjesclub/i18n'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'

export async function setLocaleAction(locale: string) {
  if (!isLocale(locale)) return

  // The locale cookie is owned by the next-intl middleware (configured in
  // ./routing.ts). It is set on the response when the user navigates to the
  // new locale prefix, which the LanguageSwitcher does right after this
  // action returns. Here we only mirror the choice to the user's profile so
  // mobile sessions and push notifications see the same preference.
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
    // Non-fatal — the cookie + URL are the primary source for web.
  }

  revalidatePath('/', 'layout')
}
