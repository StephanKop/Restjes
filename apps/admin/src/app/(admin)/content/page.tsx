import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-admin'

export const metadata: Metadata = {
  title: 'Content beheren',
}

const PAGES = [
  { slug: 'homepage', label: 'Homepage', description: 'Hero tekst en call-to-action knoppen' },
  { slug: 'how-it-works', label: 'Hoe het werkt', description: 'Stappen, statistieken en community sectie' },
  { slug: 'about', label: 'Over ons', description: 'Missie, waarden en contactgegevens' },
  { slug: 'faq', label: 'Veelgestelde vragen', description: 'FAQ secties met vragen en antwoorden' },
]

export default async function ContentOverviewPage() {
  const supabase = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase as any)
    .from('page_content')
    .select('page_slug, updated_at')

  const updatedMap = new Map<string, string>()
  for (const row of (rows ?? []) as { page_slug: string; updated_at: string }[]) {
    updatedMap.set(row.page_slug, row.updated_at)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-warm-900">Content beheren</h1>
        <p className="mt-1 text-sm text-warm-500">Bewerk de teksten op de publieke pagina&apos;s van de website.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PAGES.map((page) => {
          const updatedAt = updatedMap.get(page.slug)
          return (
            <Link
              key={page.slug}
              href={`/content/${page.slug}`}
              className="group rounded-2xl bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-bold text-warm-900 group-hover:text-brand-600">
                  {page.label}
                </h2>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-warm-300 transition-colors group-hover:text-brand-500">
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-warm-500">{page.description}</p>
              <p className="mt-3 text-xs text-warm-400">
                {updatedAt
                  ? `Laatst bewerkt: ${new Date(updatedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                  : 'Nog niet bewerkt — standaard content wordt getoond'}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
