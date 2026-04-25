import { ARTICLES, ARTICLE_CATEGORY_LABEL } from '@/content/articles'

const SITE = 'https://kliekjesclub.nl'

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export const dynamic = 'force-static'
export const revalidate = 3600

export function GET() {
  const lastBuildDate = ARTICLES.length > 0
    ? new Date(ARTICLES[0].updatedAt ?? ARTICLES[0].publishedAt).toUTCString()
    : new Date().toUTCString()

  const items = ARTICLES.map((article) => {
    const url = `${SITE}/kennisbank/${article.slug}`
    const pubDate = new Date(article.publishedAt).toUTCString()
    return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(article.description)}</description>
      <category>${escapeXml(ARTICLE_CATEGORY_LABEL[article.category])}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Kliekjesclub Kennisbank</title>
    <link>${SITE}/kennisbank</link>
    <atom:link href="${SITE}/kennisbank/feed.xml" rel="self" type="application/rss+xml" />
    <description>Artikelen over voedselverspilling, kliekjes en duurzaam eten.</description>
    <language>nl-NL</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>Next.js</generator>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
