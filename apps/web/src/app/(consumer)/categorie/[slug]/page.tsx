import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { CATEGORIES, findCategory, relatedCategories } from '@/data/categories'
import { getCachedCategoryDishes } from '@/lib/cached-queries'
import { DishCard, type DishCardData } from '@/components/DishCard'
import { JsonLd } from '@/components/JsonLd'
import { dishPath } from '@/lib/slug'
import { DishIcon } from '@/components/icons'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }))
}

// Static at build, but unknown slugs 404 (we don't allow arbitrary categories
// — unlike cities, the category list is curated and finite).
export const dynamicParams = false

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = findCategory(slug)
  if (!category) {
    return { title: 'Categorie niet gevonden - Kliekjesclub' }
  }
  return {
    title: `${category.name} — gratis ophalen bij jou in de buurt`,
    description: category.description,
    alternates: { canonical: `/categorie/${category.slug}` },
    openGraph: {
      type: 'website',
      title: `${category.name} | Kliekjesclub`,
      description: category.description,
      url: `https://kliekjesclub.nl/categorie/${category.slug}`,
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = findCategory(slug)
  if (!category) notFound()

  // Canonical-slug enforcement.
  if (slug !== category.slug) {
    redirect(`/categorie/${category.slug}`)
  }

  const dishes = await getCachedCategoryDishes(category.slug, category.filter)

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

  const related = relatedCategories(category, 3)

  const breadcrumbJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Kliekjesclub', item: 'https://kliekjesclub.nl' },
      { '@type': 'ListItem', position: 2, name: 'Categorieën', item: 'https://kliekjesclub.nl/categorie' },
      { '@type': 'ListItem', position: 3, name: category.name, item: `https://kliekjesclub.nl/categorie/${category.slug}` },
    ],
  }

  const collectionJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `https://kliekjesclub.nl/categorie/${category.slug}`,
    url: `https://kliekjesclub.nl/categorie/${category.slug}`,
    name: category.name,
    description: category.description,
    inLanguage: 'nl-NL',
    isPartOf: { '@type': 'WebSite', '@id': 'https://kliekjesclub.nl', name: 'Kliekjesclub' },
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

      <nav className="mb-4 flex items-center gap-2 text-sm text-warm-400" data-reveal>
        <Link href="/categorie" className="transition-colors hover:text-brand-600">
          Categorieën
        </Link>
        <span>/</span>
        <span className="text-warm-600">{category.name}</span>
      </nav>

      <header className="mb-10" data-reveal>
        <h1 className="mb-3 text-4xl font-extrabold text-warm-900 sm:text-5xl">{category.name}</h1>
        <p className="max-w-2xl text-lg text-warm-500">{category.intro}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/browse"
            className="inline-flex items-center rounded-xl bg-brand-500 px-5 py-3 font-bold text-white shadow-button transition-colors hover:bg-brand-600"
          >
            Alle restjes bekijken
          </Link>
          <Link
            href="/aanbieder/dishes/new"
            className="inline-flex items-center rounded-xl border border-warm-200 bg-white px-5 py-3 font-bold text-warm-800 transition-colors hover:border-warm-300"
          >
            Zelf restjes aanbieden
          </Link>
        </div>
        {dishCards.length > 0 && (
          <p className="mt-4 text-sm text-warm-500">
            <strong className="text-warm-800">{dishCards.length}</strong>{' '}
            {dishCards.length === 1 ? 'gerecht beschikbaar' : 'gerechten beschikbaar'}
          </p>
        )}
      </header>

      {dishCards.length > 0 ? (
        <section className="mb-14" data-reveal>
          <h2 className="mb-6 text-2xl font-extrabold text-warm-900">
            Beschikbaar in deze categorie
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
            {dishCards.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </section>
      ) : (
        <section className="mb-14 rounded-2xl bg-white p-10 text-center shadow-card" data-reveal>
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-warm-100 text-warm-400">
            <DishIcon className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-warm-900">
            Op dit moment geen aanbod in {category.name.toLowerCase()}
          </h2>
          <p className="mx-auto mb-6 max-w-md text-warm-500">
            Kom later terug of bekijk wat er nu wel beschikbaar is. Aanbod verandert
            elke dag — en jij kunt zelf bijdragen door je eigen restjes te delen.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/browse" className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-white shadow-button hover:bg-brand-600">
              Alles bekijken
            </Link>
            <Link href="/aanbieder/dishes/new" className="rounded-xl border border-warm-200 bg-white px-5 py-3 font-bold text-warm-800 hover:border-warm-300">
              Zelf aanbieden
            </Link>
          </div>
        </section>
      )}

      {/* Related categories — internal linking */}
      {related.length > 0 && (
        <section className="mb-10" data-reveal>
          <h2 className="mb-6 text-2xl font-extrabold text-warm-900">Ook interessant</h2>
          <div className="grid gap-3 sm:grid-cols-3" data-reveal-stagger>
            {related.map((c) => (
              <Link
                key={c.slug}
                href={`/categorie/${c.slug}`}
                className="group flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-card transition-all duration-150 hover:shadow-card-hover"
              >
                <span className="font-bold text-warm-900 group-hover:text-brand-700">{c.name}</span>
                <span className="text-brand-600">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
