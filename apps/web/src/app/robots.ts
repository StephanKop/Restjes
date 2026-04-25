import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/aanbieder/dashboard',
          '/aanbieder/dashboard/',
          '/aanbieder/settings',
          '/aanbieder/settings/',
          '/aanbieder/messages',
          '/aanbieder/messages/',
          '/aanbieder/reservations',
          '/aanbieder/reservations/',
          '/aanbieder/profile',
          '/aanbieder/profile/',
          '/aanbieder/dishes',
          '/aanbieder/dishes/',
          '/aanbieder/reviews',
          '/aanbieder/reviews/',
          '/messages/',
          '/reservations/',
          '/profile/',
          '/auth/',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://kliekjesclub.nl/sitemap.xml',
  }
}
