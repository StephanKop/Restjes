import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { SearchInput } from '@/components/SearchInput'
import { FilterSelect } from '@/components/FilterSelect'
import { Pagination } from '@/components/Pagination'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Gerechten',
}

const PAGE_SIZE = 20

interface DishesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function DishesTable({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createAdminClient()
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const query = searchParams.q?.trim()
  const statusFilter = searchParams.status

  let dbQuery = supabase
    .from('dishes')
    .select(
      'id, title, status, quantity_available, is_vegetarian, is_vegan, image_url, created_at, pickup_start, pickup_end, merchant:merchants!inner(id, business_name)',
      { count: 'exact' },
    )

  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`)
  }
  if (statusFilter) {
    dbQuery = dbQuery.eq('status', statusFilter as 'available' | 'reserved' | 'collected' | 'expired')
  }

  const { data: dishes, count } = await dbQuery
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const searchParamsObj: Record<string, string> = {}
  if (query) searchParamsObj.q = query
  if (statusFilter) searchParamsObj.status = statusFilter

  return (
    <>
      <div className="overflow-x-auto rounded-xl bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-warm-100 text-xs font-semibold uppercase tracking-wider text-warm-500">
              <th className="px-5 py-3">Gerecht</th>
              <th className="px-5 py-3">Aanbieder</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Aantal</th>
              <th className="px-5 py-3">Dieet</th>
              <th className="px-5 py-3">Aangemaakt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-50">
            {(dishes ?? []).map((dish) => {
              const merchant = dish.merchant as unknown as { id: string; business_name: string }
              return (
                <tr key={dish.id} className="transition-colors hover:bg-warm-50">
                  <td className="px-5 py-3">
                    <Link href={`/dishes/${dish.id}`} className="flex items-center gap-3">
                      {dish.image_url ? (
                        <Image src={dish.image_url} alt={dish.title} width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-100 text-warm-300">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 3h18M3 3v18m0-18 3.75 3.75M21 3v18m0-18-3.75 3.75M3 21h18" />
                          </svg>
                        </div>
                      )}
                      <span className="font-medium text-warm-800 hover:text-brand-600">{dish.title}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/merchants/${merchant.id}`} className="text-warm-600 hover:text-brand-600">
                      {merchant.business_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={dish.status} type="dish" />
                  </td>
                  <td className="px-5 py-3 text-warm-600">{dish.quantity_available}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {dish.is_vegetarian && (
                        <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">Vega</span>
                      )}
                      {dish.is_vegan && (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">Vegan</span>
                      )}
                      {!dish.is_vegetarian && !dish.is_vegan && (
                        <span className="text-warm-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-warm-500">{formatDate(dish.created_at)}</td>
                </tr>
              )
            })}
            {(!dishes || dishes.length === 0) && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-warm-400">
                  {query || statusFilter ? 'Geen gerechten gevonden' : 'Geen gerechten'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/dishes"
        searchParams={searchParamsObj}
      />
    </>
  )
}

export default async function DishesPage({ searchParams }: DishesPageProps) {
  const params = await searchParams
  const flatParams: Record<string, string | undefined> = {}
  for (const [key, val] of Object.entries(params)) {
    flatParams[key] = Array.isArray(val) ? val[0] : val
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">Gerechten</h1>
        <p className="text-sm text-warm-500">Bekijk en beheer alle gerechten op het platform</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-72">
          <Suspense>
            <SearchInput placeholder="Zoek op titel..." />
          </Suspense>
        </div>
        <Suspense>
          <FilterSelect
            paramName="status"
            defaultLabel="Alle statussen"
            options={[
              { value: 'available', label: 'Beschikbaar' },
              { value: 'reserved', label: 'Gereserveerd' },
              { value: 'collected', label: 'Opgehaald' },
              { value: 'expired', label: 'Verlopen' },
            ]}
          />
        </Suspense>
      </div>

      <Suspense fallback={<div className="rounded-xl bg-white p-8 text-center text-warm-400 shadow-card">Laden...</div>}>
        <DishesTable searchParams={flatParams} />
      </Suspense>
    </div>
  )
}
