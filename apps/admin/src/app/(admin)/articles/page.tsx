import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-admin'
import { formatDate } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Kennisbank',
}

const CATEGORY_LABEL: Record<string, string> = {
  voedselverspilling: 'Voedselverspilling',
  praktisch: 'Praktische tips',
  recepten: 'Recepten',
  duurzaamheid: 'Duurzaamheid',
}

interface ArticleRow {
  slug: string
  title: string
  description: string
  category: string
  body_md_en: string | null
  image_url: string | null
  reading_minutes: number
  published_at: string
  updated_at: string
}

export default async function ArticlesPage() {
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('articles')
    .select(
      'slug, title, description, category, body_md_en, image_url, reading_minutes, published_at, updated_at',
    )
    .order('published_at', { ascending: false })

  if (error) {
    return (
      <div>
        <h1 className="mb-2 text-3xl font-extrabold text-warm-900">Kennisbank</h1>
        <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          Kon artikelen niet laden: {error.message}
        </div>
      </div>
    )
  }

  const articles = (data ?? []) as ArticleRow[]

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-warm-900">Kennisbank</h1>
          <p className="mt-1 text-sm text-warm-500">
            Bewerk de artikelen die op de publieke kennisbank verschijnen.
          </p>
        </div>
        <Link
          href="/articles/new"
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          Nieuw artikel
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-warm-500 shadow-card">
          Nog geen artikelen. Klik op &quot;Nieuw artikel&quot; om te beginnen.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-warm-100 bg-warm-50 text-xs uppercase tracking-wide text-warm-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Titel</th>
                <th className="px-4 py-3 font-semibold">Categorie</th>
                <th className="px-4 py-3 font-semibold">Talen</th>
                <th className="px-4 py-3 font-semibold">Gepubliceerd</th>
                <th className="px-4 py-3 font-semibold">Bewerkt</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {articles.map((a) => {
                const hasEn = a.body_md_en !== null && a.body_md_en.trim() !== ''
                return (
                  <tr key={a.slug} className="hover:bg-warm-50/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/articles/${a.slug}`}
                        className="block font-bold text-warm-900 hover:text-brand-700"
                      >
                        {a.title}
                      </Link>
                      <p className="mt-0.5 line-clamp-1 text-xs text-warm-500">{a.description}</p>
                    </td>
                    <td className="px-4 py-3 text-warm-700">
                      {CATEGORY_LABEL[a.category] ?? a.category}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">
                        NL
                      </span>
                      {hasEn && (
                        <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                          EN
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-warm-700">{formatDate(a.published_at)}</td>
                    <td className="px-4 py-3 text-warm-500">{formatDate(a.updated_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/articles/${a.slug}`}
                        className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                      >
                        Bewerken →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
