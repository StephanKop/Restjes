import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'
import {
  defaultLocale,
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
  messagesNlStaticPages,
  messagesEnStaticPages,
} from '@kliekjesclub/i18n'

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
    staticPages: messagesNlStaticPages,
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
    staticPages: messagesEnStaticPages,
  },
}

export default getRequestConfig(async ({ requestLocale }) => {
  // The middleware sets [locale] in the URL; pages provide it via params.
  const requested = await requestLocale
  const locale: Locale = hasLocale(routing.locales, requested)
    ? (requested as Locale)
    : defaultLocale
  return {
    locale,
    messages: messagesByLocale[locale],
  }
})
