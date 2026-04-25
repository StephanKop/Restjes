import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ARTICLES,
  findArticle,
  relatedArticles,
  ARTICLE_CATEGORY_LABEL,
} from '@/content/articles'
import { JsonLd } from '@/components/JsonLd'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

// Curated, finite list — unknown slugs 404.
export const dynamicParams = false

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = findArticle(slug)
  if (!article) {
    return { title: 'Artikel niet gevonden - Kliekjesclub' }
  }
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/kennisbank/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      url: `https://kliekjesclub.nl/kennisbank/${article.slug}`,
      publishedTime: article.publishedAt,
      ...(article.updatedAt ? { modifiedTime: article.updatedAt } : {}),
      images: [{ url: article.image ?? '/og-image.png', width: 1200, height: 630 }],
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = findArticle(slug)
  if (!article) notFound()

  const related = relatedArticles(article, 3)

  const breadcrumbJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Kliekjesclub', item: 'https://kliekjesclub.nl' },
      { '@type': 'ListItem', position: 2, name: 'Kennisbank', item: 'https://kliekjesclub.nl/kennisbank' },
      { '@type': 'ListItem', position: 3, name: article.title, item: `https://kliekjesclub.nl/kennisbank/${article.slug}` },
    ],
  }

  const articleJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `https://kliekjesclub.nl/kennisbank/${article.slug}`,
    headline: article.title,
    description: article.description,
    url: `https://kliekjesclub.nl/kennisbank/${article.slug}`,
    inLanguage: 'nl-NL',
    datePublished: article.publishedAt,
    ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
    image: `https://kliekjesclub.nl${article.image ?? '/og-image.png'}`,
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

  const Body = article.Body
  const publishedDate = new Date(article.publishedAt).toLocaleDateString('nl-NL', {
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

      <header className="mb-10" data-reveal>
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-600">
          {ARTICLE_CATEGORY_LABEL[article.category]}
        </p>
        <h1 className="mb-4 text-3xl font-extrabold leading-tight text-warm-900 sm:text-4xl md:text-5xl">
          {article.title}
        </h1>
        <p className="mb-6 text-lg text-warm-500">{article.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-warm-400">
          <span>Gepubliceerd op {publishedDate}</span>
          <span>·</span>
          <span>{article.readingMinutes} min. lezen</span>
        </div>
      </header>

      <div className="prose-style" data-reveal>
        <Body />
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-warm-100 pt-10" data-reveal>
          <h2 className="mb-6 text-2xl font-extrabold text-warm-900">Meer in de Kennisbank</h2>
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
