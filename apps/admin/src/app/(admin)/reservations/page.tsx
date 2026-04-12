import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { SearchInput } from '@/components/SearchInput'
import { FilterSelect } from '@/components/FilterSelect'
import { Pagination } from '@/components/Pagination'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDateTime } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Reserveringen',
}

const PAGE_SIZE = 20

interface ReservationsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function ReservationsTable({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createAdminClient()
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const query = searchParams.q?.trim()
  const statusFilter = searchParams.status

  let dbQuery = supabase
    .from('reservations')
    .select(
      `id, status, quantity, notes, pickup_time, created_at,
       dish:dishes!inner(id, title),
       consumer:profiles!reservations_consumer_id_fkey(id, display_name),
       merchant:merchants!inner(id, business_name)`,
      { count: 'exact' },
    )

  if (statusFilter) {
    dbQuery = dbQuery.eq('status', statusFilter as 'pending' | 'confirmed' | 'collected' | 'cancelled' | 'no_show')
  }

  const { data: reservations, count } = await dbQuery
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  // Client-side filter by search query on dish title or consumer name
  let filtered = reservations ?? []
  if (query) {
    const q = query.toLowerCase()
    filtered = filtered.filter((r) => {
      const dish = r.dish as unknown as { title: string }
      const consumer = r.consumer as unknown as { display_name: string | null } | null
      return dish.title.toLowerCase().includes(q) || (consumer?.display_name ?? '').toLowerCase().includes(q)
    })
  }

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
              <th className="px-5 py-3">Klant</th>
              <th className="px-5 py-3">Aanbieder</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Aantal</th>
              <th className="px-5 py-3">Aangemaakt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-50">
            {filtered.map((res) => {
              const dish = res.dish as unknown as { id: string; title: string }
              const consumer = res.consumer as unknown as { id: string; display_name: string | null } | null
              const merchant = res.merchant as unknown as { id: string; business_name: string }
              return (
                <tr key={res.id} className="transition-colors hover:bg-warm-50">
                  <td className="px-5 py-3">
                    <Link href={`/reservations/${res.id}`} className="font-medium text-warm-800 hover:text-brand-600">
                      {dish.title}
                    </Link>
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
                  <td className="px-5 py-3">
                    <StatusBadge status={res.status} type="reservation" />
                  </td>
                  <td className="px-5 py-3 text-warm-600">{res.quantity}x</td>
                  <td className="px-5 py-3 text-warm-500">{formatDateTime(res.created_at)}</td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-warm-400">
                  {query || statusFilter ? 'Geen reserveringen gevonden' : 'Geen reserveringen'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/reservations"
        searchParams={searchParamsObj}
      />
    </>
  )
}

export default async function ReservationsPage({ searchParams }: ReservationsPageProps) {
  const params = await searchParams
  const flatParams: Record<string, string | undefined> = {}
  for (const [key, val] of Object.entries(params)) {
    flatParams[key] = Array.isArray(val) ? val[0] : val
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">Reserveringen</h1>
        <p className="text-sm text-warm-500">Bekijk en beheer alle reserveringen</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-72">
          <Suspense>
            <SearchInput placeholder="Zoek op gerecht of klant..." />
          </Suspense>
        </div>
        <Suspense>
          <FilterSelect
            paramName="status"
            defaultLabel="Alle statussen"
            options={[
              { value: 'pending', label: 'In afwachting' },
              { value: 'confirmed', label: 'Bevestigd' },
              { value: 'collected', label: 'Opgehaald' },
              { value: 'cancelled', label: 'Geannuleerd' },
              { value: 'no_show', label: 'Niet opgehaald' },
            ]}
          />
        </Suspense>
      </div>

      <Suspense fallback={<div className="rounded-xl bg-white p-8 text-center text-warm-400 shadow-card">Laden...</div>}>
        <ReservationsTable searchParams={flatParams} />
      </Suspense>
    </div>
  )
}
