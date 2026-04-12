'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase-admin'

export async function toggleMerchantVerification(merchantId: string, isVerified: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('merchants')
    .update({ is_verified: isVerified })
    .eq('id', merchantId)

  if (error) return { error: error.message }

  revalidatePath(`/merchants/${merchantId}`)
  revalidatePath('/merchants')
  return { success: true }
}

export async function updateMerchant(
  merchantId: string,
  data: {
    business_name?: string
    description?: string
    city?: string
    phone?: string
    website?: string
    address_line1?: string
    postal_code?: string
  },
) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('merchants').update(data).eq('id', merchantId)
  if (error) return { error: error.message }
  revalidatePath(`/merchants/${merchantId}`)
  revalidatePath('/merchants')
  return { success: true }
}

export async function deleteMerchant(merchantId: string) {
  const supabase = createAdminClient()

  // Delete all dishes first (FK constraint is RESTRICT)
  await supabase.from('dishes').delete().eq('merchant_id', merchantId)
  const { error } = await supabase.from('merchants').delete().eq('id', merchantId)
  if (error) return { error: error.message }

  revalidatePath('/merchants')
  return { success: true }
}
