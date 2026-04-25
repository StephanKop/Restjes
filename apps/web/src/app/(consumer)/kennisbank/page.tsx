import type { Metadata } from 'next'
import Link from 'next/link'
import { ARTICLES, ARTICLE_CATEGORY_LABEL } from '@/content/articles'
import type { ArticleCategory } from '@/content/articles'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Kennisbank — alles over voedselverspilling, restjes en duurzaam eten',
  description:
    'Praktische tips, recepten en achtergrondartikelen over voedselverspilling, kliekjes en duurzaam eten. Schreven door het team van Kliekjesclub.',
  alternates: { canonical: '/kennisbank' },
  openGraph: {
    type: 'website',
    title: 'Kennisbank — Kliekjesclub',
    description:
      'Praktische tips, recepten en achtergrondartikelen over voedselverspilling, kliekjes en duurzaam eten.',
    url: 'https://kliekjesclub.nl/kennisbank',
  },
}

const CATEGORY_ORDER: ArticleCategory[] = ['voedselverspilling', 'praktisch', 'recepten', 'duurzaamheid']

export default function KennisbankIndexPage() {
  const grouped: Record<ArticleCategory, typeof ARTICLES> = {
    voedselverspilling: [],
    praktisch: [],
    recepten: [],
    duurzaamheid: [],
  }
  for (const a of ARTICLES) grouped[a.category].push(a)

  const breadcrumbJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Kliekjesclub', item: 'https://kliekjesclub.nl' },
      { '@type': 'ListItem', position: 2, name: 'Kennisbank', item: 'https://kliekjesclub.nl/kennisbank' },
    ],
  }

  const blogJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': 'https://kliekjesclub.nl/kennisbank',
    url: 'https://kliekjesclub.nl/kennisbank',
    name: 'Kliekjesclub Kennisbank',
    description:
      'Artikelen over voedselverspilling, praktische tips voor kliekjes, recepten en duurzaam eten.',
    inLanguage: 'nl-NL',
    publisher: {
      '@type': 'Organization',
      name: 'Kliekjesclub',
      url: 'https://kliekjesclub.nl',
      logo: 'https://kliekjesclub.nl/logo.png',
    },
    blogPost: ARTICLES.map((a) => ({
      '@type': 'BlogPosting',
      headline: a.title,
      url: `https://kliekjesclub.nl/kennisbank/${a.slug}`,
      datePublished: a.publishedAt,
      ...(a.updatedAt ? { dateModified: a.updatedAt } : {}),
      description: a.description,
    })),
  }

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={blogJsonLd} />

      <nav className="mb-4 flex items-center gap-2 text-sm text-warm-400" data-reveal>
        <Link href="/" className="transition-colors hover:text-brand-600">
          Kliekjesclub
        </Link>
        <span>/</span>
        <span className="text-warm-600">Kennisbank</span>
      </nav>

      <header className="mb-10" data-reveal>
        <h1 className="mb-3 text-4xl font-extrabold text-warm-900 sm:text-5xl">Kennisbank</h1>
        <p className="max-w-3xl text-lg text-warm-500">
          Alles over voedselverspilling, restjes en duurzaam eten. Praktische gidsen, achtergrondartikelen
          en recepten — van het Kliekjesclub-team.
        </p>
      </header>

      <div className="space-y-12">
        {CATEGORY_ORDER.map((cat) => {
          const items = grouped[cat]
          if (items.length === 0) return null
          return (
            <section key={cat} data-reveal>
              <h2 className="mb-4 text-2xl font-extrabold text-warm-900">
                {ARTICLE_CATEGORY_LABEL[cat]}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
                {items.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/kennisbank/${a.slug}`}
                    className="group rounded-2xl bg-white p-5 shadow-card transition-all duration-150 hover:shadow-card-hover"
                  >
                    <h3 className="mb-2 text-lg font-extrabold text-warm-900 group-hover:text-brand-700">
                      {a.title}
                    </h3>
                    <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-warm-500">
                      {a.description}
                    </p>
                    <p className="text-xs text-warm-400">
                      {a.readingMinutes} min. lezen
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
