import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { SearchInput } from '@/components/SearchInput'
import { FilterSelect } from '@/components/FilterSelect'
import { Pagination } from '@/components/Pagination'
import { formatDate } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Aanbieders',
}

const PAGE_SIZE = 20

interface MerchantsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function MerchantsTable({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createAdminClient()
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const query = searchParams.q?.trim()
  const verifiedFilter = searchParams.verified

  let dbQuery = supabase
    .from('merchants')
    .select(
      'id, business_name, city, is_verified, avg_rating, review_count, created_at, profile:profiles!merchants_profile_id_fkey(display_name)',
      { count: 'exact' },
    )

  if (query) {
    dbQuery = dbQuery.ilike('business_name', `%${query}%`)
  }
  if (verifiedFilter === 'true') {
    dbQuery = dbQuery.eq('is_verified', true)
  } else if (verifiedFilter === 'false') {
    dbQuery = dbQuery.eq('is_verified', false)
  }

  const { data: merchants, count } = await dbQuery
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  // Count dishes per merchant
  const merchantIds = (merchants ?? []).map((m) => m.id)
  const { data: dishCounts } = merchantIds.length > 0
    ? await supabase
        .from('dishes')
        .select('merchant_id')
        .in('merchant_id', merchantIds)
        .eq('status', 'available')
    : { data: [] }

  const dishCountMap = new Map<string, number>()
  for (const d of dishCounts ?? []) {
    dishCountMap.set(d.merchant_id, (dishCountMap.get(d.merchant_id) ?? 0) + 1)
  }

  const searchParamsObj: Record<string, string> = {}
  if (query) searchParamsObj.q = query
  if (verifiedFilter) searchParamsObj.verified = verifiedFilter

  return (
    <>
      <div className="overflow-x-auto rounded-xl bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-warm-100 text-xs font-semibold uppercase tracking-wider text-warm-500">
              <th className="px-5 py-3">Bedrijf</th>
              <th className="px-5 py-3">Eigenaar</th>
              <th className="px-5 py-3">Stad</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Beoordeling</th>
              <th className="px-5 py-3">Actieve gerechten</th>
              <th className="px-5 py-3">Aangemeld</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-50">
            {(merchants ?? []).map((merchant) => {
              const profile = merchant.profile as unknown as { display_name: string } | null
              return (
                <tr key={merchant.id} className="transition-colors hover:bg-warm-50">
                  <td className="px-5 py-3">
                    <Link href={`/merchants/${merchant.id}`} className="font-medium text-warm-800 hover:text-brand-600">
                      {merchant.business_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-warm-600">{profile?.display_name ?? '-'}</td>
                  <td className="px-5 py-3 text-warm-600">{merchant.city ?? '-'}</td>
                  <td className="px-5 py-3">
                    {merchant.is_verified ? (
                      <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Geverifieerd</span>
                    ) : (
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Niet geverifieerd</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {merchant.review_count > 0 ? (
                      <span className="flex items-center gap-1 text-warm-700">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-yellow-400">
                          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                        </svg>
                        {Number(merchant.avg_rating).toFixed(1)} ({merchant.review_count})
                      </span>
                    ) : (
                      <span className="text-warm-400">-</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-warm-600">{dishCountMap.get(merchant.id) ?? 0}</td>
                  <td className="px-5 py-3 text-warm-500">{formatDate(merchant.created_at)}</td>
                </tr>
              )
            })}
            {(!merchants || merchants.length === 0) && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-warm-400">
                  {query ? 'Geen aanbieders gevonden' : 'Geen aanbieders'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/merchants"
        searchParams={searchParamsObj}
      />
    </>
  )
}

export default async function MerchantsPage({ searchParams }: MerchantsPageProps) {
  const params = await searchParams
  const flatParams: Record<string, string | undefined> = {}
  for (const [key, val] of Object.entries(params)) {
    flatParams[key] = Array.isArray(val) ? val[0] : val
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">Aanbieders</h1>
        <p className="text-sm text-warm-500">Beheer alle aanbiederprofielen en verificatie</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-72">
          <Suspense>
            <SearchInput placeholder="Zoek op bedrijfsnaam..." />
          </Suspense>
        </div>
        <Suspense>
          <FilterSelect
            paramName="verified"
            defaultLabel="Alle statussen"
            options={[
              { value: 'true', label: 'Geverifieerd' },
              { value: 'false', label: 'Niet geverifieerd' },
            ]}
          />
        </Suspense>
      </div>

      <Suspense fallback={<div className="rounded-xl bg-white p-8 text-center text-warm-400 shadow-card">Laden...</div>}>
        <MerchantsTable searchParams={flatParams} />
      </Suspense>
    </div>
  )
}
