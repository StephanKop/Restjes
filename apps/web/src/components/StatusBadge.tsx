type ReservationStatus = 'pending' | 'confirmed' | 'collected' | 'cancelled' | 'no_show'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const statusConfig: Record<ReservationStatus, { label: string; className: string }> = {
  pending: { label: 'In afwachting', className: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'Bevestigd', className: 'bg-green-100 text-green-800' },
  collected: { label: 'Opgehaald', className: 'bg-gray-100 text-gray-700' },
  cancelled: { label: 'Geannuleerd', className: 'bg-red-100 text-red-800' },
  no_show: { label: 'Niet opgehaald', className: 'bg-red-100 text-red-800' },
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status as ReservationStatus] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-700',
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses} ${config.className}`}
    >
      {config.label}
    </span>
  )
}
