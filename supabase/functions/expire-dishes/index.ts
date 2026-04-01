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

    // Expire dishes whose pickup window has passed
    const { data: expiredDishes, error: expireError } = await supabase
      .from('dishes')
      .update({ status: 'expired' })
      .eq('status', 'available')
      .lt('pickup_end', new Date().toISOString())
      .select('id')

    if (expireError) {
      throw new Error(`Failed to expire dishes: ${expireError.message}`)
    }

    const expiredCount = expiredDishes?.length ?? 0
    console.log(`Expired ${expiredCount} dishes past pickup window`)

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
