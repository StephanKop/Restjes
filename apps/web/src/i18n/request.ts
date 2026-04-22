import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import {
  defaultLocale,
  resolveLocale,
  type Locale,
  messagesNlCommon,
  messagesEnCommon,
  messagesNlFooter,
  messagesEnFooter,
  messagesNlProfile,
  messagesEnProfile,
  messagesNlNav,
  messagesEnNav,
  messagesNlHowItWorks,
  messagesEnHowItWorks,
  messagesNlReviews,
  messagesEnReviews,
  messagesNlAuth,
  messagesEnAuth,
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
  messagesNlMerchant,
  messagesEnMerchant,
  messagesNlAanbieder,
  messagesEnAanbieder,
  messagesNlImpact,
  messagesEnImpact,
} from '@kliekjesclub/i18n'

export const LOCALE_COOKIE = 'kc_locale'

// Centralised message registry. Adding a new namespace is a one-line change here.
const messagesByLocale: Record<Locale, Record<string, unknown>> = {
  nl: {
    common: messagesNlCommon,
    footer: messagesNlFooter,
    profile: messagesNlProfile,
    nav: messagesNlNav,
    howItWorks: messagesNlHowItWorks,
    reviews: messagesNlReviews,
    auth: messagesNlAuth,
    browse: messagesNlBrowse,
    dish: messagesNlDish,
    messages: messagesNlMessages,
    reservations: messagesNlReservations,
    dishForm: messagesNlDishForm,
    merchant: messagesNlMerchant,
    aanbieder: messagesNlAanbieder,
    impact: messagesNlImpact,
  },
  en: {
    common: messagesEnCommon,
    footer: messagesEnFooter,
    profile: messagesEnProfile,
    nav: messagesEnNav,
    howItWorks: messagesEnHowItWorks,
    reviews: messagesEnReviews,
    auth: messagesEnAuth,
    browse: messagesEnBrowse,
    dish: messagesEnDish,
    messages: messagesEnMessages,
    reservations: messagesEnReservations,
    dishForm: messagesEnDishForm,
    merchant: messagesEnMerchant,
    aanbieder: messagesEnAanbieder,
    impact: messagesEnImpact,
  },
}

async function detectLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value
  if (fromCookie) return resolveLocale(fromCookie)

  const headerStore = await headers()
  const acceptLanguage = headerStore.get('accept-language') ?? ''
  const preferred = acceptLanguage.split(',')[0]?.trim()
  return resolveLocale(preferred) ?? defaultLocale
}

export default getRequestConfig(async () => {
  const locale = await detectLocale()
  return {
    locale,
    messages: messagesByLocale[locale],
  }
})
