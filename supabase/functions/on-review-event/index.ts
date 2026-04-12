import { createServiceClient } from '../_shared/supabase-client.ts'
import { sendPushToUser, getMerchantProfileId } from '../_shared/expo-push.ts'
import { corsResponse, jsonResponse } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse()

  try {
    const supabase = createServiceClient()
    const payload = await req.json()
    const { type, record, old_record } = payload

    if (!record) {
      return jsonResponse({ error: 'No record in payload' }, 400)
    }

    let sent = 0

    if (type === 'INSERT') {
      // New review → notify merchant
      const { merchant_id, consumer_id, rating, reservation_id } = record

      const merchantProfileId = await getMerchantProfileId(supabase, merchant_id)
      if (!merchantProfileId) {
        return jsonResponse({ sent: 0, reason: 'no_merchant_profile' })
      }

      const { data: consumer } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', consumer_id)
        .single()

      const consumerName = consumer?.display_name ?? 'Iemand'

      // Try to get dish title through reservation
      let dishInfo = ''
      if (reservation_id) {
        const { data: reservation } = await supabase
          .from('reservations')
          .select('dish:dishes!dish_id(title)')
          .eq('id', reservation_id)
          .single()
        const dish = (reservation as any)?.dish
        if (dish?.title) {
          dishInfo = ` voor "${dish.title}"`
        }
      }

      sent = await sendPushToUser(supabase, merchantProfileId, {
        title: 'Nieuwe beoordeling',
        body: `${consumerName} gaf ${rating} ster${rating !== 1 ? 'ren' : ''}${dishInfo}`,
        data: { type: 'review_received', target: 'merchant' },
      })
    } else if (type === 'UPDATE' && old_record) {
      // Merchant replied to review → notify consumer
      const hasNewReply = !old_record.merchant_reply && record.merchant_reply
      if (!hasNewReply) {
        return jsonResponse({ sent: 0, reason: 'no_new_reply' })
      }

      const { consumer_id, merchant_id } = record

      const { data: merchant } = await supabase
        .from('merchants')
        .select('business_name')
        .eq('id', merchant_id)
        .single()

      const merchantName = merchant?.business_name ?? 'De aanbieder'

      sent = await sendPushToUser(supabase, consumer_id, {
        title: 'Reactie op je beoordeling',
        body: `${merchantName} heeft gereageerd op je beoordeling`,
        data: { type: 'review_reply', target: 'consumer' },
      })
    }

    return jsonResponse({ sent, type })
  } catch (error) {
    console.error('on-review-event error:', error)
    return jsonResponse({ error: (error as Error).message }, 500)
  }
})
