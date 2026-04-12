import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold text-warm-900">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Actieve gerechten', value: '0', color: 'bg-brand-50 text-brand-700' },
          { label: 'Openstaande reserveringen', value: '0', color: 'bg-amber-50 text-amber-700' },
          { label: 'Ongelezen berichten', value: '0', color: 'bg-blue-50 text-blue-700' },
        ].map((stat) => (
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
        <h2 className="mb-2 text-xl font-bold text-warm-900">Welkom bij Kliekjesclub!</h2>
        <p className="text-warm-500">
          Begin met het plaatsen van je eerste restje. Zo help je voedselverspilling tegen te gaan.
        </p>
      </div>
    </div>
  )
}
