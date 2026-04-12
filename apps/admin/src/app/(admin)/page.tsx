import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-admin'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { formatRelativeDate } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const supabase = createAdminClient()

  // Fetch all stats in parallel
  const [
    { count: totalUsers },
    { count: totalMerchants },
    { count: totalDishes },
    { count: totalReservations },
    { count: activeDishes },
    { count: pendingReservations },
    { count: verifiedMerchants },
    { count: totalReviews },
    { count: newUsersThisWeek },
    { count: reservationsThisWeek },
    { data: recentReservations },
    { data: recentMerchants },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('merchants').select('id', { count: 'exact', head: true }),
    supabase.from('dishes').select('id', { count: 'exact', head: true }),
    supabase.from('reservations').select('id', { count: 'exact', head: true }),
    supabase.from('dishes').select('id', { count: 'exact', head: true }).eq('status', 'available'),
    supabase.from('reservations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('merchants').select('id', { count: 'exact', head: true }).eq('is_verified', true),
    supabase.from('reviews').select('id', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('reservations')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('reservations')
      .select(`
        id, status, created_at, quantity,
        dish:dishes!inner(title),
        consumer:profiles!reservations_consumer_id_fkey(display_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('merchants')
      .select('id, business_name, city, is_verified, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('profiles')
      .select('id, display_name, city, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">Dashboard</h1>
        <p className="text-sm text-warm-500">Overzicht van het Kliekjesclub platform</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gebruikers"
          value={totalUsers ?? 0}
          subtitle={`+${newUsersThisWeek ?? 0} deze week`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          }
        />
        <StatCard
          label="Aanbieders"
          value={totalMerchants ?? 0}
          subtitle={`${verifiedMerchants ?? 0} geverifieerd`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
          }
        />
        <StatCard
          label="Actieve gerechten"
          value={activeDishes ?? 0}
          subtitle={`${totalDishes ?? 0} totaal`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M16.5 8.25V4.125a2.625 2.625 0 0 0-2.625-2.625h-3.75A2.625 2.625 0 0 0 7.5 4.125V8.25" />
            </svg>
          }
        />
        <StatCard
          label="Reserveringen"
          value={totalReservations ?? 0}
          subtitle={`${pendingReservations ?? 0} in afwachting · +${reservationsThisWeek ?? 0} deze week`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
          }
        />
      </div>

      {/* Additional stats row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Beoordelingen"
          value={totalReviews ?? 0}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
          }
        />
        <div className="rounded-xl bg-white p-5 shadow-card">
          <p className="text-sm font-medium text-warm-500">Snelle links</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/merchants?verified=false" className="rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100">
              Ongecontroleerde aanbieders
            </Link>
            <Link href="/reservations?status=pending" className="rounded-lg bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-100">
              Openstaande reserveringen
            </Link>
            <Link href="/dishes?status=expired" className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100">
              Verlopen gerechten
            </Link>
          </div>
        </div>
      </div>

      {/* Recent activity tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Reservations */}
        <div className="rounded-xl bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-warm-100 px-5 py-4">
            <h2 className="font-bold text-warm-900">Recente reserveringen</h2>
            <Link href="/reservations" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Alles bekijken
            </Link>
          </div>
          <div className="divide-y divide-warm-50">
            {(recentReservations ?? []).map((res) => {
              const dish = res.dish as unknown as { title: string }
              const consumer = res.consumer as unknown as { display_name: string | null } | null
              return (
                <Link
                  key={res.id}
                  href={`/reservations/${res.id}`}
                  className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-warm-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-warm-800">{dish.title}</p>
                    <p className="text-xs text-warm-500">
                      {consumer?.display_name ?? 'Onbekend'} · {res.quantity}x · {formatRelativeDate(res.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={res.status} type="reservation" />
                </Link>
              )
            })}
            {(!recentReservations || recentReservations.length === 0) && (
              <p className="px-5 py-4 text-sm text-warm-400">Geen reserveringen</p>
            )}
          </div>
        </div>

        {/* Recent Merchants */}
        <div className="rounded-xl bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-warm-100 px-5 py-4">
            <h2 className="font-bold text-warm-900">Nieuwe aanbieders</h2>
            <Link href="/merchants" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Alles bekijken
            </Link>
          </div>
          <div className="divide-y divide-warm-50">
            {(recentMerchants ?? []).map((merchant) => (
              <Link
                key={merchant.id}
                href={`/merchants/${merchant.id}`}
                className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-warm-50"
              >
                <div>
                  <p className="text-sm font-medium text-warm-800">{merchant.business_name}</p>
                  <p className="text-xs text-warm-500">
                    {merchant.city ?? 'Geen stad'} · {formatRelativeDate(merchant.created_at)}
                  </p>
                </div>
                {merchant.is_verified ? (
                  <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Geverifieerd</span>
                ) : (
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Niet geverifieerd</span>
                )}
              </Link>
            ))}
            {(!recentMerchants || recentMerchants.length === 0) && (
              <p className="px-5 py-4 text-sm text-warm-400">Geen aanbieders</p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-xl bg-white shadow-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-warm-100 px-5 py-4">
            <h2 className="font-bold text-warm-900">Nieuwe gebruikers</h2>
            <Link href="/users" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Alles bekijken
            </Link>
          </div>
          <div className="divide-y divide-warm-50">
            {(recentUsers ?? []).map((user) => (
              <Link
                key={user.id}
                href={`/users/${user.id}`}
                className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-warm-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {(user.display_name ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warm-800">{user.display_name}</p>
                    <p className="text-xs text-warm-500">{user.city ?? 'Geen stad'}</p>
                  </div>
                </div>
                <span className="text-xs text-warm-400">{formatRelativeDate(user.created_at)}</span>
              </Link>
            ))}
            {(!recentUsers || recentUsers.length === 0) && (
              <p className="px-5 py-4 text-sm text-warm-400">Geen gebruikers</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
