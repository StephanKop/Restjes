import type { MetadataRoute } from 'next'
import { createServerComponentClient } from '@/lib/supabase-server'
import { dishPath, merchantPath } from '@/lib/slug'
import { DUTCH_CITIES, findCity } from '@/data/dutch-cities'
import { CATEGORIES } from '@/data/categories'
import { ARTICLES } from '@/content/articles'

const BASE_URL = 'https://kliekjesclub.nl'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerComponentClient()

  // Fetch all available dishes
  const { data: dishes } = await supabase
    .from('dishes')
    .select('id, title, updated_at')
    .eq('status', 'available')
    .gt('quantity_available', 0)

  // Fetch all verified merchants
  const { data: merchants } = await supabase
    .from('merchants')
    .select('id, business_name, city, updated_at')
    .eq('is_verified', true)

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/browse`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/restjes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/categorie`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/kennisbank`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const dishPages: MetadataRoute.Sitemap = (dishes ?? []).map((dish) => ({
    url: `${BASE_URL}${dishPath({ id: dish.id, title: dish.title })}`,
    lastModified: dish.updated_at ? new Date(dish.updated_at) : new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }))

  const merchantPages: MetadataRoute.Sitemap = (merchants ?? []).map((merchant) => ({
    url: `${BASE_URL}${merchantPath({ id: merchant.id, business_name: merchant.business_name })}`,
    lastModified: merchant.updated_at ? new Date(merchant.updated_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // City landing pages: every curated city is included so Google has a
  // stable index to crawl. Cities that resolve from real merchant rows get
  // higher priority (signals there's actual content there).
  const citiesWithMerchants = new Set<string>()
  for (const m of merchants ?? []) {
    const c = findCity(m.city)
    if (c) citiesWithMerchants.add(c.slug)
  }
  const cityPages: MetadataRoute.Sitemap = DUTCH_CITIES.map((city) => ({
    url: `${BASE_URL}/restjes/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: citiesWithMerchants.has(city.slug) ? 'daily' as const : 'weekly' as const,
    priority: citiesWithMerchants.has(city.slug) ? 0.75 : 0.4,
  }))

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${BASE_URL}/categorie/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const articlePages: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${BASE_URL}/kennisbank/${article.slug}`,
    lastModified: new Date(article.updatedAt ?? article.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
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
