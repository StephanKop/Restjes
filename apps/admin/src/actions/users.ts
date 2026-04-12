'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase-admin'

export async function updateProfile(
  id: string,
  data: { display_name?: string; city?: string; phone?: string },
) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('profiles').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/users/${id}`)
  revalidatePath('/users')
  return { success: true }
}

export async function deleteUser(id: string) {
  const supabase = createAdminClient()

  // Delete auth user (cascades to profile via trigger/FK)
  const { error } = await supabase.auth.admin.deleteUser(id)
  if (error) return { error: error.message }

  revalidatePath('/users')
  return { success: true }
}
