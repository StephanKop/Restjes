// Shared building blocks for article bodies. Keeping styling here so
// individual article files stay focused on content.
import Link from 'next/link'
import type { ReactNode } from 'react'

export function P({ children }: { children: ReactNode }) {
  return <p className="mb-5 leading-relaxed text-warm-700">{children}</p>
}

export function H2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mb-4 mt-10 scroll-mt-24 text-2xl font-extrabold text-warm-900 sm:text-3xl">
      {children}
    </h2>
  )
}

export function H3({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3 id={id} className="mb-3 mt-6 scroll-mt-24 text-xl font-bold text-warm-900">
      {children}
    </h3>
  )
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="mb-5 ml-5 list-disc space-y-2 leading-relaxed text-warm-700 marker:text-brand-500">{children}</ul>
}

export function OL({ children }: { children: ReactNode }) {
  return <ol className="mb-5 ml-5 list-decimal space-y-2 leading-relaxed text-warm-700 marker:font-bold marker:text-brand-600">{children}</ol>
}

export function LI({ children }: { children: ReactNode }) {
  return <li className="pl-1">{children}</li>
}

export function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-bold text-warm-900">{children}</strong>
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  const isExternal = /^https?:\/\//.test(href)
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-brand-600 underline decoration-brand-200 underline-offset-2 transition-colors hover:text-brand-700 hover:decoration-brand-400"
      >
        {children}
      </a>
    )
  }
  return (
    <Link
      href={href}
      className="font-semibold text-brand-600 underline decoration-brand-200 underline-offset-2 transition-colors hover:text-brand-700 hover:decoration-brand-400"
    >
      {children}
    </Link>
  )
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <aside className="mb-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 text-warm-700">
      {children}
    </aside>
  )
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <p className="text-3xl font-extrabold text-brand-600 sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-warm-500">{label}</p>
    </div>
  )
}
