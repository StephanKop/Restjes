const ALLERGEN_LABELS: Record<string, string> = {
  gluten: 'Gluten',
  crustaceans: 'Schaaldieren',
  eggs: 'Eieren',
  fish: 'Vis',
  peanuts: "Pinda's",
  soybeans: 'Soja',
  milk: 'Melk',
  nuts: 'Noten',
  celery: 'Selderij',
  mustard: 'Mosterd',
  sesame: 'Sesam',
  sulphites: 'Sulfieten',
  lupin: 'Lupine',
  molluscs: 'Weekdieren',
}

export function allergenLabel(allergen: string): string {
  return ALLERGEN_LABELS[allergen] ?? allergen
}

export function formatPickupTime(start: string | null, end: string | null): string {
  if (!start || !end) return 'Nader te bepalen'

  const now = new Date()
  const startDate = new Date(start)
  const endDate = new Date(end)

  const isToday = startDate.toDateString() === now.toDateString()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow = startDate.toDateString() === tomorrow.toDateString()

  const timeStart = startDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
  const timeEnd = endDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })

  if (isToday) return `Vandaag ${timeStart} - ${timeEnd}`
  if (isTomorrow) return `Morgen ${timeStart} - ${timeEnd}`

  const dateStr = startDate.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })
  return `${dateStr} ${timeStart} - ${timeEnd}`
}

export function formatRelativeDate(date: string): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Zojuist'
  if (diffMin < 60) return `${diffMin} min geleden`
  if (diffHour < 24) return `${diffHour} uur geleden`
  if (diffDay === 1) return 'Gisteren'
  if (diffDay < 7) return `${diffDay} dagen geleden`

  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}
