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

export const ALL_ALLERGENS = Object.keys(ALLERGEN_LABELS)

/**
 * Format a pickup time window in Dutch, relative to today.
 * Examples: "Vandaag 17:00 - 19:00", "Morgen 12:00 - 14:00", "za 4 apr 10:00 - 11:00"
 */
export function formatPickupTime(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const now = new Date()

  const startDay = stripTime(startDate)
  const today = stripTime(now)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const timeStart = formatTime(startDate)
  const timeEnd = formatTime(endDate)

  if (startDay.getTime() === today.getTime()) {
    return `Vandaag ${timeStart} - ${timeEnd}`
  }

  if (startDay.getTime() === tomorrow.getTime()) {
    return `Morgen ${timeStart} - ${timeEnd}`
  }

  const dayNames = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
  const monthNames = [
    'jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
    'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
  ]
  const dayName = dayNames[startDate.getDay()]
  const day = startDate.getDate()
  const month = monthNames[startDate.getMonth()]

  return `${dayName} ${day} ${month} ${timeStart} - ${timeEnd}`
}

/**
 * Format a date as a relative Dutch string.
 * Examples: "zojuist", "5 minuten geleden", "2 uur geleden", "gisteren", "3 dagen geleden"
 */
export function formatRelativeDate(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'zojuist'
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minuut geleden' : `${diffMinutes} minuten geleden`
  }
  if (diffHours < 24) {
    return diffHours === 1 ? '1 uur geleden' : `${diffHours} uur geleden`
  }
  if (diffDays === 1) return 'gisteren'
  if (diffDays < 7) return `${diffDays} dagen geleden`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return weeks === 1 ? '1 week geleden' : `${weeks} weken geleden`
  }
  const months = Math.floor(diffDays / 30)
  return months === 1 ? '1 maand geleden' : `${months} maanden geleden`
}

function stripTime(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
