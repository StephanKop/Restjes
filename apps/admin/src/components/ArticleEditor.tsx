'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  saveArticleAction,
  uploadArticleImageAction,
  deleteArticleAction,
} from '@/actions/articles'
import { ArticlePreview } from './ArticlePreview'

type Locale = 'nl' | 'en'

const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: 'voedselverspilling', label: 'Voedselverspilling' },
  { value: 'praktisch', label: 'Praktische tips' },
  { value: 'recepten', label: 'Recepten' },
  { value: 'duurzaamheid', label: 'Duurzaamheid' },
]

export interface ArticleEditorInitial {
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

interface ArticleEditorProps {
  initial: ArticleEditorInitial
  /** Slug as it currently exists in DB. null for new articles. */
  originalSlug: string | null
}

export function ArticleEditor({ initial, originalSlug }: ArticleEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [activeLocale, setActiveLocale] = useState<Locale>('nl')

  const [slug, setSlug] = useState(initial.slug)
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [category, setCategory] = useState(initial.category)
  const [bodyMd, setBodyMd] = useState(initial.body_md)
  const [bodyMdEn, setBodyMdEn] = useState(initial.body_md_en ?? '')
  const [imageUrl, setImageUrl] = useState(initial.image_url ?? '')
  const [imageAlt, setImageAlt] = useState(initial.image_alt ?? '')
  const [imageCredit, setImageCredit] = useState(initial.image_credit ?? '')
  const [readingMinutes, setReadingMinutes] = useState(initial.reading_minutes)
  const [publishedAt, setPublishedAt] = useState(
    initial.published_at.slice(0, 16), // YYYY-MM-DDTHH:mm for datetime-local
  )

  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.set('slug', slug)
    fd.set('title', title)
    fd.set('description', description)
    fd.set('category', category)
    fd.set('body_md', bodyMd)
    fd.set('body_md_en', bodyMdEn)
    fd.set('image_url', imageUrl)
    fd.set('image_alt', imageAlt)
    fd.set('image_credit', imageCredit)
    fd.set('reading_minutes', String(readingMinutes))
    fd.set('published_at', new Date(publishedAt).toISOString())

    startTransition(async () => {
      const result = await saveArticleAction(originalSlug, fd)
      if (!result.ok) {
        setError(result.error ?? 'Onbekende fout')
        return
      }
      setSavedAt(new Date().toLocaleTimeString('nl-NL'))
      router.refresh()
    })
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.set('file', file)
      const result = await uploadArticleImageAction(slug || 'untitled', fd)
      if (result.ok) {
        setImageUrl(result.url)
      } else {
        setError(result.error)
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleDelete() {
    if (!originalSlug) return
    if (!confirm('Weet je zeker dat je dit artikel wilt verwijderen? Dit is permanent.')) return
    startTransition(async () => {
      const result = await deleteArticleAction(originalSlug)
      if (!result.ok) {
        setError(result.error ?? 'Verwijderen mislukt')
      }
    })
  }

  const activeBody = activeLocale === 'nl' ? bodyMd : bodyMdEn
  const previewMarkdown = activeBody.trim() === '' && activeLocale === 'en' ? bodyMd : activeBody

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-700">{error}</div>
      )}
      {savedAt && !error && (
        <div className="rounded-2xl bg-green-50 px-5 py-3 text-sm text-green-700">
          Opgeslagen om {savedAt}.
        </div>
      )}

      {/* Metadata */}
      <section className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold text-warm-900">Metadata</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Titel" required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="form-input"
            />
          </Field>
          <Field label="Slug (URL)" required hint="Lowercase, streepjes, alleen a-z 0-9 -">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="[a-z0-9-]+"
              className="form-input"
            />
          </Field>
          <Field label="Korte beschrijving (max ~160 tekens)" required>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
              maxLength={300}
              className="form-input resize-y"
            />
          </Field>
          <Field label="Categorie" required>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="form-input"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Leestijd (minuten)" required>
            <input
              type="number"
              min={1}
              max={60}
              value={readingMinutes}
              onChange={(e) => setReadingMinutes(parseInt(e.target.value, 10) || 5)}
              required
              className="form-input"
            />
          </Field>
          <Field label="Publicatiedatum" required>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              required
              className="form-input"
            />
          </Field>
        </div>
      </section>

