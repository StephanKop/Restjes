'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase-admin'

export async function updatePageContent(slug: string, content: Record<string, unknown>) {
  const supabase = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('page_content')
    .upsert(
      { page_slug: slug, content, updated_at: new Date().toISOString() },
      { onConflict: 'page_slug' },
    )

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/content/${slug}`)
  revalidatePath('/content')
  return { success: true }
}
