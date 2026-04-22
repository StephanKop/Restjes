import { useTranslations } from 'next-intl'

type ReservationStatus = 'pending' | 'confirmed' | 'collected' | 'cancelled' | 'no_show'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const statusStyle: Record<ReservationStatus, { key: string; className: string }> = {
  pending: { key: 'pending', className: 'bg-amber-100 text-amber-800' },
  confirmed: { key: 'confirmed', className: 'bg-green-100 text-green-800' },
  collected: { key: 'collected', className: 'bg-gray-100 text-gray-700' },
  cancelled: { key: 'cancelled', className: 'bg-red-100 text-red-800' },
  no_show: { key: 'noShow', className: 'bg-red-100 text-red-800' },
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const t = useTranslations('reservations.status')
  const config = statusStyle[status as ReservationStatus]
  const label = config ? t(config.key) : status
  const className = config?.className ?? 'bg-gray-100 text-gray-700'

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses} ${className}`}
    >
      {label}
    </span>
  )
}
