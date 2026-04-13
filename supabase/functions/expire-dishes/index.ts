import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Expire dishes whose pickup window AND/OR expiration date have passed
    // Uses whichever is later: both dates that are set must have passed
    const now = new Date().toISOString()

    // Dishes expired by pickup_end (no expires_at set)
    const { data: expiredByPickup, error: expirePickupError } = await supabase
      .from('dishes')
      .update({ status: 'expired' })
      .eq('status', 'available')
      .lt('pickup_end', now)
      .is('expires_at', null)
      .select('id')

    if (expirePickupError) {
      throw new Error(`Failed to expire dishes by pickup: ${expirePickupError.message}`)
    }

    // Dishes expired by expires_at (no pickup_end set)
    const { data: expiredByDate, error: expireDateError } = await supabase
      .from('dishes')
      .update({ status: 'expired' })
      .eq('status', 'available')
      .is('pickup_end', null)
      .lt('expires_at', now)
      .select('id')

    if (expireDateError) {
      throw new Error(`Failed to expire dishes by date: ${expireDateError.message}`)
    }

    // Dishes with both dates set: expire when BOTH have passed (whichever is later)
    const { data: expiredByBoth, error: expireBothError } = await supabase
      .from('dishes')
      .update({ status: 'expired' })
      .eq('status', 'available')
      .lt('pickup_end', now)
      .lt('expires_at', now)
      .select('id')

    if (expireBothError) {
      throw new Error(`Failed to expire dishes by both dates: ${expireBothError.message}`)
    }

    const expiredCount = (expiredByPickup?.length ?? 0) + (expiredByDate?.length ?? 0) + (expiredByBoth?.length ?? 0)
    console.log(`Expired ${expiredCount} dishes past their deadline`)

    // Mark dishes with no remaining quantity as reserved
    const { data: reservedDishes, error: reserveError } = await supabase
      .from('dishes')
      .update({ status: 'reserved' })
      .eq('status', 'available')
      .lte('quantity_available', 0)
      .select('id')

    if (reserveError) {
      throw new Error(`Failed to reserve sold-out dishes: ${reserveError.message}`)
    }

    const reservedCount = reservedDishes?.length ?? 0
    console.log(`Marked ${reservedCount} sold-out dishes as reserved`)

    return new Response(
      JSON.stringify({
        expired: expiredCount,
        reserved: reservedCount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('expire-dishes error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
