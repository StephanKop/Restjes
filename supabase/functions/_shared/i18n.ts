// Push-notification copy catalogs. Kept inline here (not importing from
// @kliekjesclub/i18n) because edge functions run in Deno and the workspace
// package isn't reachable from this directory at deploy time.
//
// When you add keys here, mirror them in packages/i18n/messages so the
// in-app copy stays aligned.

type PushLocale = 'nl' | 'en'

interface Catalog {
  reservation: {
    newTitle: string
    newBodySingular: (consumerName: string, dishTitle: string) => string
    newBodyPlural: (consumerName: string, count: number, dishTitle: string) => string
    confirmedTitle: string
    confirmedBody: (dishTitle: string, merchantName: string) => string
    cancelledTitle: string
    cancelledByConsumerBody: (consumerName: string, dishTitle: string) => string
    cancelledByMerchantBody: (dishTitle: string, merchantName: string) => string
    collectedTitle: string
    collectedBody: (dishTitle: string) => string
    noShowTitle: string
    noShowBody: (dishTitle: string, merchantName: string) => string
  }
  review: {
    newTitle: string
    newBody: (consumerName: string, rating: number, dishInfo: string) => string
    replyTitle: string
    replyBody: (merchantName: string) => string
    dishSuffix: (dishTitle: string) => string
  }
  fallbacks: {
    dish: string
    merchant: string
    someone: string
  }
}

const CATALOGS: Record<PushLocale, Catalog> = {
  nl: {
    reservation: {
      newTitle: 'Nieuwe reservering',
      newBodySingular: (name, dish) => `${name} heeft 1 portie van "${dish}" gereserveerd`,
      newBodyPlural: (name, count, dish) => `${name} heeft ${count} porties van "${dish}" gereserveerd`,
      confirmedTitle: 'Reservering bevestigd',
      confirmedBody: (dish, merchant) => `Je reservering van "${dish}" bij ${merchant} is bevestigd`,
      cancelledTitle: 'Reservering geannuleerd',
      cancelledByConsumerBody: (name, dish) => `${name} heeft de reservering van "${dish}" geannuleerd`,
      cancelledByMerchantBody: (dish, merchant) => `Je reservering van "${dish}" bij ${merchant} is helaas geannuleerd`,
      collectedTitle: 'Opgehaald!',
      collectedBody: (dish) => `Je reservering van "${dish}" is als opgehaald gemarkeerd. Smakelijk!`,
      noShowTitle: 'Niet opgehaald',
      noShowBody: (dish, merchant) => `Je reservering van "${dish}" bij ${merchant} is gemarkeerd als niet opgehaald`,
    },
    review: {
      newTitle: 'Nieuwe beoordeling',
      newBody: (name, rating, dishInfo) => `${name} gaf ${rating} ster${rating !== 1 ? 'ren' : ''}${dishInfo}`,
      replyTitle: 'Reactie op je beoordeling',
      replyBody: (merchant) => `${merchant} heeft gereageerd op je beoordeling`,
      dishSuffix: (dish) => ` voor "${dish}"`,
    },
    fallbacks: {
      dish: 'een gerecht',
      merchant: 'de aanbieder',
      someone: 'Iemand',
    },
  },
  en: {
    reservation: {
      newTitle: 'New reservation',
      newBodySingular: (name, dish) => `${name} reserved 1 portion of "${dish}"`,
      newBodyPlural: (name, count, dish) => `${name} reserved ${count} portions of "${dish}"`,
      confirmedTitle: 'Reservation confirmed',
      confirmedBody: (dish, merchant) => `Your reservation of "${dish}" at ${merchant} has been confirmed`,
      cancelledTitle: 'Reservation cancelled',
      cancelledByConsumerBody: (name, dish) => `${name} cancelled the reservation for "${dish}"`,
      cancelledByMerchantBody: (dish, merchant) => `Your reservation of "${dish}" at ${merchant} has unfortunately been cancelled`,
      collectedTitle: 'Picked up!',
      collectedBody: (dish) => `Your reservation of "${dish}" has been marked as picked up. Enjoy!`,
      noShowTitle: 'Not picked up',
      noShowBody: (dish, merchant) => `Your reservation of "${dish}" at ${merchant} has been marked as not picked up`,
    },
    review: {
      newTitle: 'New review',
      newBody: (name, rating, dishInfo) => `${name} gave ${rating} star${rating !== 1 ? 's' : ''}${dishInfo}`,
      replyTitle: 'Reply to your review',
      replyBody: (merchant) => `${merchant} replied to your review`,
      dishSuffix: (dish) => ` for "${dish}"`,
    },
    fallbacks: {
      dish: 'a dish',
      merchant: 'the merchant',
      someone: 'Someone',
    },
  },
}

export function pushCopy(locale: string | null | undefined): Catalog {
  return locale === 'en' ? CATALOGS.en : CATALOGS.nl
}

/**
 * Fetch the locale preference for a given profile. Returns 'nl' if unset or
 * unknown so callers can treat the return as a safe string.
 */
export async function getProfileLocale(
  supabase: ReturnType<typeof import('https://esm.sh/@supabase/supabase-js@2').createClient>,
  profileId: string,
): Promise<PushLocale> {
  const { data } = await supabase
    .from('profiles')
    .select('locale')
    .eq('id', profileId)
    .maybeSingle()
  const raw = (data as { locale?: string } | null)?.locale
  return raw === 'en' ? 'en' : 'nl'
}
