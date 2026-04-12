'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase-admin'

export async function updateDishStatus(dishId: string, status: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('dishes').update({ status: status as 'available' | 'reserved' | 'collected' | 'expired' }).eq('id', dishId)
  if (error) return { error: error.message }
  revalidatePath(`/dishes/${dishId}`)
  revalidatePath('/dishes')
  return { success: true }
}

export async function updateDish(
  dishId: string,
  data: {
    title?: string
    description?: string
    quantity_available?: number
    is_vegetarian?: boolean
    is_vegan?: boolean
    bring_own_container?: boolean
  },
) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('dishes').update(data).eq('id', dishId)
  if (error) return { error: error.message }
  revalidatePath(`/dishes/${dishId}`)
  revalidatePath('/dishes')
  return { success: true }
}

export async function deleteDish(dishId: string) {
  const supabase = createAdminClient()

  // Delete related records first (FK constraints would block dish deletion)
  await supabase.from('reservations').delete().eq('dish_id', dishId)
  await supabase.from('dish_ingredients').delete().eq('dish_id', dishId)
  await supabase.from('dish_allergies').delete().eq('dish_id', dishId)

  // Delete conversations linked to this dish
  await supabase.from('conversations').delete().eq('dish_id', dishId)

  const { error } = await supabase.from('dishes').delete().eq('id', dishId)
  if (error) return { error: error.message }
  revalidatePath('/dishes')
  return { success: true }
}
