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

    // Parse the webhook payload (Database Webhook sends { type, table, record, ... })
    const payload = await req.json()
    const reservation = payload.record

    if (!reservation) {
      return new Response(
        JSON.stringify({ error: 'No record in webhook payload' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    const { dish_id, quantity } = reservation

    if (!dish_id || !quantity) {
      return new Response(
        JSON.stringify({ error: 'Missing dish_id or quantity in reservation' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Fetch the current dish to get quantity_available
    const { data: dish, error: fetchError } = await supabase
      .from('dishes')
      .select('id, quantity_available, merchant_id')
      .eq('id', dish_id)
      .single()

    if (fetchError || !dish) {
      throw new Error(`Failed to fetch dish ${dish_id}: ${fetchError?.message}`)
    }

    const newQuantity = dish.quantity_available - quantity
    const updateData: Record<string, unknown> = {
      quantity_available: Math.max(0, newQuantity),
    }

    // If quantity drops to 0 or below, mark as reserved
    if (newQuantity <= 0) {
      updateData.status = 'reserved'
      console.log(`Dish ${dish_id} fully reserved, updating status`)
    }

    const { error: updateError } = await supabase
      .from('dishes')
      .update(updateData)
      .eq('id', dish_id)

    if (updateError) {
      throw new Error(`Failed to update dish ${dish_id}: ${updateError.message}`)
    }

    console.log(
      `Dish ${dish_id}: quantity_available ${dish.quantity_available} -> ${Math.max(0, newQuantity)}`,
    )

    // TODO: Send push notification to merchant
    // This would notify the merchant that a new reservation was placed
    console.log(
      `[Placeholder] Would send push notification to merchant ${dish.merchant_id} about new reservation`,
    )

    return new Response(
      JSON.stringify({
        success: true,
        dish_id,
        new_quantity_available: Math.max(0, newQuantity),
        status_changed: newQuantity <= 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('on-reservation-placed error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
