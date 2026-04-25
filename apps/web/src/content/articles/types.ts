import type { ReactNode } from 'react'

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

export type ArticleMeta = {
  slug: string
  title: string
  /** Used for meta description, og:description, and listing summary. */
  description: string
  /** ISO date string. */
  publishedAt: string
  /** ISO date string for last edit, optional. */
  updatedAt?: string
  category: ArticleCategory
  /** Approximate reading time in minutes — calculated when authoring. */
  readingMinutes: number
  /** Optional og:image. Defaults to /og-image.png. */
  image?: string
}

export type Article = ArticleMeta & {
  /** Renders the article body. */
  Body: () => ReactNode
}
