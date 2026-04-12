import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase-admin'
import { SearchInput } from '@/components/SearchInput'
import { Pagination } from '@/components/Pagination'
import { formatDate } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Gebruikers',
}

const PAGE_SIZE = 20

interface UsersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function UsersTable({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createAdminClient()
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const query = searchParams.q?.trim()

  let dbQuery = supabase
    .from('profiles')
    .select('id, display_name, city, phone, created_at, updated_at', { count: 'exact' })

  if (query) {
    dbQuery = dbQuery.ilike('display_name', `%${query}%`)
  }

  const { data: profiles, count } = await dbQuery
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  // Check which users are merchants
  const profileIds = (profiles ?? []).map((p) => p.id)
  const { data: merchants } = profileIds.length > 0
    ? await supabase.from('merchants').select('profile_id, business_name').in('profile_id', profileIds)
    : { data: [] }

  const merchantMap = new Map((merchants ?? []).map((m) => [m.profile_id, m.business_name]))

  // Get auth user emails
  const { data: authData } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
  const emailMap = new Map((authData?.users ?? []).map((u) => [u.id, u.email]))

  const searchParamsObj: Record<string, string> = {}
  if (query) searchParamsObj.q = query

  return (
    <>
      <div className="overflow-x-auto rounded-xl bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-warm-100 text-xs font-semibold uppercase tracking-wider text-warm-500">
              <th className="px-5 py-3">Naam</th>
              <th className="px-5 py-3">E-mail</th>
              <th className="px-5 py-3">Stad</th>
              <th className="px-5 py-3">Aanbieder</th>
              <th className="px-5 py-3">Aangemeld</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-50">
            {(profiles ?? []).map((profile) => (
              <tr key={profile.id} className="transition-colors hover:bg-warm-50">
                <td className="px-5 py-3">
                  <Link href={`/users/${profile.id}`} className="font-medium text-warm-800 hover:text-brand-600">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        {(profile.display_name ?? '?').charAt(0).toUpperCase()}
                      </div>
                      {profile.display_name}
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-3 text-warm-600">{emailMap.get(profile.id) ?? '-'}</td>
                <td className="px-5 py-3 text-warm-600">{profile.city ?? '-'}</td>
                <td className="px-5 py-3">
                  {merchantMap.has(profile.id) ? (
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                      {merchantMap.get(profile.id)}
                    </span>
                  ) : (
                    <span className="text-warm-400">-</span>
                  )}
                </td>
                <td className="px-5 py-3 text-warm-500">{formatDate(profile.created_at)}</td>
              </tr>
            ))}
            {(!profiles || profiles.length === 0) && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-warm-400">
                  {query ? 'Geen gebruikers gevonden' : 'Geen gebruikers'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/users"
        searchParams={searchParamsObj}
      />
    </>
  )
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams
  const flatParams: Record<string, string | undefined> = {}
  for (const [key, val] of Object.entries(params)) {
    flatParams[key] = Array.isArray(val) ? val[0] : val
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">Gebruikers</h1>
          <p className="text-sm text-warm-500">Beheer alle gebruikersaccounts</p>
        </div>
      </div>

      <div className="mb-4 max-w-sm">
        <Suspense>
          <SearchInput placeholder="Zoek op naam..." />
        </Suspense>
      </div>

      <Suspense fallback={<div className="rounded-xl bg-white p-8 text-center text-warm-400 shadow-card">Laden...</div>}>
        <UsersTable searchParams={flatParams} />
      </Suspense>
    </div>
  )
}
