import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { DUTCH_CITIES, findCity, nearestCities } from '@/data/dutch-cities'
import { getCachedCityDishes, getCachedCityMerchants } from '@/lib/cached-queries'
import { DishCard, type DishCardData } from '@/components/DishCard'
import { JsonLd } from '@/components/JsonLd'
import { dishPath, merchantPath } from '@/lib/slug'
import { StorefrontIcon, CheckBadgeIcon, DishIcon } from '@/components/icons'

interface CityPageProps {
  params: Promise<{ city: string }>
}

export async function generateStaticParams() {
  // Pre-render the curated city list at build time. Other valid cities
  // (any place with a verified merchant) are served on demand and cached.
  return DUTCH_CITIES.map((c) => ({ city: c.slug }))
}

// Allow on-demand rendering for cities not in generateStaticParams.
export const dynamicParams = true

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city: slug } = await params
  const city = findCity(slug)
  if (!city) {
    return { title: 'Stad niet gevonden - Kliekjesclub' }
  }
  const title = `Restjes ophalen in ${city.name} — gratis eten redden`
  const description = `Vind kliekjes en restjes bij jou in de buurt in ${city.name}. Gratis eten ophalen van lokale aanbieders en samen voedselverspilling tegengaan.`
  return {
    title,
    description,
    alternates: { canonical: `/restjes/${city.slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `https://kliekjesclub.nl/restjes/${city.slug}`,
    },
  }
}

