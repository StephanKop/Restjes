import { resolve } from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  outputFileTracingRoot: resolve(__dirname, '../../'),
  transpilePackages: ['@kliekjesclub/ui', '@kliekjesclub/supabase', '@kliekjesclub/types'],
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
    return {
      // Checked before file-system routes — empty so dashboard routes resolve first
      beforeFiles: [],
      // Checked after file-system routes — catches /aanbieder/[uuid] that don't match dashboard pages
      afterFiles: [
        {
          source: '/aanbieder/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})',
          destination: '/merchant/:id',
        },
        {
          source: '/aanbieder/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/reviews',
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

export default nextConfig
