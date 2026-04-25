import { createNavigation } from 'next-intl/navigation'
import { redirect as nextRedirect, type RedirectType } from 'next/navigation'
import type { Locale } from '@kliekjesclub/i18n'
import { routing } from './routing'

// Locale-aware client navigation primitives. Use these instead of `next/link`
// and the client-side helpers from `next/navigation` so links and pushes
// respect the active locale automatically.
//
// On NL pages: <Link href="/about"> → /about
// On EN pages: <Link href="/about"> → /en/about
export const { Link, usePathname, useRouter, getPathname } = createNavigation(routing)

/**
 * Server-side redirect that prefixes the path with the given locale.
 * Stays synchronous (returns `never`) so TypeScript can narrow control flow
 * after a redirect — important when redirecting on missing auth/state and
 * then accessing the previously-nullable variable downstream.
 *
 * Usage:
 *   import { redirect } from '@/i18n/navigation'
 *   const { locale } = await params
 *   if (!user) redirect('/login', locale)
 */
export function redirect(href: string, locale: Locale | string, type?: RedirectType): never {
  // localePrefix: 'as-needed' — the default locale (NL) keeps URLs at root.
  const target = locale === routing.defaultLocale ? href : `/${locale}${href}`
  return nextRedirect(target, type)
}
