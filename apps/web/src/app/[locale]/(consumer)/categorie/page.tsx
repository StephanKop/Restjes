import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import {
  CATEGORIES,
  CATEGORY_TYPE_LABEL,
  categoriesByType,
  type CategoryType,
} from '@/data/categories'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Categorieën — restjes per dieet, allergeen en gerecht',
  description:
    'Vind kliekjes en restjes per categorie: vegetarisch, vegan, glutenvrij, lactosevrij, ontbijt, lunch, avondeten, pasta, pizza, soep en meer.',
  alternates: { canonical: '/categorie' },
  openGraph: {
    type: 'website',
    title: 'Categorieën — Kliekjesclub',
    description:
      'Bekijk restjes per categorie: dieet, allergeenvrij, maaltijdtype en specifieke gerechten.',
    url: 'https://kliekjesclub.nl/categorie',
  },
}

const TYPE_ORDER: CategoryType[] = ['diet', 'meal', 'dish', 'freeFrom']

export default function CategoryIndexPage() {
  const groups = categoriesByType()

  const breadcrumbJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Kliekjesclub', item: 'https://kliekjesclub.nl' },
      { '@type': 'ListItem', position: 2, name: 'Categorieën', item: 'https://kliekjesclub.nl/categorie' },
    ],
  }

  const collectionJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://kliekjesclub.nl/categorie',
    url: 'https://kliekjesclub.nl/categorie',
    name: 'Categorieën — Kliekjesclub',
    description: `Overzicht van ${CATEGORIES.length} manieren om restjes te ontdekken: per dieet, allergeen, maaltijdtype en gerecht.`,
    inLanguage: 'nl-NL',
    isPartOf: { '@type': 'WebSite', '@id': 'https://kliekjesclub.nl', name: 'Kliekjesclub' },
  }

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />

      <nav className="mb-4 flex items-center gap-2 text-sm text-warm-400" data-reveal>
        <Link href="/" className="transition-colors hover:text-brand-600">
          Kliekjesclub
        </Link>
        <span>/</span>
        <span className="text-warm-600">Categorieën</span>
      </nav>

      <header className="mb-10" data-reveal>
        <h1 className="mb-3 text-4xl font-extrabold text-warm-900 sm:text-5xl">
          Categorieën
        </h1>
        <p className="max-w-3xl text-lg text-warm-500">
          Of je nu vegetarisch eet, een allergie hebt of gewoon zin hebt in pizza —
          hier vind je restjes per dieet, allergeen, maaltijdtype of specifiek gerecht.
        </p>
      </header>

      <div className="space-y-12">
        {TYPE_ORDER.map((type) => {
          const items = groups[type]
          if (items.length === 0) return null
          return (
            <section key={type} data-reveal>
              <h2 className="mb-4 text-2xl font-extrabold text-warm-900">
                {CATEGORY_TYPE_LABEL[type].nl}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
                {items.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/categorie/${c.slug}`}
                    className="group rounded-xl bg-white p-4 shadow-card transition-all duration-150 hover:shadow-card-hover"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-warm-900 group-hover:text-brand-700">
                        {c.name}
                      </span>
                      <span className="text-brand-600">→</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-warm-500">{c.description}</p>
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
