import { defineRouting } from 'next-intl/routing'
import { locales, defaultLocale } from '@kliekjesclub/i18n'

export const routing = defineRouting({
  locales: locales as readonly string[] as string[],
  defaultLocale,
  // 'as-needed' keeps NL URLs at the root (no prefix) and prefixes English with /en.
  // Existing /restjes/amsterdam keeps working unchanged; the English variant is /en/restjes/amsterdam.
  localePrefix: 'as-needed',
  // We don't need pathname-level localization (e.g. /restjes vs /leftovers) for now.
  // The structure stays the same in both languages — the URL just gets an /en prefix.
})
