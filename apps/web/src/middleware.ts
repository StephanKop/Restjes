import createMiddleware from 'next-intl/middleware'
import { type NextRequest } from 'next/server'
import { updateSession } from '@kliekjesclub/supabase'
import { routing } from './i18n/routing'

const handleI18n = createMiddleware(routing)

export default async function middleware(request: NextRequest) {
  // 1. Locale routing first — may produce a redirect (e.g. unsupported
  // locale) or a rewrite to /[locale]/path internally.
  const i18nResponse = handleI18n(request)

  // 2. Refresh Supabase session. Returns its own NextResponse with any
  // refreshed cookies; we merge those cookies onto the i18n response so
  // both the locale routing AND the auth cookies survive.
  const authResponse = await updateSession(request)
  authResponse.cookies.getAll().forEach((cookie) => {
    i18nResponse.cookies.set(cookie)
  })

  return i18nResponse
}

export const config = {
  // Run on every path EXCEPT:
  // - /api/*           — route handlers
  // - /auth/*          — Supabase OAuth callback paths
  // - /_next/*         — Next internals
  // - /_vercel/*       — Vercel platform paths
  // - any URL with a dot — static files (sitemap.xml, robots.txt, feed.xml, .png, ...)
  matcher: ['/((?!api|auth|_next|_vercel|.*\\..*).*)'],
}
