'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-admin'

const ALLOWED_CATEGORIES = [
  'voedselverspilling',
  'praktisch',
  'recepten',
  'duurzaamheid',
] as const

export interface ArticleFormState {
  ok: boolean
  error?: string
}

interface ArticleInput {
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

function validate(input: ArticleInput): string | null {
  if (!input.slug.match(/^[a-z0-9-]+$/)) return 'Slug mag alleen letters, cijfers en streepjes bevatten'
  if (!input.title.trim()) return 'Titel is verplicht'
  if (!input.description.trim()) return 'Beschrijving is verplicht'
  if (!ALLOWED_CATEGORIES.includes(input.category as typeof ALLOWED_CATEGORIES[number])) {
    return 'Onbekende categorie'
  }
  if (!input.body_md.trim()) return 'Body (NL) is verplicht'
  if (input.reading_minutes < 1 || input.reading_minutes > 60) return 'Leestijd moet tussen 1 en 60 minuten zijn'
  return null
}

function readInput(formData: FormData): ArticleInput {
  const bodyEnRaw = (formData.get('body_md_en') ?? '').toString().trim()
  return {
    slug: (formData.get('slug') ?? '').toString().trim(),
    title: (formData.get('title') ?? '').toString().trim(),
    description: (formData.get('description') ?? '').toString().trim(),
    category: (formData.get('category') ?? '').toString().trim(),
    body_md: (formData.get('body_md') ?? '').toString(),
    body_md_en: bodyEnRaw === '' ? null : bodyEnRaw,
    image_url: ((formData.get('image_url') ?? '').toString().trim() || null),
    image_alt: ((formData.get('image_alt') ?? '').toString().trim() || null),
    image_credit: ((formData.get('image_credit') ?? '').toString().trim() || null),
    reading_minutes: parseInt((formData.get('reading_minutes') ?? '5').toString(), 10) || 5,
    published_at: (formData.get('published_at') ?? new Date().toISOString()).toString(),
  }
}

async function pingWebRevalidate(slug: string | null) {
  // Optional cross-app cache invalidation. Without REVALIDATE_SECRET the web
  // app falls back to its 1-hour ISR window — saving still succeeds.
  const url = process.env.WEB_APP_URL
  const secret = process.env.REVALIDATE_SECRET
  if (!url || !secret) return
  try {
    await fetch(`${url}/api/revalidate`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ slug }),
    })
  } catch {
    // Best-effort — don't fail the save if revalidate is unreachable.
  }
}

/** Create or update an article. */
export async function saveArticleAction(
  originalSlug: string | null,
  formData: FormData,
): Promise<ArticleFormState> {
  const input = readInput(formData)
  const validationError = validate(input)
  if (validationError) return { ok: false, error: validationError }

  const supabase = createAdminClient()
  const isUpdate = originalSlug !== null
  const now = new Date().toISOString()

  if (isUpdate) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('articles')
      .update({ ...input, updated_at: now })
      .eq('slug', originalSlug)
    if (error) return { ok: false, error: error.message }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('articles')
      .insert({ ...input, updated_at: now })
    if (error) return { ok: false, error: error.message }
  }

  revalidatePath('/articles')
  revalidatePath(`/articles/${input.slug}`)
  if (originalSlug && originalSlug !== input.slug) {
    revalidatePath(`/articles/${originalSlug}`)
  }
  await pingWebRevalidate(input.slug)
  if (originalSlug && originalSlug !== input.slug) {
    await pingWebRevalidate(originalSlug)
  }

  if (!isUpdate || originalSlug !== input.slug) {
    redirect(`/articles/${input.slug}`)
  }
  return { ok: true }
}

/** Upload a hero image to the article-images bucket and return the public URL. */
export async function uploadArticleImageAction(
  slug: string,
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Geen bestand ontvangen' }
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: 'Bestand te groot (max 5 MB)' }
  }
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'Alleen afbeeldingen zijn toegestaan' }
  }

  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'jpg'
  const safeSlug = (slug || 'untitled').replace(/[^a-z0-9-]/gi, '-')
  const path = `${safeSlug}/${Date.now()}.${ext}`

  const supabase = createAdminClient()
  const { error: uploadError } = await supabase.storage
    .from('article-images')
    .upload(path, file, { contentType: file.type, upsert: true })
  if (uploadError) return { ok: false, error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage
    .from('article-images')
    .getPublicUrl(path)
  return { ok: true, url: publicUrl }
}

/** Delete an article (hard delete — articles are public, no soft-delete needed). */
export async function deleteArticleAction(slug: string): Promise<ArticleFormState> {
  if (!slug) return { ok: false, error: 'Geen slug opgegeven' }
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('articles').delete().eq('slug', slug)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/articles')
  await pingWebRevalidate(slug)
  redirect('/articles')
}
