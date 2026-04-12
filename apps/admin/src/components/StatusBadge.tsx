const dishStatusConfig: Record<string, { label: string; className: string }> = {
  available: { label: 'Beschikbaar', className: 'bg-green-100 text-green-800' },
  reserved: { label: 'Gereserveerd', className: 'bg-amber-100 text-amber-800' },
  collected: { label: 'Opgehaald', className: 'bg-gray-100 text-gray-700' },
  expired: { label: 'Verlopen', className: 'bg-red-100 text-red-800' },
}

const reservationStatusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'In afwachting', className: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Bevestigd', className: 'bg-blue-100 text-blue-800' },
  collected: { label: 'Opgehaald', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Geannuleerd', className: 'bg-gray-100 text-gray-700' },
  no_show: { label: 'Niet opgehaald', className: 'bg-red-100 text-red-800' },
}

interface StatusBadgeProps {
  status: string
  type?: 'dish' | 'reservation'
}

export function StatusBadge({ status, type = 'dish' }: StatusBadgeProps) {
  const config = type === 'reservation' ? reservationStatusConfig : dishStatusConfig
  const badge = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' }

  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${badge.className}`}>
      {badge.label}
    </span>
  )
}
