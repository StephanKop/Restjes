import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { FilterSelect } from '@/components/FilterSelect'
import { Pagination } from '@/components/Pagination'
import { formatDate } from '@/lib/format'
import { DeleteReviewButton } from './DeleteReviewButton'

export const metadata: Metadata = {
  title: 'Beoordelingen',
}

const PAGE_SIZE = 20

interface ReviewsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function ReviewsTable({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createAdminClient()
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const ratingFilter = searchParams.rating

  let dbQuery = supabase
    .from('reviews')
    .select(
      `id, rating, comment, created_at,
       consumer:profiles!reviews_consumer_id_fkey(id, display_name),
       merchant:merchants!inner(id, business_name)`,
      { count: 'exact' },
    )

  if (ratingFilter) {
    dbQuery = dbQuery.eq('rating', parseInt(ratingFilter, 10))
  }

  const { data: reviews, count } = await dbQuery
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const searchParamsObj: Record<string, string> = {}
  if (ratingFilter) searchParamsObj.rating = ratingFilter

  return (
    <>
      <div className="overflow-x-auto rounded-xl bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-warm-100 text-xs font-semibold uppercase tracking-wider text-warm-500">
              <th className="px-5 py-3">Beoordeling</th>
              <th className="px-5 py-3">Opmerking</th>
              <th className="px-5 py-3">Klant</th>
              <th className="px-5 py-3">Aanbieder</th>
              <th className="px-5 py-3">Datum</th>
              <th className="px-5 py-3 text-right">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-50">
            {(reviews ?? []).map((review) => {
              const consumer = review.consumer as unknown as { id: string; display_name: string | null } | null
              const merchant = review.merchant as unknown as { id: string; business_name: string }
              return (
                <tr key={review.id} className="transition-colors hover:bg-warm-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-warm-200'}`}
                        >
                          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                        </svg>
                      ))}
                      <span className="ml-1 text-xs text-warm-500">{review.rating}/5</span>
                    </div>
                  </td>
                  <td className="max-w-xs px-5 py-3">
                    <p className="truncate text-warm-600">{review.comment ?? '-'}</p>
                  </td>
                  <td className="px-5 py-3">
                    {consumer ? (
                      <Link href={`/users/${consumer.id}`} className="text-warm-600 hover:text-brand-600">
                        {consumer.display_name ?? 'Onbekend'}
                      </Link>
                    ) : (
                      <span className="text-warm-400">Onbekend</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/merchants/${merchant.id}`} className="text-warm-600 hover:text-brand-600">
                      {merchant.business_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-warm-500">{formatDate(review.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <DeleteReviewButton reviewId={review.id} />
                  </td>
                </tr>
              )
            })}
            {(!reviews || reviews.length === 0) && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-warm-400">
                  {ratingFilter ? 'Geen beoordelingen gevonden' : 'Geen beoordelingen'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/reviews"
        searchParams={searchParamsObj}
      />
    </>
  )
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const params = await searchParams
  const flatParams: Record<string, string | undefined> = {}
  for (const [key, val] of Object.entries(params)) {
    flatParams[key] = Array.isArray(val) ? val[0] : val
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">Beoordelingen</h1>
        <p className="text-sm text-warm-500">Bekijk en modereer alle beoordelingen</p>
      </div>

      <div className="mb-4">
        <Suspense>
          <FilterSelect
            paramName="rating"
            defaultLabel="Alle beoordelingen"
            options={[
              { value: '5', label: '5 sterren' },
              { value: '4', label: '4 sterren' },
              { value: '3', label: '3 sterren' },
              { value: '2', label: '2 sterren' },
              { value: '1', label: '1 ster' },
            ]}
          />
        </Suspense>
      </div>

      <Suspense fallback={<div className="rounded-xl bg-white p-8 text-center text-warm-400 shadow-card">Laden...</div>}>
        <ReviewsTable searchParams={flatParams} />
      </Suspense>
    </div>
  )
}
