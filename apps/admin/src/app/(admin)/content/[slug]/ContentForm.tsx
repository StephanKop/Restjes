'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updatePageContent } from '@/actions/content'

interface ContentFormProps {
  slug: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialContent: Record<string, any>
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-warm-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-warm-200 bg-white px-4 py-2.5 text-sm text-warm-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  )
}

function Textarea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-warm-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-sm text-warm-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  )
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-warm-700">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-warm-200 bg-white px-4 py-2.5 text-sm text-warm-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  )
}

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="rounded-2xl bg-white shadow-card" open={defaultOpen}>
      <summary className="flex items-center justify-between px-6 py-4 font-bold text-warm-800 [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-warm-400 transition-transform [details[open]>summary>&]:rotate-180">
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </summary>
      <div className="space-y-4 border-t border-warm-100 px-6 py-5">
        {children}
      </div>
    </details>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-xs font-medium text-red-500 hover:text-red-700">
      Verwijderen
    </button>
  )
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border-2 border-dashed border-warm-200 px-4 py-2.5 text-sm font-medium text-warm-500 transition-colors hover:border-brand-300 hover:text-brand-600"
    >
      + {label}
    </button>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function update<T extends Record<string, any>>(obj: T, path: string, value: unknown): T {
  const keys = path.split('.')
  const result = { ...obj }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = result
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = Array.isArray(current[keys[i]])
      ? [...current[keys[i]]]
      : { ...current[keys[i]] }
    current = current[keys[i]]
  }
  current[keys[keys.length - 1]] = value
  return result
}

