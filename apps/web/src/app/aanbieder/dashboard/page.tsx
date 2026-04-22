import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('aanbieder.web')
  return { title: t('dashboardMetadataTitle') }
}

export default async function DashboardPage() {
  const t = await getTranslations('aanbieder.web')

  const stats = [
    { label: t('stats.activeDishes'), value: '0', color: 'bg-brand-50 text-brand-700' },
    { label: t('stats.pendingReservations'), value: '0', color: 'bg-amber-50 text-amber-700' },
    { label: t('stats.unreadMessages'), value: '0', color: 'bg-blue-50 text-blue-700' },
  ]

  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold text-warm-900">{t('dashboardHeading')}</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-6 shadow-card">
            <p className="mb-1 text-sm font-semibold text-warm-500">{stat.label}</p>
            <p className={`text-3xl font-extrabold ${stat.color} inline-block rounded-xl px-3 py-1`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-card">
        <p className="mb-2 text-4xl">👨‍🍳</p>
        <h2 className="mb-2 text-xl font-bold text-warm-900">{t('welcomeHeading')}</h2>
        <p className="text-warm-500">
          {t('welcomeBody')}
        </p>
      </div>
    </div>
  )
}
