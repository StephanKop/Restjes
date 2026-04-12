interface StatCardProps {
  label: string
  value: string | number
  subtitle?: string
  trend?: { value: string; positive: boolean }
  icon: React.ReactNode
}

export function StatCard({ label, value, subtitle, trend, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-warm-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-warm-900">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-warm-400">{subtitle}</p>}
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
              {trend.positive ? '+' : ''}{trend.value}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          {icon}
        </div>
      </div>
    </div>
  )
}
