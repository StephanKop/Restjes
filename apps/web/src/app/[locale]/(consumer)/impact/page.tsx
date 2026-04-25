import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { localeMeta, type Locale } from '@kliekjesclub/i18n'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { Button } from '@/components/ui/Button'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('impact')
  return {
    title: t('webMetadataTitle'),
    description: t('webMetadataDescription'),
    alternates: { canonical: '/impact' },
  }
}

// Conservative per-meal estimates — aligned with Too Good To Go / FAO averages.
// 1 meal saved ≈ 500g food ≈ 1.25 kg CO₂-eq ≈ ~1000 L water footprint.
const CO2_PER_MEAL_KG = 1.25
const WATER_PER_MEAL_L = 1000

const MONTH_KEYS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
] as const

type MonthBucket = { labelKey: (typeof MONTH_KEYS)[number]; key: string; count: number }

function buildMonthBuckets(
  rows: { created_at: string; quantity: number }[],
  monthsBack = 6,
): MonthBucket[] {
  const now = new Date()
  const buckets: MonthBucket[] = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets.push({ labelKey: MONTH_KEYS[d.getMonth()], key, count: 0 })
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
  const locale = (await getLocale()) as Locale
  const user = await getUser()
  if (!user) {
    redirect('/login', locale)
    return null
  }

  const t = await getTranslations('impact')
  const dateLocale = localeMeta[locale]?.htmlLang ?? 'nl-NL'

  const formatNumber = (n: number, digits = 0): string =>
    n.toLocaleString(dateLocale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })

  const supabase = await createServerComponentClient()
  const { data } = await supabase
    .from('reservations')
    .select('quantity, created_at')
    .eq('consumer_id', user.id)
    .eq('status', 'collected')

  const rows = data ?? []
  const totalMeals = rows.reduce((sum, r) => sum + (r.quantity || 0), 0)
  const totalCo2Kg = totalMeals * CO2_PER_MEAL_KG
  const totalWaterL = totalMeals * WATER_PER_MEAL_L
  const buckets = buildMonthBuckets(rows, 6)
  const maxBucket = Math.max(1, ...buckets.map((b) => b.count))

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-extrabold text-warm-900">{t('title')}</h1>
        <p className="text-warm-500">
          {t('webSubtitle')}
        </p>
      </header>

      {totalMeals === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-card">
          <h2 className="mb-2 text-xl font-bold text-warm-900">
            {t('emptyTitle')}
          </h2>
          <p className="mb-6 text-warm-500">
            {t('emptyBodyDetailed')}
          </p>
          <Link href="/browse">
            <Button variant="primary">{t('emptyCta')}</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <p className="text-sm font-semibold text-warm-500">{t('mealsSaved')}</p>
              <p className="mt-1 text-3xl font-extrabold text-warm-900">
                {formatNumber(totalMeals)}
              </p>
              <p className="mt-1 text-xs text-warm-400">{t('mealsSubtext')}</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <p className="text-sm font-semibold text-warm-500">{t('co2Saved')}</p>
              <p className="mt-1 text-3xl font-extrabold text-brand-600">
                {formatNumber(totalCo2Kg, 1)} kg
              </p>
              <p className="mt-1 text-xs text-warm-400">
                {t('webCo2Equivalent', { grams: formatNumber(totalCo2Kg * 1000) })}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <p className="text-sm font-semibold text-warm-500">{t('waterSaved')}</p>
              <p className="mt-1 text-3xl font-extrabold text-blue-600">
                {formatNumber(totalWaterL / 1000, 1)} m³
              </p>
              <p className="mt-1 text-xs text-warm-400">
                {t('webWaterLiters', { liters: formatNumber(totalWaterL) })}
              </p>
            </div>
          </div>

          <section className="mb-8 rounded-2xl bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-bold text-warm-900">
              {t('mealsPerMonth')}
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
                      {t(`months.${b.labelKey}`)}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          <p className="text-xs text-warm-400">
            {t('footnote')}
          </p>
        </>
      )}
    </div>
  )
}
