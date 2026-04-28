import { Fragment } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import rehypeSlug from 'rehype-slug'
import { visit } from 'unist-util-visit'
import type { ReactNode } from 'react'
import { Link } from '@/i18n/navigation'

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

// Tiny remark plugin: turn directive nodes (`:::callout`, `:::stats`, `::stat`)
// into named hast elements so they can be mapped via react-markdown's
// `components` prop. Unknown directives pass through untouched.
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
        data.hProperties = {
          ...(node.attributes ?? {}),
        }
      }
    })
  }
}

interface ArticleBodyProps {
  markdown: string
}

/**
 * Renders article markdown with the same prose styling as the original
 * hand-coded TSX articles. Supports:
 * - Standard markdown (paragraphs, headings, lists, bold, links).
 * - GFM extensions (tables, strikethrough).
 * - `:::callout`...`:::` blocks → renders as `<Callout>`.
 * - Auto-generated heading IDs for in-page anchor links.
 */
export function ArticleBody({ markdown }: ArticleBodyProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkDirective, remarkArticleDirectives]}
      rehypePlugins={[rehypeSlug]}
      components={{
        p: ({ children }) => (
          <p className="mb-5 leading-relaxed text-warm-700">{children}</p>
        ),
        h2: ({ children, id }) => (
          <h2
            id={id}
            className="mb-4 mt-10 scroll-mt-24 text-2xl font-extrabold text-warm-900 sm:text-3xl"
          >
            {children}
          </h2>
        ),
        h3: ({ children, id }) => (
          <h3
            id={id}
            className="mb-3 mt-6 scroll-mt-24 text-xl font-bold text-warm-900"
          >
            {children}
          </h3>
        ),
        ul: ({ children }) => (
          <ul className="mb-5 ml-5 list-disc space-y-2 leading-relaxed text-warm-700 marker:text-brand-500">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-5 ml-5 list-decimal space-y-2 leading-relaxed text-warm-700 marker:font-bold marker:text-brand-600">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="pl-1">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-bold text-warm-900">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        a: ({ href, children }) => {
          if (!href) return <Fragment>{children}</Fragment>
          const isExternal = /^https?:\/\//.test(href)
          const className =
            'font-semibold text-brand-600 underline decoration-brand-200 underline-offset-2 transition-colors hover:text-brand-700 hover:decoration-brand-400'
          if (isExternal) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
                {children}
              </a>
            )
          }
          // In-app links use the locale-aware Link.
          return (
            <Link href={href} className={className}>
              {children}
            </Link>
          )
        },
        blockquote: ({ children }) => (
          <blockquote className="mb-6 border-l-4 border-brand-300 bg-warm-50 px-5 py-3 italic text-warm-700">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="mb-6 overflow-x-auto rounded-2xl bg-white shadow-card">
            <table className="w-full text-left text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="border-b border-warm-100 bg-warm-50">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-warm-100">{children}</tbody>
        ),
        tr: ({ children }) => <tr>{children}</tr>,
        th: ({ children }) => (
          <th className="px-4 py-3 font-bold text-warm-900">{children}</th>
        ),
        td: ({ children }) => <td className="px-4 py-3">{children}</td>,
        // Custom directives: rendered via aliased element names set by
        // remarkArticleDirectives (`kc-callout`, `kc-stats`, `kc-stat`).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ['kc-callout' as any]: ({ children }: { children: React.ReactNode }) => (
          <Callout>{children}</Callout>
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ['kc-stats' as any]: ({ children }: { children: React.ReactNode }) => (
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