      {/* Hero image */}
      <section className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold text-warm-900">Hero-afbeelding</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <Field label="Afbeelding-URL" hint="Plak een URL of upload via de knop hieronder">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://… of /pad/naar/afbeelding.jpg"
                className="form-input"
              />
            </Field>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                disabled={uploading || isPending}
                className="hidden"
                id="article-image-upload"
              />
              <label
                htmlFor="article-image-upload"
                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-warm-100 px-4 py-2 text-sm font-bold text-warm-800 transition-colors hover:bg-warm-200 ${
                  uploading || isPending ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                {uploading ? 'Uploaden…' : 'Upload afbeelding'}
              </label>
              {!slug && (
                <p className="mt-1 text-xs text-warm-500">Vul eerst een slug in voor netjes opslaan.</p>
              )}
            </div>
            <Field label="Alt-tekst" hint="Voor toegankelijkheid en SEO">
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="form-input"
              />
            </Field>
            <Field label="Bron / credit" hint="Optioneel — verschijnt onder de afbeelding">
              <input
                type="text"
                value={imageCredit}
                onChange={(e) => setImageCredit(e.target.value)}
                className="form-input"
              />
            </Field>
          </div>
          <div>
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={imageAlt || 'preview'}
                className="aspect-[16/9] w-full rounded-2xl bg-warm-100 object-cover"
              />
            ) : (
              <div className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl bg-warm-100 text-sm text-warm-400">
                Nog geen afbeelding
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Body editor + preview */}
      <section className="rounded-2xl bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-warm-900">Inhoud</h2>
          <div className="flex rounded-lg bg-warm-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveLocale('nl')}
              className={`rounded-md px-3 py-1 transition-colors ${
                activeLocale === 'nl' ? 'bg-white text-warm-900 shadow-sm' : 'text-warm-500'
              }`}
            >
              NL (verplicht)
            </button>
            <button
              type="button"
              onClick={() => setActiveLocale('en')}
              className={`rounded-md px-3 py-1 transition-colors ${
                activeLocale === 'en' ? 'bg-white text-warm-900 shadow-sm' : 'text-warm-500'
              }`}
            >
              EN (optioneel)
            </button>
          </div>
        </div>

        <div className="mb-3 rounded-xl bg-warm-50 px-4 py-2 text-xs text-warm-600">
          Markdown ondersteunt standaard syntax. Speciale blokken:
          <code className="mx-1 rounded bg-white px-1 py-0.5 text-warm-800">:::callout</code>
          <code className="mx-1 rounded bg-white px-1 py-0.5 text-warm-800">:::stats</code>
          met kindelementen
          <code className="mx-1 rounded bg-white px-1 py-0.5 text-warm-800">::stat&#123;value=&quot;…&quot; label=&quot;…&quot;&#125;</code>
          .
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <textarea
            value={activeBody}
            onChange={(e) => {
              if (activeLocale === 'nl') setBodyMd(e.target.value)
              else setBodyMdEn(e.target.value)
            }}
            rows={28}
            placeholder={
              activeLocale === 'en'
                ? 'Optionele Engelse vertaling. Laat leeg om de NL versie te tonen voor /en bezoekers.'
                : 'Schrijf het artikel in markdown…'
            }
            className="form-input font-mono text-sm leading-relaxed"
          />
          <div className="prose-style overflow-y-auto rounded-xl border border-warm-100 bg-warm-50/40 p-5">
            <ArticlePreview markdown={previewMarkdown} />
            {activeLocale === 'en' && bodyMdEn.trim() === '' && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Preview valt terug op NL — vul EN body in om verschillen te zien.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <div>
          {originalSlug && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              Verwijderen
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/articles')}
            className="rounded-xl border border-warm-200 bg-white px-5 py-2.5 text-sm font-bold text-warm-700 transition-colors hover:bg-warm-50"
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            {isPending ? 'Opslaan…' : originalSlug ? 'Opslaan' : 'Aanmaken'}
          </button>
        </div>
      </div>
    </form>
  )
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-warm-800">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-warm-500">{hint}</span>}
    </label>
  )
}
