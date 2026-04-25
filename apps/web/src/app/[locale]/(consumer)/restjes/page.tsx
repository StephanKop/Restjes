import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import {
  DUTCH_CITIES,
  DUTCH_PROVINCES,
  citiesByProvince,
  findCity,
} from '@/data/dutch-cities'
import { getCachedCitiesWithContent } from '@/lib/cached-queries'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Restjes door heel Nederland — vind eten in jouw stad',
  description:
    'Vind kliekjes en restjes in jouw stad of dorp. Kliekjesclub helpt mensen in heel Nederland eten redden en voedselverspilling tegengaan — van Amsterdam tot Maastricht.',
  alternates: { canonical: '/restjes' },
  openGraph: {
    type: 'website',
    title: 'Restjes door heel Nederland',
    description:
      'Vind kliekjes en restjes bij jou in de buurt. Per stad een overzicht van beschikbare gerechten en aanbieders.',
    url: 'https://kliekjesclub.nl/restjes',
  },
}

export default async function RestjesIndexPage() {
  const groups = citiesByProvince()

  // Mark which cities currently have verified merchants so we can highlight
  // them. We render *all* curated cities regardless — empty ones are fine
  // here because this is a hub/index page (Google indexes hubs, not their
  // empty leaves), and the list itself is real content.
  const dbCities = await getCachedCitiesWithContent()
  const dbCitySlugs = new Set<string>()
  for (const raw of dbCities) {
    const c = findCity(raw)
    if (c) dbCitySlugs.add(c.slug)
  }

  const totalCitiesWithContent = dbCitySlugs.size
  const totalCuratedCities = DUTCH_CITIES.length

  const breadcrumbJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Kliekjesclub', item: 'https://kliekjesclub.nl' },
      { '@type': 'ListItem', position: 2, name: 'Restjes door heel Nederland', item: 'https://kliekjesclub.nl/restjes' },
    ],
  }

  const collectionJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://kliekjesclub.nl/restjes',
    url: 'https://kliekjesclub.nl/restjes',
    name: 'Restjes door heel Nederland',
    description: `Overzicht van ${totalCuratedCities} steden en dorpen in Nederland waar je restjes kunt delen of ophalen.`,
    inLanguage: 'nl-NL',
    isPartOf: { '@type': 'WebSite', '@id': 'https://kliekjesclub.nl', name: 'Kliekjesclub' },
  }

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />

      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-warm-400" data-reveal>
        <Link href="/" className="transition-colors hover:text-brand-600">
          Kliekjesclub
        </Link>
        <span>/</span>
        <span className="text-warm-600">Restjes door heel Nederland</span>
      </nav>

      <header className="mb-10" data-reveal>
        <h1 className="mb-3 text-4xl font-extrabold text-warm-900 sm:text-5xl">
          Restjes door heel Nederland
        </h1>
        <p className="max-w-3xl text-lg text-warm-500">
          Van Amsterdam tot Maastricht: vind kliekjes en restjes in jouw stad of dorp.
          Kliekjesclub verbindt mensen die eten over hebben met mensen die er blij mee
          zijn — samen tegen voedselverspilling.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-warm-500">
          <span>
            <strong className="text-warm-800">{totalCuratedCities}</strong> steden &amp; dorpen
          </span>
          {totalCitiesWithContent > 0 && (
            <span>
              <strong className="text-warm-800">{totalCitiesWithContent}</strong>{' '}
              {totalCitiesWithContent === 1 ? 'stad heeft' : 'steden hebben'} actieve aanbieders
            </span>
          )}
        </div>
      </header>

      {/* Grouped by province for browsability + crawlability */}
      <div className="space-y-12">
        {DUTCH_PROVINCES.map((province) => {
          const cities = groups[province]
          if (cities.length === 0) return null
          return (
            <section key={province} data-reveal>
              <h2 className="mb-4 text-2xl font-extrabold text-warm-900">{province}</h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
                {cities.map((c) => {
                  const hasContent = dbCitySlugs.has(c.slug)
                  return (
                    <Link
                      key={c.slug}
                      href={`/restjes/${c.slug}`}
                      className="group flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-card transition-all duration-150 hover:shadow-card-hover"
                    >
                      <span className="font-semibold text-warm-800 group-hover:text-brand-700">
                        Restjes in {c.name}
                      </span>
                      {hasContent && (
                        <span className="ml-2 inline-flex h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-label="Heeft actieve aanbieders" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
