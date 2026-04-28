import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import {
  getAllArticles,
  findArticle,
  relatedArticles,
  bodyForLocale,
  ARTICLE_CATEGORY_LABEL,
} from '@/lib/articles'
import type { Locale } from '@kliekjesclub/i18n'
import { ArticleBody } from '@/components/ArticleBody'
import { JsonLd } from '@/components/JsonLd'

interface ArticlePageProps {
  params: Promise<{ locale: Locale; slug: string }>
}

export async function generateStaticParams() {
  const all = await getAllArticles()
  return all.map((a) => ({ slug: a.slug }))
}

// Allow on-demand rendering for slugs created in the admin after the last
// build. The page itself calls `findArticle()` and falls through to
// `notFound()` when the slug really doesn't exist.
export const dynamicParams = true

// Re-render every hour as a safety net so admin edits propagate even if the
// explicit revalidate hook from the admin save is missed.
export const revalidate = 3600

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await findArticle(slug)
  if (!article) {
    return { title: 'Artikel niet gevonden - Kliekjesclub' }
  }
  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `/kennisbank/${article.slug}`,
      types: { 'application/rss+xml': '/kennisbank/feed.xml' },
    },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      url: `https://kliekjesclub.nl/kennisbank/${article.slug}`,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: [{ url: article.imageUrl ?? '/og-image.png', width: 1200, height: 630 }],
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug, locale } = await params
  const article = await findArticle(slug)
  if (!article) notFound()

  const related = await relatedArticles(article, 3)
  const body = bodyForLocale(article, locale)

  const breadcrumbJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Kliekjesclub', item: 'https://kliekjesclub.nl' },
      { '@type': 'ListItem', position: 2, name: 'Kennisbank', item: 'https://kliekjesclub.nl/kennisbank' },
      { '@type': 'ListItem', position: 3, name: article.title, item: `https://kliekjesclub.nl/kennisbank/${article.slug}` },
    ],
  }

  const ogImage = article.imageUrl
    ? article.imageUrl.startsWith('http')
      ? article.imageUrl
      : `https://kliekjesclub.nl${article.imageUrl}`
    : 'https://kliekjesclub.nl/og-image.png'

  const articleJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `https://kliekjesclub.nl/kennisbank/${article.slug}`,
    headline: article.title,
    description: article.description,
    url: `https://kliekjesclub.nl/kennisbank/${article.slug}`,
    inLanguage: locale === 'en' && article.bodyMdEn ? 'en' : 'nl-NL',
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    image: ogImage,
    author: {
      '@type': 'Organization',
      name: 'Kliekjesclub',
      url: 'https://kliekjesclub.nl',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kliekjesclub',
      url: 'https://kliekjesclub.nl',
      logo: {
        '@type': 'ImageObject',
        url: 'https://kliekjesclub.nl/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://kliekjesclub.nl/kennisbank/${article.slug}`,
    },
    articleSection: ARTICLE_CATEGORY_LABEL[article.category],
  }

  const dateFormatLocale = locale === 'en' ? 'en-GB' : 'nl-NL'
  const publishedDate = new Date(article.publishedAt).toLocaleDateString(dateFormatLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article className="mx-auto max-w-3xl">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={articleJsonLd} />

      <nav className="mb-4 flex items-center gap-2 text-sm text-warm-400" data-reveal>
        <Link href="/kennisbank" className="transition-colors hover:text-brand-600">
          Kennisbank
        </Link>
        <span>/</span>
        <span className="line-clamp-1 text-warm-600">{article.title}</span>
      </nav>

      {article.imageUrl && (
        <figure className="mb-8 overflow-hidden rounded-3xl bg-warm-100" data-reveal>
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={article.imageUrl}
              alt={article.imageAlt ?? article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              unoptimized={article.imageUrl.startsWith('http')}
            />
          </div>
          {article.imageCredit && (
            <figcaption className="px-4 py-2 text-xs text-warm-400">
              {article.imageCredit}
            </figcaption>
          )}
        </figure>
      )}

      <header className="mb-10" data-reveal>
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-600">
          {ARTICLE_CATEGORY_LABEL[article.category]}
        </p>
        <h1 className="mb-4 text-3xl font-extrabold leading-tight text-warm-900 sm:text-4xl md:text-5xl">
          {article.title}
        </h1>
        <p className="mb-6 text-lg text-warm-500">{article.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-warm-400">
          <span>{locale === 'en' ? 'Published on' : 'Gepubliceerd op'} {publishedDate}</span>
          <span>·</span>
          <span>{article.readingMinutes} min. {locale === 'en' ? 'read' : 'lezen'}</span>
        </div>
      </header>

      <div className="prose-style" data-reveal>
        <ArticleBody markdown={body} />
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-warm-100 pt-10" data-reveal>
          <h2 className="mb-6 text-2xl font-extrabold text-warm-900">
            {locale === 'en' ? 'More in the Kennisbank' : 'Meer in de Kennisbank'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3" data-reveal-stagger>
            {related.map((a) => (
              <Link
                key={a.slug}
                href={`/kennisbank/${a.slug}`}
                className="group rounded-2xl bg-white p-5 shadow-card transition-all duration-150 hover:shadow-card-hover"
              >
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-600">
                  {ARTICLE_CATEGORY_LABEL[a.category]}
                </p>
                <h3 className="mb-2 font-bold text-warm-900 group-hover:text-brand-700">
                  {a.title}
                </h3>
                <p className="line-clamp-2 text-sm text-warm-500">{a.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
