export const locales = ['nl', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'nl'

export const localeMeta: Record<Locale, { name: string; flag: string; htmlLang: string }> = {
  nl: { name: 'Nederlands', flag: '🇳🇱', htmlLang: 'nl-NL' },
  en: { name: 'English', flag: '🇬🇧', htmlLang: 'en-US' },
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value)
}

export function resolveLocale(input: string | null | undefined): Locale {
  if (!input) return defaultLocale
  const base = input.toLowerCase().split(/[-_]/)[0]
  return isLocale(base) ? base : defaultLocale
}
