import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

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

    const { dish_id, quantity, consumer_id } = reservation

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
      .select('id, title, quantity_available, merchant_id')
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

    // Send push notification to the dish owner (merchant)
    const { data: merchant } = await supabase
      .from('merchants')
      .select('profile_id')
      .eq('id', dish.merchant_id)
      .single()

    if (merchant?.profile_id) {
      // Get consumer name for the notification
      const { data: consumerProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', consumer_id)
        .single()

      const consumerName = consumerProfile?.display_name ?? 'Iemand'

      const { data: pushTokens } = await supabase
        .from('push_tokens')
        .select('token')
        .eq('profile_id', merchant.profile_id)

      if (pushTokens && pushTokens.length > 0) {
        const messages = pushTokens.map((tokenRow: { token: string }) => ({
          to: tokenRow.token,
          title: 'Nieuwe reservering',
          body: `${consumerName} heeft ${quantity} portie${quantity > 1 ? 's' : ''} van "${dish.title}" gereserveerd`,
          sound: 'default',
          data: {
            type: 'reservation',
          },
        }))

        await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        })

        console.log(
          `Sent reservation push notification to merchant ${dish.merchant_id}`,
        )
      }
    }

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
