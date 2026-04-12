import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/aanbieder/', '/messages/', '/reservations/'],
      },
    ],
    sitemap: 'https://kliekjesclub.nl/sitemap.xml',
  }
}
