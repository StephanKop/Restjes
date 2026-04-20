import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Mijn impact',
  description:
    'Bekijk hoeveel voedselverspilling je hebt voorkomen en hoeveel CO₂ en water je hebt bespaard via Kliekjesclub.',
  alternates: { canonical: '/impact' },
}

// Conservative per-meal estimates — aligned with Too Good To Go / FAO averages.
// 1 meal saved ≈ 500g food ≈ 1.25 kg CO₂-eq ≈ ~1000 L water footprint.
const CO2_PER_MEAL_KG = 1.25
const WATER_PER_MEAL_L = 1000

function formatNumber(n: number, digits = 0): string {
  return n.toLocaleString('nl-NL', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

type MonthBucket = { label: string; key: string; count: number }

function buildMonthBuckets(
  rows: { created_at: string; quantity: number }[],
  monthsBack = 6,
): MonthBucket[] {
  const now = new Date()
  const buckets: MonthBucket[] = []
  const MONTH_LABELS = [
    'jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
    'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
  ]
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets.push({ label: MONTH_LABELS[d.getMonth()], key, count: 0 })
  }
  for (const row of rows) {
    const d = new Date(row.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const bucket = buckets.find((b) => b.key === key)
    if (bucket) bucket.count += row.quantity
  }
  return buckets
}

export default async function ImpactPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerComponentClient()
  const { data: reservations } = await supabase
    .from('reservations')
    .select('quantity, created_at')
    .eq('consumer_id', user.id)
    .eq('status', 'collected')

  const rows = reservations ?? []
  const totalMeals = rows.reduce((sum, r) => sum + (r.quantity || 0), 0)
  const totalCo2Kg = totalMeals * CO2_PER_MEAL_KG
  const totalWaterL = totalMeals * WATER_PER_MEAL_L
  const buckets = buildMonthBuckets(rows, 6)
  const maxBucket = Math.max(1, ...buckets.map((b) => b.count))

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-extrabold text-warm-900">Mijn impact</h1>
        <p className="text-warm-500">
          Zie hoeveel voedselverspilling je hebt voorkomen en welke milieuwinst je
          daarmee hebt geboekt.
        </p>
      </header>

      {totalMeals === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-card">
          <h2 className="mb-2 text-xl font-bold text-warm-900">
            Nog geen maaltijden gered
          </h2>
          <p className="mb-6 text-warm-500">
            Zodra je een reservering ophaalt bouwt je impact zich op. Begin met
            ontdekken wat er in jouw buurt beschikbaar is.
          </p>
          <Link href="/browse">
            <Button variant="primary">Bekijk aanbod</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <p className="text-sm font-semibold text-warm-500">Maaltijden gered</p>
              <p className="mt-1 text-3xl font-extrabold text-warm-900">
                {formatNumber(totalMeals)}
              </p>
              <p className="mt-1 text-xs text-warm-400">Opgehaalde reserveringen</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <p className="text-sm font-semibold text-warm-500">CO₂ bespaard</p>
              <p className="mt-1 text-3xl font-extrabold text-brand-600">
                {formatNumber(totalCo2Kg, 1)} kg
              </p>
              <p className="mt-1 text-xs text-warm-400">
                ≈ {formatNumber(totalCo2Kg * 1000)} g CO₂-equivalent
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <p className="text-sm font-semibold text-warm-500">Water bespaard</p>
              <p className="mt-1 text-3xl font-extrabold text-blue-600">
                {formatNumber(totalWaterL / 1000, 1)} m³
              </p>
              <p className="mt-1 text-xs text-warm-400">
                {formatNumber(totalWaterL)} liter
              </p>
            </div>
          </div>

          {/* Monthly bar chart */}
          <section className="mb-8 rounded-2xl bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-bold text-warm-900">
              Maaltijden per maand
            </h2>
            <div className="flex items-end gap-3 h-48">
              {buckets.map((b) => {
                const heightPct = (b.count / maxBucket) * 100
                return (
                  <div key={b.key} className="flex flex-1 flex-col items-center">
                    <div className="relative flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-lg bg-brand-500 transition-all"
                        style={{ height: `${b.count > 0 ? Math.max(heightPct, 4) : 0}%` }}
                      />
                      {b.count > 0 && (
                        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full pb-1 text-xs font-bold text-warm-700">
                          {b.count}
                        </span>
                      )}
                    </div>
                    <span className="mt-2 text-xs font-semibold uppercase text-warm-500">
                      {b.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          <p className="text-xs text-warm-400">
            Schattingen op basis van gemiddelde waarden voor gered voedsel: ≈ 1,25 kg
            CO₂-equivalent en 1.000 liter water per maaltijd.
          </p>
        </>
      )}
    </div>
  )
}
