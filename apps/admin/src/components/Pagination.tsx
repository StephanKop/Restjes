import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  searchParams?: Record<string, string>
}

export function Pagination({ currentPage, totalPages, basePath, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    return `${basePath}?${params.toString()}`
  }

  const pages: (number | 'ellipsis')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis')
    }
  }

  return (
    <div className="flex items-center justify-between border-t border-warm-100 px-1 pt-4">
      <p className="text-sm text-warm-500">
        Pagina {currentPage} van {totalPages}
      </p>
      <div className="flex gap-1">
        {currentPage > 1 && (
          <Link
            href={buildHref(currentPage - 1)}
            className="rounded-lg border border-warm-200 px-3 py-1.5 text-sm font-medium text-warm-600 transition-colors hover:bg-warm-50"
          >
            Vorige
          </Link>
        )}
        {pages.map((page, i) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-warm-400">
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={buildHref(page)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-brand-500 text-white'
                  : 'border border-warm-200 text-warm-600 hover:bg-warm-50'
              }`}
            >
              {page}
            </Link>
          ),
        )}
        {currentPage < totalPages && (
          <Link
            href={buildHref(currentPage + 1)}
            className="rounded-lg border border-warm-200 px-3 py-1.5 text-sm font-medium text-warm-600 transition-colors hover:bg-warm-50"
          >
            Volgende
          </Link>
        )}
      </div>
    </div>
  )
}
