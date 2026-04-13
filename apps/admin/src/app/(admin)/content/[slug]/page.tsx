import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-admin'
import { ContentForm } from './ContentForm'
import {
  HOMEPAGE_DEFAULTS,
  HOW_IT_WORKS_DEFAULTS,
  ABOUT_DEFAULTS,
  FAQ_DEFAULTS,
} from './defaults'

const PAGE_META: Record<string, { label: string; defaults: Record<string, unknown> }> = {
  homepage: { label: 'Homepage', defaults: HOMEPAGE_DEFAULTS as unknown as Record<string, unknown> },
  'how-it-works': { label: 'Hoe het werkt', defaults: HOW_IT_WORKS_DEFAULTS as unknown as Record<string, unknown> },
  about: { label: 'Over ons', defaults: ABOUT_DEFAULTS as unknown as Record<string, unknown> },
  faq: { label: 'Veelgestelde vragen', defaults: FAQ_DEFAULTS as unknown as Record<string, unknown> },
}

interface ContentEditPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ContentEditPageProps): Promise<Metadata> {
  const { slug } = await params
  const meta = PAGE_META[slug]
  if (!meta) return { title: 'Niet gevonden' }
  return { title: `${meta.label} bewerken` }
}

export default async function ContentEditPage({ params }: ContentEditPageProps) {
  const { slug } = await params
  const meta = PAGE_META[slug]
  if (!meta) notFound()

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('page_content')
    .select('content')
    .eq('page_slug', slug)
    .maybeSingle()

  const content = data?.content
    ? { ...meta.defaults, ...(data.content as Record<string, unknown>) }
    : meta.defaults

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-warm-900">{meta.label} bewerken</h1>
        <p className="mt-1 text-sm text-warm-500">Wijzig de content en klik op opslaan om te publiceren.</p>
      </div>
      <ContentForm slug={slug} initialContent={content} />
    </div>
  )
}
