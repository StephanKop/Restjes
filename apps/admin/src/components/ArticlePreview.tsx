import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import rehypeSlug from 'rehype-slug'
import { visit } from 'unist-util-visit'

// Mirror of apps/web/src/components/ArticleBody.tsx — duplicated here because
// admin doesn't have the i18n-aware Link primitive and we want a self-contained
// preview without adding next-intl to the admin bundle.

function Callout({ children }: { children: ReactNode }) {
  return (
    <aside className="mb-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 text-warm-700">
      {children}
    </aside>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <p className="text-3xl font-extrabold text-brand-600 sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-warm-500">{label}</p>
    </div>
  )
}

function remarkArticleDirectives() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (
        node.type !== 'containerDirective' &&
        node.type !== 'leafDirective' &&
        node.type !== 'textDirective'
      ) {
        return
      }
      const data = node.data ?? (node.data = {})
      if (node.name === 'callout') {
        data.hName = 'kc-callout'
      } else if (node.name === 'stats') {
        data.hName = 'kc-stats'
      } else if (node.name === 'stat') {
        data.hName = 'kc-stat'
        data.hProperties = { ...(node.attributes ?? {}) }
      }
    })
  }
}

export function ArticlePreview({ markdown }: { markdown: string }) {
  if (!markdown.trim()) {
    return (
      <p className="text-sm italic text-warm-400">Geen body — typ markdown om een preview te zien.</p>
    )
  }
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkDirective, remarkArticleDirectives]}
      rehypePlugins={[rehypeSlug]}
      components={{
        p: ({ children }) => <p className="mb-5 leading-relaxed text-warm-700">{children}</p>,
        h2: ({ children, id }) => (
          <h2 id={id} className="mb-4 mt-10 scroll-mt-24 text-2xl font-extrabold text-warm-900 sm:text-3xl">
            {children}
          </h2>
        ),
        h3: ({ children, id }) => (
          <h3 id={id} className="mb-3 mt-6 scroll-mt-24 text-xl font-bold text-warm-900">{children}</h3>
        ),
        ul: ({ children }) => (
          <ul className="mb-5 ml-5 list-disc space-y-2 leading-relaxed text-warm-700 marker:text-brand-500">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-5 ml-5 list-decimal space-y-2 leading-relaxed text-warm-700 marker:font-bold marker:text-brand-600">{children}</ol>
        ),
        li: ({ children }) => <li className="pl-1">{children}</li>,
        strong: ({ children }) => <strong className="font-bold text-warm-900">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        a: ({ href, children }) => (
          <a
            href={href}
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="font-semibold text-brand-600 underline decoration-brand-200 underline-offset-2 transition-colors hover:text-brand-700 hover:decoration-brand-400"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-6 border-l-4 border-brand-300 bg-warm-50 px-5 py-3 italic text-warm-700">{children}</blockquote>
        ),
        table: ({ children }) => (
          <div className="mb-6 overflow-x-auto rounded-2xl bg-white shadow-card">
            <table className="w-full text-left text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="border-b border-warm-100 bg-warm-50">{children}</thead>,
        tbody: ({ children }) => <tbody className="divide-y divide-warm-100">{children}</tbody>,
        tr: ({ children }) => <tr>{children}</tr>,
        th: ({ children }) => <th className="px-4 py-3 font-bold text-warm-900">{children}</th>,
        td: ({ children }) => <td className="px-4 py-3">{children}</td>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ['kc-callout' as any]: ({ children }: { children: ReactNode }) => <Callout>{children}</Callout>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ['kc-stats' as any]: ({ children }: { children: ReactNode }) => (
          <div className="mb-6 grid gap-4 sm:grid-cols-3">{children}</div>
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ['kc-stat' as any]: ({ value, label }: { value?: string; label?: string }) => (
          <Stat value={value ?? ''} label={label ?? ''} />
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  )
}