export default async function CityPage({ params }: CityPageProps) {
  const { city: slug } = await params
  const city = findCity(slug)
  if (!city) {
    notFound()
  }

  // Canonical-slug enforcement: alias and display-name URLs (e.g. /restjes/Den%20Haag)
  // 308 to the kebab slug.
  if (slug !== city.slug) {
    redirect(`/restjes/${city.slug}`)
  }

  const [dishes, merchants] = await Promise.all([
    getCachedCityDishes(city.name),
    getCachedCityMerchants(city.name),
  ])

  const dishCards: DishCardData[] = dishes.map((dish) => {
    const merchant = dish.merchant as unknown as {
      business_name: string
      city: string
      latitude: number | null
      longitude: number | null
    }
    return {
      id: dish.id,
      title: dish.title,
      description: dish.description,
      image_url: dish.image_url,
      quantity_available: dish.quantity_available,
      pickup_start: dish.pickup_start,
      pickup_end: dish.pickup_end,
      bring_own_container: dish.bring_own_container,
      is_vegetarian: dish.is_vegetarian,
      is_vegan: dish.is_vegan,
      merchant: {
        business_name: merchant.business_name,
        city: merchant.city,
        latitude: merchant.latitude,
        longitude: merchant.longitude,
      },
      allergen_count: (dish.dish_allergies as { allergen: string }[]).length,
    }
  })

  const nearby = nearestCities(city, 6)
  const hasContent = dishCards.length > 0 || merchants.length > 0

  const breadcrumbJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Kliekjesclub', item: 'https://kliekjesclub.nl' },
      { '@type': 'ListItem', position: 2, name: 'Restjes door heel Nederland', item: 'https://kliekjesclub.nl/restjes' },
      { '@type': 'ListItem', position: 3, name: city.name, item: `https://kliekjesclub.nl/restjes/${city.slug}` },
    ],
  }

  const collectionJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `https://kliekjesclub.nl/restjes/${city.slug}`,
    url: `https://kliekjesclub.nl/restjes/${city.slug}`,
    name: `Restjes in ${city.name}`,
    description: `Beschikbare kliekjes en gerechten in ${city.name} en omgeving.`,
    inLanguage: 'nl-NL',
    isPartOf: { '@type': 'WebSite', '@id': 'https://kliekjesclub.nl', name: 'Kliekjesclub' },
    about: {
      '@type': 'Place',
      name: city.name,
      address: { '@type': 'PostalAddress', addressLocality: city.name, addressRegion: city.province, addressCountry: 'NL' },
      geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lng },
    },
    ...(dishCards.length > 0
      ? {
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: dishCards.length,
            itemListElement: dishCards.slice(0, 20).map((dish, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `https://kliekjesclub.nl${dishPath({ id: dish.id, title: dish.title })}`,
              name: dish.title,
            })),
          },
        }
      : {}),
  }

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />

      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-warm-400" data-reveal>
        <Link href="/restjes" className="transition-colors hover:text-brand-600">
          Restjes door heel Nederland
        </Link>
        <span>/</span>
        <span className="text-warm-600">{city.name}</span>
      </nav>

      {/* Hero */}
      <header className="mb-10" data-reveal>
        <h1 className="mb-3 text-4xl font-extrabold text-warm-900 sm:text-5xl">
          Restjes ophalen in {city.name}
        </h1>
        <p className="max-w-2xl text-lg text-warm-500">
          {hasContent
            ? `Vind gratis kliekjes en gerechten van lokale aanbieders in ${city.name} en help mee tegen voedselverspilling.`
            : `Nog geen aanbieders in ${city.name}? Wees de eerste — deel je restjes en help mee tegen voedselverspilling.`}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/browse?city=${encodeURIComponent(city.name)}`}
            className="inline-flex items-center rounded-xl bg-brand-500 px-5 py-3 font-bold text-white shadow-button transition-colors hover:bg-brand-600"
          >
            Alle gerechten bekijken
          </Link>
          <Link
            href="/aanbieder/dishes/new"
            className="inline-flex items-center rounded-xl border border-warm-200 bg-white px-5 py-3 font-bold text-warm-800 transition-colors hover:border-warm-300"
          >
            Zelf restjes aanbieden
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-warm-500">
          {dishCards.length > 0 && (
            <span>
              <strong className="text-warm-800">{dishCards.length}</strong>{' '}
              {dishCards.length === 1 ? 'gerecht beschikbaar' : 'gerechten beschikbaar'}
            </span>
          )}
          {merchants.length > 0 && (
            <span>
              <strong className="text-warm-800">{merchants.length}</strong>{' '}
              {merchants.length === 1 ? 'actieve aanbieder' : 'actieve aanbieders'}
            </span>
          )}
          <span>
            Provincie <strong className="text-warm-800">{city.province}</strong>
          </span>
        </div>
      </header>

      {/* Available dishes */}
      {dishCards.length > 0 && (
        <section className="mb-14" data-reveal>
          <h2 className="mb-6 text-2xl font-extrabold text-warm-900">
            Beschikbare gerechten in {city.name}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
            {dishCards.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
          {dishCards.length >= 60 && (
            <div className="mt-6 text-center">
              <Link
                href={`/browse?city=${encodeURIComponent(city.name)}`}
                className="inline-flex items-center rounded-xl bg-white px-5 py-3 font-bold text-brand-600 shadow-card transition-colors hover:bg-brand-50"
              >
                Bekijk meer gerechten in {city.name} →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Active merchants in this city */}
      {merchants.length > 0 && (
        <section className="mb-14" data-reveal>
          <h2 className="mb-6 text-2xl font-extrabold text-warm-900">
            Aanbieders in {city.name}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
            {merchants.map((m) => (
              <Link
                key={m.id}
                href={merchantPath({ id: m.id, business_name: m.business_name })}
                className="group flex items-start gap-4 rounded-2xl bg-white p-4 shadow-card transition-all duration-150 hover:shadow-card-hover active:scale-[0.99]"
              >
                {m.logo_url ? (
                  <Image
                    src={m.logo_url}
                    alt={m.business_name}
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-100">
                    <StorefrontIcon className="h-6 w-6 text-brand-600" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="truncate font-bold text-warm-900 group-hover:text-brand-700">
                      {m.business_name}
                    </span>
                    {m.is_verified && <CheckBadgeIcon className="h-4 w-4 shrink-0 text-brand-500" />}
                  </div>
                  {m.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-warm-500">{m.description}</p>
                  )}
                  {m.avg_rating !== null && m.review_count > 0 && (
                    <div className="mt-1 text-sm text-warm-500">
                      <span className="text-yellow-500">★</span>{' '}
                      <span className="font-semibold text-warm-700">{m.avg_rating.toFixed(1)}</span>{' '}
                      <span className="text-warm-400">({m.review_count})</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!hasContent && (
        <section className="mb-14 rounded-2xl bg-white p-10 text-center shadow-card">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-warm-100 text-warm-400">
            <DishIcon className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-warm-900">
            Nog geen aanbieders in {city.name}
          </h2>
          <p className="mx-auto mb-6 max-w-md text-warm-500">
            Zodra de eerste mensen in {city.name} hun restjes delen, vind je ze hier.
            Bekijk in de tussentijd het aanbod door heel Nederland of word zelf aanbieder.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/browse" className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-white shadow-button hover:bg-brand-600">
              Alle restjes bekijken
            </Link>
            <Link href="/aanbieder/dishes/new" className="rounded-xl border border-warm-200 bg-white px-5 py-3 font-bold text-warm-800 hover:border-warm-300">
              Zelf restjes aanbieden
            </Link>
          </div>
        </section>
      )}

      {/* Educational / supporting content — gives the page real text for crawlers */}
      <section className="mb-14 grid gap-6 lg:grid-cols-2" data-reveal>
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="mb-3 text-xl font-bold text-warm-900">
            Waarom restjes delen in {city.name}?
          </h2>
          <p className="leading-relaxed text-warm-600">
            In Nederland gooien we elk jaar miljoenen kilo&apos;s eten weg dat nog prima is.
            Door je kliekjes te delen met buren in {city.name} bespaar je geld, voorkom je
            verspilling en help je iemand in je buurt aan een gratis maaltijd. Ieder gerecht
            telt — vooral lokaal.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="mb-3 text-xl font-bold text-warm-900">Hoe werkt het?</h2>
          <ol className="space-y-2 text-warm-600">
            <li>
              <strong className="text-warm-800">1.</strong> Bekijk wat er nu in {city.name} wordt aangeboden.
            </li>
            <li>
              <strong className="text-warm-800">2.</strong> Reserveer een gerecht en spreek af hoe je het ophaalt.
            </li>
            <li>
              <strong className="text-warm-800">3.</strong> Geniet van je maaltijd — gratis en verspillingsvrij.
            </li>
          </ol>
        </div>
      </section>

      {/* Nearby cities — internal linking */}
      {nearby.length > 0 && (
        <section className="mb-14" data-reveal>
          <h2 className="mb-6 text-2xl font-extrabold text-warm-900">
            Restjes in steden in de buurt
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
            {nearby.map((c) => (
              <Link
                key={c.slug}
                href={`/restjes/${c.slug}`}
                className="group flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-card transition-all duration-150 hover:shadow-card-hover"
              >
                <div>
                  <span className="font-bold text-warm-900 group-hover:text-brand-700">
                    Restjes in {c.name}
                  </span>
                  <p className="text-xs text-warm-400">{c.province}</p>
                </div>
                <span className="text-brand-600">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
