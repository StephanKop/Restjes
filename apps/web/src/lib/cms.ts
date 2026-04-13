import { cache } from 'react'
import { createServerComponentClient } from '@/lib/supabase-server'
import type { PageSlug, PageContentMap } from '@kliekjesclub/types'

export const getPageContent = cache(async <S extends PageSlug>(
  slug: S,
  defaults: PageContentMap[S],
): Promise<PageContentMap[S]> => {
  try {
    const supabase = await createServerComponentClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('page_content')
      .select('content')
      .eq('page_slug', slug)
      .maybeSingle()

    if (data?.content && typeof data.content === 'object') {
      // Shallow merge top-level keys so new default fields are picked up
      return { ...defaults, ...(data.content as PageContentMap[S]) }
    }
  } catch {
    // DB unavailable — fall through to defaults
  }
  return defaults
})
