import type { MetadataRoute } from 'next'
import { createServerComponentClient } from '@/lib/supabase-server'

const BASE_URL = 'https://kliekjesclub.nl'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerComponentClient()

  // Fetch all available dishes
  const { data: dishes } = await supabase
    .from('dishes')
    .select('id, updated_at')
    .eq('status', 'available')
    .gt('quantity_available', 0)

  // Fetch all verified merchants
  const { data: merchants } = await supabase
    .from('merchants')
    .select('id, updated_at')
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
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  const dishPages: MetadataRoute.Sitemap = (dishes ?? []).map((dish) => ({
    url: `${BASE_URL}/dish/${dish.id}`,
    lastModified: dish.updated_at ? new Date(dish.updated_at) : new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }))

  const merchantPages: MetadataRoute.Sitemap = (merchants ?? []).map((merchant) => ({
    url: `${BASE_URL}/merchant/${merchant.id}`,
    lastModified: merchant.updated_at ? new Date(merchant.updated_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...dishPages, ...merchantPages]
}
