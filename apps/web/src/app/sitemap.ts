import type { MetadataRoute } from 'next'
import { createServerComponentClient } from '@/lib/supabase-server'
import { dishPath, merchantPath } from '@/lib/slug'
import { DUTCH_CITIES, findCity } from '@/data/dutch-cities'
import { CATEGORIES } from '@/data/categories'
import { getAllArticles } from '@/lib/articles'

const BASE_URL = 'https://kliekjesclub.nl'

/** URL with bilingual alternates for hreflang. NL stays as canonical. */
function bilingual(path: string) {
  return {
    languages: {
      'nl-NL': `${BASE_URL}${path}`,
      'en-US': `${BASE_URL}/en${path === '/' ? '' : path}`,
      'x-default': `${BASE_URL}${path}`,
    },
  }
}

/** URL with NL-only signal — for content that doesn't have an English variant
 * (Dutch-only kennisbank articles, user-typed dish/merchant data). */
function nlOnly(path: string) {
  return {
    languages: {
      'nl-NL': `${BASE_URL}${path}`,
      'x-default': `${BASE_URL}${path}`,
    },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerComponentClient()

  const { data: dishes } = await supabase
    .from('dishes')
    .select('id, title, updated_at')
    .eq('status', 'available')
    .gt('quantity_available', 0)

  const { data: merchants } = await supabase
    .from('merchants')
    .select('id, business_name, city, updated_at')
    .eq('is_verified', true)

  const now = new Date()

  // Static pages — bilingual chrome, both NL/EN URLs available.
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0, alternates: bilingual('/') },
    { url: `${BASE_URL}/browse`, lastModified: now, changeFrequency: 'hourly', priority: 0.9, alternates: bilingual('/browse') },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6, alternates: bilingual('/about') },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6, alternates: bilingual('/faq') },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.4, alternates: bilingual('/privacy') },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.4, alternates: bilingual('/terms') },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5, alternates: bilingual('/contact') },
    { url: `${BASE_URL}/restjes`, lastModified: now, changeFrequency: 'daily', priority: 0.85, alternates: bilingual('/restjes') },
    { url: `${BASE_URL}/categorie`, lastModified: now, changeFrequency: 'daily', priority: 0.85, alternates: bilingual('/categorie') },
    { url: `${BASE_URL}/kennisbank`, lastModified: now, changeFrequency: 'weekly', priority: 0.8, alternates: nlOnly('/kennisbank') },
  ]

  // Dish/merchant URLs — user-entered Dutch content. NL-only.
  const dishPages: MetadataRoute.Sitemap = (dishes ?? []).map((dish) => ({
    url: `${BASE_URL}${dishPath({ id: dish.id, title: dish.title })}`,
    lastModified: dish.updated_at ? new Date(dish.updated_at) : now,
    changeFrequency: 'hourly' as const,
    priority: 0.8,
    alternates: nlOnly(dishPath({ id: dish.id, title: dish.title })),
  }))

  const merchantPages: MetadataRoute.Sitemap = (merchants ?? []).map((merchant) => ({
    url: `${BASE_URL}${merchantPath({ id: merchant.id, business_name: merchant.business_name })}`,
    lastModified: merchant.updated_at ? new Date(merchant.updated_at) : now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
    alternates: nlOnly(merchantPath({ id: merchant.id, business_name: merchant.business_name })),
  }))

  // City pages — both locales (chrome translates, city names are universal).
  const citiesWithMerchants = new Set<string>()
  for (const m of merchants ?? []) {
    const c = findCity(m.city)
    if (c) citiesWithMerchants.add(c.slug)
  }
  const cityPages: MetadataRoute.Sitemap = DUTCH_CITIES.map((city) => ({
    url: `${BASE_URL}/restjes/${city.slug}`,
    lastModified: now,
    changeFrequency: citiesWithMerchants.has(city.slug) ? ('daily' as const) : ('weekly' as const),
    priority: citiesWithMerchants.has(city.slug) ? 0.75 : 0.4,
    alternates: bilingual(`/restjes/${city.slug}`),
  }))

  // Category pages — bilingual chrome with same dish queries.
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${BASE_URL}/categorie/${category.slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
    alternates: bilingual(`/categorie/${category.slug}`),
  }))

  // Kennisbank articles — Dutch-only editorial by default. We mark EN as
  // bilingual only when the article has an English body.
  const articles = await getAllArticles()
  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${BASE_URL}/kennisbank/${article.slug}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    alternates: article.bodyMdEn && article.bodyMdEn.trim() !== ''
      ? bilingual(`/kennisbank/${article.slug}`)
      : nlOnly(`/kennisbank/${article.slug}`),
  }))

  return [
    ...staticPages,
    ...dishPages,
    ...merchantPages,
    ...cityPages,
    ...categoryPages,
    ...articlePages,
  ]
}
