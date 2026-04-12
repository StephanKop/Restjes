'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase-admin'

export async function updateReservationStatus(reservationId: string, status: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('reservations')
    .update({ status: status as 'pending' | 'confirmed' | 'collected' | 'cancelled' | 'no_show' })
    .eq('id', reservationId)

  if (error) return { error: error.message }
  revalidatePath(`/reservations/${reservationId}`)
  revalidatePath('/reservations')
  return { success: true }
}

export async function deleteReservation(reservationId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('reservations').delete().eq('id', reservationId)
  if (error) return { error: error.message }
  revalidatePath('/reservations')
  return { success: true }
}
