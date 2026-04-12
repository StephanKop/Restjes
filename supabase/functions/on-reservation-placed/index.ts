// DEPRECATED: This function has been replaced by on-reservation-change.
// It is kept as a passthrough in case the old webhook is still configured.
// Update the Supabase Dashboard webhook to point to on-reservation-change instead.

import { createServiceClient } from '../_shared/supabase-client.ts'
import { sendPushToUser, getMerchantProfileId } from '../_shared/expo-push.ts'
import { corsResponse, jsonResponse } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse()

  try {
    const supabase = createServiceClient()
    const payload = await req.json()
    const reservation = payload.record

    if (!reservation) {
      return jsonResponse({ error: 'No record in payload' }, 400)
    }

    const { dish_id, quantity, consumer_id, merchant_id } = reservation

    // NOTE: Quantity management has been REMOVED.
    // The database trigger (00021) handles quantity atomically.

    // Send push notification to merchant only
    const merchantProfileId = await getMerchantProfileId(supabase, merchant_id)
    if (!merchantProfileId) {
      return jsonResponse({ sent: 0, reason: 'no_merchant_profile' })
    }

    const [dishRes, consumerRes] = await Promise.all([
      supabase.from('dishes').select('title').eq('id', dish_id).single(),
      supabase.from('profiles').select('display_name').eq('id', consumer_id).single(),
    ])

    const dishTitle = dishRes.data?.title ?? 'een gerecht'
    const consumerName = consumerRes.data?.display_name ?? 'Iemand'

    const sent = await sendPushToUser(supabase, merchantProfileId, {
      title: 'Nieuwe reservering',
      body: `${consumerName} heeft ${quantity} portie${quantity > 1 ? 's' : ''} van "${dishTitle}" gereserveerd`,
      data: { type: 'reservation', target: 'merchant' },
    })

    return jsonResponse({ sent, deprecated: true, message: 'Use on-reservation-change instead' })
  } catch (error) {
    console.error('on-reservation-placed (deprecated) error:', error)
    return jsonResponse({ error: (error as Error).message }, 500)
  }
})
