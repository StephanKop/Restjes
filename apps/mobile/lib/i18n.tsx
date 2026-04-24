import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as Localization from 'expo-localization'
import * as SecureStore from 'expo-secure-store'
import { I18n, type TranslateOptions } from 'i18n-js'
import { supabase } from './supabase'
import {
  defaultLocale,
  locales,
  resolveLocale,
  type Locale,
  messagesNlCommon,
  messagesEnCommon,
  messagesNlProfile,
  messagesEnProfile,
  messagesNlAuth,
  messagesEnAuth,
  messagesNlNav,
  messagesEnNav,
  messagesNlBrowse,
  messagesEnBrowse,
  messagesNlDish,
  messagesEnDish,
  messagesNlMessages,
  messagesEnMessages,
  messagesNlReservations,
  messagesEnReservations,
  messagesNlDishForm,
  messagesEnDishForm,
  messagesNlReviews,
  messagesEnReviews,
  messagesNlImpact,
  messagesEnImpact,
  messagesNlMerchant,
  messagesEnMerchant,
  messagesNlAanbieder,
  messagesEnAanbieder,
} from '@kliekjesclub/i18n'

const LOCALE_STORAGE_KEY = 'kc_locale'

// Central message registry. Adding a namespace = add one line per locale.
const translations: Record<Locale, Record<string, unknown>> = {
  nl: {
    common: messagesNlCommon,
    profile: messagesNlProfile,
    auth: messagesNlAuth,
    nav: messagesNlNav,
    browse: messagesNlBrowse,
    dish: messagesNlDish,
    messages: messagesNlMessages,
    reservations: messagesNlReservations,
    dishForm: messagesNlDishForm,
    reviews: messagesNlReviews,
    impact: messagesNlImpact,
    merchant: messagesNlMerchant,
    aanbieder: messagesNlAanbieder,
  },
  en: {
    common: messagesEnCommon,
    profile: messagesEnProfile,
    auth: messagesEnAuth,
    nav: messagesEnNav,
    browse: messagesEnBrowse,
    dish: messagesEnDish,
    messages: messagesEnMessages,
    reservations: messagesEnReservations,
    dishForm: messagesEnDishForm,
    reviews: messagesEnReviews,
    impact: messagesEnImpact,
    merchant: messagesEnMerchant,
    aanbieder: messagesEnAanbieder,
  },
}

const i18n = new I18n(translations, {
  enableFallback: true,
  defaultLocale,
})

// Match ICU-style placeholders like `{count}` used by next-intl on web so the
// same message files work in both apps. i18n-js defaults to `%{name}` / `{{name}}`.
i18n.placeholder = /\{(\w+)\}/g

function detectInitialLocale(): Locale {
  const deviceLocale = Localization.getLocales()[0]?.languageCode ?? null
  return resolveLocale(deviceLocale)
}

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => Promise<void>
  t: (key: string, options?: TranslateOptions) => string
  availableLocales: readonly Locale[]
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const initial = detectInitialLocale()
    i18n.locale = initial
    return initial
  })

  useEffect(() => {
    let cancelled = false
    const bootstrap = async () => {
      // 1. Prefer the user's saved preference if they're signed in.
      try {
        const { data } = await supabase.auth.getUser()
        if (data?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('locale')
            .eq('id', data.user.id)
            .maybeSingle()
          const fromProfile = profile?.locale as string | undefined
          if (fromProfile && !cancelled) {
            const resolved = resolveLocale(fromProfile)
            if (resolved !== locale) {
              i18n.locale = resolved
              setLocaleState(resolved)
              await SecureStore.setItemAsync(LOCALE_STORAGE_KEY, resolved)
            }
            return
          }
        }
      } catch {
        // Fall through to SecureStore
      }

      // 2. Fallback: whatever was last saved locally.
      const stored = await SecureStore.getItemAsync(LOCALE_STORAGE_KEY)
      if (stored && !cancelled) {
        const resolved = resolveLocale(stored)
        if (resolved !== locale) {
          i18n.locale = resolved
          setLocaleState(resolved)
        }
      }
    }
    bootstrap()
    return () => {
      cancelled = true
    }
    // Runs once on mount; we intentionally don't depend on `locale` to avoid loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setLocale = useCallback(async (next: Locale) => {
    i18n.locale = next
    setLocaleState(next)
    await SecureStore.setItemAsync(LOCALE_STORAGE_KEY, next)

    // Persist to the authenticated user's profile so push notifications and
    // web sessions see the same preference. Non-fatal if it fails.
    try {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        await supabase.from('profiles').update({ locale: next }).eq('id', data.user.id)
      }
    } catch {
      // Offline or unauthenticated — SecureStore is the primary source on mobile.
    }
  }, [])

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale,
    t: (key, options) => i18n.t(key, options),
    availableLocales: locales,
  }), [locale, setLocale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within <LocaleProvider>')
  return ctx
}

export function useTranslation() {
  const { t, locale } = useLocale()
  return { t, locale }
}
