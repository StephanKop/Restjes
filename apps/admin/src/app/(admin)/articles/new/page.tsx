import type { Metadata } from 'next'
import Link from 'next/link'
import { ArticleEditor } from '@/components/ArticleEditor'

export const metadata: Metadata = {
  title: 'Nieuw artikel',
}

export default function NewArticlePage() {
  const now = new Date()
  // datetime-local needs YYYY-MM-DDTHH:mm. Use the current moment as default
  // and let the editor display it locally.
  const defaultPublishedAt = now.toISOString()

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-warm-400">
        <Link href="/articles" className="hover:text-brand-600">
          Kennisbank
        </Link>
        <span>/</span>
        <span className="text-warm-700">Nieuw artikel</span>
      </div>

      <h1 className="mb-6 text-3xl font-extrabold text-warm-900">Nieuw artikel</h1>

      <ArticleEditor
        originalSlug={null}
        initial={{
          slug: '',
          title: '',
          description: '',
          category: 'voedselverspilling',
          body_md: '',
          body_md_en: null,
          image_url: null,
          image_alt: null,
          image_credit: null,
          reading_minutes: 5,
          published_at: defaultPublishedAt,
        }}
      />
    </div>
  )
}
