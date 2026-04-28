import 'server-only'
import { cache } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { Locale } from '@kliekjesclub/i18n'

// Anonymous client — articles are publicly readable (RLS allows anon SELECT).
// We do NOT use the cookie-bound server client here so this module is safe
// to call from `generateStaticParams`, sitemap generation, and other build-
// time contexts that run outside a request scope.
function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  )
}

export type ArticleCategory =
  | 'voedselverspilling'
  | 'praktisch'
  | 'recepten'
  | 'duurzaamheid'

export const ARTICLE_CATEGORY_LABEL: Record<ArticleCategory, string> = {
  voedselverspilling: 'Voedselverspilling',
  praktisch: 'Praktische tips',
  recepten: 'Recepten',
  duurzaamheid: 'Duurzaamheid',
}

export interface Article {
  slug: string
  title: string
  description: string
  category: ArticleCategory
  bodyMd: string
  bodyMdEn: string | null
  imageUrl: string | null
  imageAlt: string | null
  imageCredit: string | null
  readingMinutes: number
  publishedAt: string
  updatedAt: string
}

interface ArticleRow {
  slug: string
  title: string
  description: string
  category: ArticleCategory
  body_md: string
  body_md_en: string | null
  image_url: string | null
  image_alt: string | null
  image_credit: string | null
  reading_minutes: number
  published_at: string
  updated_at: string
}

function rowToArticle(row: ArticleRow): Article {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    bodyMd: row.body_md,
    bodyMdEn: row.body_md_en,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    imageCredit: row.image_credit,
    readingMinutes: row.reading_minutes,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  }
}

/** Resolve the body to render for a given locale. EN falls back to NL. */
export function bodyForLocale(article: Article, locale: Locale | string): string {
  if (locale === 'en' && article.bodyMdEn && article.bodyMdEn.trim() !== '') {
    return article.bodyMdEn
  }
  return article.bodyMd
}

/**
 * All published articles, newest first. Cached per-request via React `cache`
 * so the index page, the article page, and SEO helpers don't each re-fetch.
 */
export const getAllArticles = cache(async (): Promise<Article[]> => {
  const supabase = getPublicClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('articles')
    .select(
      'slug, title, description, category, body_md, body_md_en, image_url, image_alt, image_credit, reading_minutes, published_at, updated_at',
    )
    .order('published_at', { ascending: false })

  if (error) {
    console.error('[articles] failed to fetch list', error)
    return []
  }
  return (data as ArticleRow[]).map(rowToArticle)
})

export async function findArticle(slug: string): Promise<Article | null> {
  const all = await getAllArticles()
  return all.find((a) => a.slug === slug) ?? null
}

export async function relatedArticles(article: Article, n = 3): Promise<Article[]> {
  const all = await getAllArticles()
  const sameCategory = all.filter(
    (a) => a.category === article.category && a.slug !== article.slug,
  )
  const others = all.filter((a) => a.category !== article.category && a.slug !== article.slug)
  return [...sameCategory, ...others].slice(0, n)
}
