import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-admin'
import { ArticleEditor } from '@/components/ArticleEditor'

export const metadata: Metadata = {
  title: 'Artikel bewerken',
}

interface ArticleEditPageProps {
  params: Promise<{ slug: string }>
}

interface ArticleRow {
  slug: string
  title: string
  description: string
  category: string
  body_md: string
  body_md_en: string | null
  image_url: string | null
  image_alt: string | null
  image_credit: string | null
  reading_minutes: number
  published_at: string
}

export default async function ArticleEditPage({ params }: ArticleEditPageProps) {
  const { slug } = await params
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('articles')
    .select(
      'slug, title, description, category, body_md, body_md_en, image_url, image_alt, image_credit, reading_minutes, published_at',
    )
    .eq('slug', slug)
    .single()

  if (error || !data) {
    notFound()
  }
  const article = data as ArticleRow

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-warm-400">
        <Link href="/articles" className="hover:text-brand-600">
          Kennisbank
        </Link>
        <span>/</span>
        <span className="text-warm-700">{article.title}</span>
      </div>

      <h1 className="mb-6 text-3xl font-extrabold text-warm-900">{article.title}</h1>

      <ArticleEditor
        originalSlug={article.slug}
        initial={{
          slug: article.slug,
          title: article.title,
          description: article.description,
          category: article.category,
          body_md: article.body_md,
          body_md_en: article.body_md_en,
          image_url: article.image_url,
          image_alt: article.image_alt,
          image_credit: article.image_credit,
          reading_minutes: article.reading_minutes,
          published_at: article.published_at,
        }}
      />
    </div>
  )
}