export function ContentForm({ slug, initialContent }: ContentFormProps) {
  const [content, setContent] = useState(initialContent)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (path: string, value: any) => {
    setContent((prev) => update(prev, path, value))
    setMessage(null)
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await updatePageContent(slug, content)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Content opgeslagen!' })
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4">
      <Section title="SEO / Metadata" defaultOpen>
        <Input label="Meta titel (zoekmachines + browser tab)" value={content.seo?.metaTitle ?? ''} onChange={(v) => set('seo.metaTitle', v)} />
        <Textarea label="Meta beschrijving (zoekmachines)" value={content.seo?.metaDescription ?? ''} onChange={(v) => set('seo.metaDescription', v)} rows={2} />
      </Section>

      {slug === 'homepage' && <HomepageEditor content={content} set={set} />}
      {slug === 'how-it-works' && <HowItWorksEditor content={content} set={set} />}
      {slug === 'about' && <AboutEditor content={content} set={set} />}
      {slug === 'faq' && <FaqEditor content={content} set={set} />}

      {/* Save bar */}
      <div className="sticky bottom-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-lg ring-1 ring-warm-100">
        {message && (
          <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
        {!message && <span />}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-xl bg-brand-500 px-8 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
        >
          {isPending ? 'Opslaan...' : 'Opslaan'}
        </button>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HomepageEditor({ content, set }: { content: any; set: (path: string, value: any) => void }) {
  return (
    <Section title="Hero sectie" defaultOpen>
      <Input label="Titel" value={content.hero?.heading ?? ''} onChange={(v) => set('hero.heading', v)} />
      <Input label="Titel highlight" value={content.hero?.headingHighlight ?? ''} onChange={(v) => set('hero.headingHighlight', v)} />
      <Textarea label="Subtekst" value={content.hero?.subheading ?? ''} onChange={(v) => set('hero.subheading', v)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Primaire knop tekst" value={content.hero?.primaryCta?.label ?? ''} onChange={(v) => set('hero.primaryCta.label', v)} />
        <Input label="Primaire knop link" value={content.hero?.primaryCta?.href ?? ''} onChange={(v) => set('hero.primaryCta.href', v)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Secundaire knop tekst" value={content.hero?.secondaryCta?.label ?? ''} onChange={(v) => set('hero.secondaryCta.label', v)} />
        <Input label="Secundaire knop link" value={content.hero?.secondaryCta?.href ?? ''} onChange={(v) => set('hero.secondaryCta.href', v)} />
      </div>
    </Section>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HowItWorksEditor({ content, set }: { content: any; set: (path: string, value: any) => void }) {
  const stats: { value: number; prefix: string; suffix: string; label: string }[] = content.stats ?? []
  const steps: { title: string; description: string; detail: string }[] = content.steps ?? []
  const features: { title: string; description: string }[] = content.community?.features ?? []

  return (
    <>
      <Section title="Sectie heading" defaultOpen>
        <Input label="Subtitle" value={content.section?.subtitle ?? ''} onChange={(v) => set('section.subtitle', v)} />
        <Input label="Heading" value={content.section?.heading ?? ''} onChange={(v) => set('section.heading', v)} />
      </Section>

      <Section title="Statistieken">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl border border-warm-100 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-warm-600">Statistiek {i + 1}</span>
              <RemoveButton onClick={() => set('stats', stats.filter((_, j) => j !== i))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <NumberInput label="Waarde" value={stat.value} onChange={(v) => { const s = [...stats]; s[i] = { ...s[i], value: v }; set('stats', s) }} />
              <Input label="Prefix" value={stat.prefix} onChange={(v) => { const s = [...stats]; s[i] = { ...s[i], prefix: v }; set('stats', s) }} />
              <Input label="Suffix" value={stat.suffix} onChange={(v) => { const s = [...stats]; s[i] = { ...s[i], suffix: v }; set('stats', s) }} />
              <Input label="Label" value={stat.label} onChange={(v) => { const s = [...stats]; s[i] = { ...s[i], label: v }; set('stats', s) }} />
            </div>
          </div>
        ))}
        <AddButton label="Statistiek toevoegen" onClick={() => set('stats', [...stats, { value: 0, prefix: '', suffix: '', label: '' }])} />
      </Section>

      <Section title="Stappen">
        {steps.map((step, i) => (
          <div key={i} className="rounded-xl border border-warm-100 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-warm-600">Stap {i + 1}</span>
              <RemoveButton onClick={() => set('steps', steps.filter((_, j) => j !== i))} />
            </div>
            <div className="space-y-3">
              <Input label="Titel" value={step.title} onChange={(v) => { const s = [...steps]; s[i] = { ...s[i], title: v }; set('steps', s) }} />
              <Textarea label="Beschrijving" value={step.description} onChange={(v) => { const s = [...steps]; s[i] = { ...s[i], description: v }; set('steps', s) }} rows={2} />
              <Input label="Detail" value={step.detail} onChange={(v) => { const s = [...steps]; s[i] = { ...s[i], detail: v }; set('steps', s) }} />
            </div>
          </div>
        ))}
        <AddButton label="Stap toevoegen" onClick={() => set('steps', [...steps, { title: '', description: '', detail: '' }])} />
      </Section>

      <Section title="Community sectie">
        <Input label="Subtitle" value={content.community?.subtitle ?? ''} onChange={(v) => set('community.subtitle', v)} />
        <Input label="Heading" value={content.community?.heading ?? ''} onChange={(v) => set('community.heading', v)} />
        <Textarea label="Beschrijving" value={content.community?.description ?? ''} onChange={(v) => set('community.description', v)} />
        <p className="text-sm font-medium text-warm-700">Features</p>
        {features.map((f, i) => (
          <div key={i} className="rounded-xl border border-warm-100 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-warm-600">Feature {i + 1}</span>
              <RemoveButton onClick={() => set('community.features', features.filter((_, j) => j !== i))} />
            </div>
            <div className="space-y-3">
              <Input label="Titel" value={f.title} onChange={(v) => { const fs = [...features]; fs[i] = { ...fs[i], title: v }; set('community.features', fs) }} />
              <Input label="Beschrijving" value={f.description} onChange={(v) => { const fs = [...features]; fs[i] = { ...fs[i], description: v }; set('community.features', fs) }} />
            </div>
          </div>
        ))}
        <AddButton label="Feature toevoegen" onClick={() => set('community.features', [...features, { title: '', description: '' }])} />
      </Section>

      <Section title="Call-to-action banner">
        <Input label="Titel" value={content.cta?.heading ?? ''} onChange={(v) => set('cta.heading', v)} />
        <Input label="Subtekst" value={content.cta?.subheading ?? ''} onChange={(v) => set('cta.subheading', v)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Primaire knop tekst" value={content.cta?.primaryCta?.label ?? ''} onChange={(v) => set('cta.primaryCta.label', v)} />
          <Input label="Primaire knop link" value={content.cta?.primaryCta?.href ?? ''} onChange={(v) => set('cta.primaryCta.href', v)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Secundaire knop tekst" value={content.cta?.secondaryCta?.label ?? ''} onChange={(v) => set('cta.secondaryCta.label', v)} />
          <Input label="Secundaire knop link" value={content.cta?.secondaryCta?.href ?? ''} onChange={(v) => set('cta.secondaryCta.href', v)} />
        </div>
      </Section>
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AboutEditor({ content, set }: { content: any; set: (path: string, value: any) => void }) {
  const paragraphs: string[] = content.mission?.paragraphs ?? []
  const steps: { title: string; description: string }[] = content.howItWorks?.steps ?? []
  const values: { emoji: string; title: string; description: string }[] = content.values?.items ?? []

  return (
    <>
      <Section title="Pagina heading" defaultOpen>
        <Input label="Titel" value={content.heading ?? ''} onChange={(v) => set('heading', v)} />
        <Input label="Subtitel" value={content.subheading ?? ''} onChange={(v) => set('subheading', v)} />
      </Section>

      <Section title="Missie">
        <Input label="Sectie titel" value={content.mission?.heading ?? ''} onChange={(v) => set('mission.heading', v)} />
        {paragraphs.map((p, i) => (
          <div key={i} className="flex gap-2">
            <div className="flex-1">
              <Textarea label={`Paragraaf ${i + 1}`} value={p} onChange={(v) => { const ps = [...paragraphs]; ps[i] = v; set('mission.paragraphs', ps) }} rows={3} />
            </div>
            <div className="pt-7">
              <RemoveButton onClick={() => set('mission.paragraphs', paragraphs.filter((_, j) => j !== i))} />
            </div>
          </div>
        ))}
        <AddButton label="Paragraaf toevoegen" onClick={() => set('mission.paragraphs', [...paragraphs, ''])} />
      </Section>

      <Section title="Hoe het werkt">
        <Input label="Sectie titel" value={content.howItWorks?.heading ?? ''} onChange={(v) => set('howItWorks.heading', v)} />
        {steps.map((step, i) => (
          <div key={i} className="rounded-xl border border-warm-100 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-warm-600">Stap {i + 1}</span>
              <RemoveButton onClick={() => set('howItWorks.steps', steps.filter((_, j) => j !== i))} />
            </div>
            <div className="space-y-3">
              <Input label="Titel" value={step.title} onChange={(v) => { const s = [...steps]; s[i] = { ...s[i], title: v }; set('howItWorks.steps', s) }} />
              <Textarea label="Beschrijving" value={step.description} onChange={(v) => { const s = [...steps]; s[i] = { ...s[i], description: v }; set('howItWorks.steps', s) }} rows={2} />
            </div>
          </div>
        ))}
        <AddButton label="Stap toevoegen" onClick={() => set('howItWorks.steps', [...steps, { title: '', description: '' }])} />
      </Section>

      <Section title="Waarden">
        <Input label="Sectie titel" value={content.values?.heading ?? ''} onChange={(v) => set('values.heading', v)} />
        {values.map((val, i) => (
          <div key={i} className="rounded-xl border border-warm-100 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-warm-600">Waarde {i + 1}</span>
              <RemoveButton onClick={() => set('values.items', values.filter((_, j) => j !== i))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input label="Emoji" value={val.emoji} onChange={(v) => { const vs = [...values]; vs[i] = { ...vs[i], emoji: v }; set('values.items', vs) }} />
              <Input label="Titel" value={val.title} onChange={(v) => { const vs = [...values]; vs[i] = { ...vs[i], title: v }; set('values.items', vs) }} />
              <Input label="Beschrijving" value={val.description} onChange={(v) => { const vs = [...values]; vs[i] = { ...vs[i], description: v }; set('values.items', vs) }} />
            </div>
          </div>
        ))}
        <AddButton label="Waarde toevoegen" onClick={() => set('values.items', [...values, { emoji: '', title: '', description: '' }])} />
      </Section>

      <Section title="Contact">
        <Input label="Titel" value={content.contact?.heading ?? ''} onChange={(v) => set('contact.heading', v)} />
        <Input label="Beschrijving" value={content.contact?.description ?? ''} onChange={(v) => set('contact.description', v)} />
        <Input label="E-mailadres" value={content.contact?.email ?? ''} onChange={(v) => set('contact.email', v)} />
      </Section>
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FaqEditor({ content, set }: { content: any; set: (path: string, value: any) => void }) {
  const sections: { title: string; items: { question: string; answer: string }[] }[] = content.sections ?? []

  return (
    <>
      <Section title="Pagina heading" defaultOpen>
        <Input label="Titel" value={content.heading ?? ''} onChange={(v) => set('heading', v)} />
        <Input label="Subtitel" value={content.subheading ?? ''} onChange={(v) => set('subheading', v)} />
      </Section>

      {sections.map((section, si) => (
        <Section key={si} title={section.title || `Sectie ${si + 1}`}>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input label="Sectie titel" value={section.title} onChange={(v) => { const s = [...sections]; s[si] = { ...s[si], title: v }; set('sections', s) }} />
            </div>
            <RemoveButton onClick={() => set('sections', sections.filter((_, j) => j !== si))} />
          </div>

          {section.items.map((item, qi) => (
            <div key={qi} className="rounded-xl border border-warm-100 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-warm-600">Vraag {qi + 1}</span>
                <RemoveButton onClick={() => {
                  const s = [...sections]
                  s[si] = { ...s[si], items: s[si].items.filter((_, j) => j !== qi) }
                  set('sections', s)
                }} />
              </div>
              <div className="space-y-3">
                <Input label="Vraag" value={item.question} onChange={(v) => {
                  const s = [...sections]
                  const items = [...s[si].items]
                  items[qi] = { ...items[qi], question: v }
                  s[si] = { ...s[si], items }
                  set('sections', s)
                }} />
                <Textarea label="Antwoord" value={item.answer} onChange={(v) => {
                  const s = [...sections]
                  const items = [...s[si].items]
                  items[qi] = { ...items[qi], answer: v }
                  s[si] = { ...s[si], items }
                  set('sections', s)
                }} rows={3} />
              </div>
            </div>
          ))}

          <AddButton label="Vraag toevoegen" onClick={() => {
            const s = [...sections]
            s[si] = { ...s[si], items: [...s[si].items, { question: '', answer: '' }] }
            set('sections', s)
          }} />
        </Section>
      ))}

      <AddButton label="Sectie toevoegen" onClick={() => set('sections', [...sections, { title: '', items: [] }])} />

      <Section title="Contact CTA">
        <Input label="Titel" value={content.contact?.heading ?? ''} onChange={(v) => set('contact.heading', v)} />
        <Input label="Beschrijving" value={content.contact?.description ?? ''} onChange={(v) => set('contact.description', v)} />
        <Input label="Knop tekst" value={content.contact?.buttonLabel ?? ''} onChange={(v) => set('contact.buttonLabel', v)} />
        <Input label="E-mailadres" value={content.contact?.email ?? ''} onChange={(v) => set('contact.email', v)} />
      </Section>
    </>
  )
}
