// SEO-friendly URL helpers. URLs take the form `{slug}-{full-uuid}` so they
// stay unique without a DB migration: the trailing UUID is the lookup key,
// the leading slug is purely for humans and crawlers.

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
// Unicode combining diacritical marks (U+0300 – U+036F)
const DIACRITICS_RE = /[̀-ͯ]/g

export function slugify(input: string | null | undefined): string {
  if (!input) return 'item'
  return (
    input
      .normalize('NFKD')
      .replace(DIACRITICS_RE, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'item'
  )
}

export function dishPath(dish: { id: string; title: string }): string {
  return `/gerecht/${slugify(dish.title)}-${dish.id}`
}

export function merchantPath(merchant: { id: string; business_name: string }): string {
  return `/aanbieder/${slugify(merchant.business_name)}-${merchant.id}`
}

/**
 * Extract the trailing UUID from a route param. Accepts both the bare
 * UUID (legacy URL) and the slug+UUID form. Returns null if no UUID found.
 */
export function uuidFromParam(param: string): string | null {
  const match = param.match(UUID_RE)
  return match ? match[0].toLowerCase() : null
}
