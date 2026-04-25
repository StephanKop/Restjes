import { resolve } from 'path'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  outputFileTracingRoot: resolve(__dirname, '../../'),
  transpilePackages: ['@kliekjesclub/ui', '@kliekjesclub/supabase', '@kliekjesclub/types', '@kliekjesclub/i18n'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async rewrites() {
    // Public merchant profiles live at /aanbieder/[slug-uuid] but are
    // implemented at [locale]/(consumer)/merchant/[id]/page.tsx so the
    // dashboard pages at /aanbieder/dashboard etc. can stay untouched.
    // After next-intl middleware rewrites incoming URLs to /[locale]/...,
    // these rewrites pivot the public-facing /aanbieder path to the
    // file-system /merchant path while preserving the locale segment.
    const slugUuid =
      '[a-z0-9-]*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
    return {
      beforeFiles: [],
      afterFiles: [
        // Locale-prefixed (post next-intl middleware): /nl/aanbieder/... and /en/aanbieder/...
        {
          source: `/:locale(nl|en)/aanbieder/:id(${slugUuid})`,
          destination: '/:locale/merchant/:id',
        },
        {
          source: `/:locale(nl|en)/aanbieder/:id(${slugUuid})/reviews`,
          destination: '/:locale/merchant/:id/reviews',
        },
        // Fallback: bare /aanbieder/... in case middleware ever skips the rewrite
        {
          source: `/aanbieder/:id(${slugUuid})`,
          destination: '/merchant/:id',
        },
        {
          source: `/aanbieder/:id(${slugUuid})/reviews`,
          destination: '/merchant/:id/reviews',
        },
      ],
      fallback: [],
    }
  },
  async redirects() {
    return [
      // Redirect old /dish/ URLs to /gerecht/
      {
        source: '/dish/:path*',
        destination: '/gerecht/:path*',
        permanent: true,
      },
      // Redirect old /merchant/ URLs to /aanbieder/
      {
        source: '/merchant/:path*',
        destination: '/aanbieder/:path*',
        permanent: true,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
