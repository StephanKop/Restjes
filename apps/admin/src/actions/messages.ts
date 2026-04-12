'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase-admin'

export async function deleteConversation(conversationId: string) {
  const supabase = createAdminClient()
  // Messages cascade delete via FK
  const { error } = await supabase.from('conversations').delete().eq('id', conversationId)
  if (error) return { error: error.message }
  revalidatePath('/messages')
  return { success: true }
}

export async function deleteMessage(messageId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('messages').delete().eq('id', messageId)
  if (error) return { error: error.message }
  revalidatePath('/messages')
  return { success: true }
}
