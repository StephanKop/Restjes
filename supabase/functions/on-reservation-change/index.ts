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

    const { id: reservationId, dish_id, merchant_id, consumer_id, quantity, status, cancelled_by } = record

    // Fetch dish title and merchant name for notification text
    const [dishRes, merchantRes, consumerRes] = await Promise.all([
      supabase.from('dishes').select('title').eq('id', dish_id).single(),
      supabase.from('merchants').select('profile_id, business_name').eq('id', merchant_id).single(),
      supabase.from('profiles').select('display_name').eq('id', consumer_id).single(),
    ])

    const dishTitle = dishRes.data?.title ?? 'een gerecht'
    const merchantName = merchantRes.data?.business_name ?? 'de aanbieder'
    const merchantProfileId = merchantRes.data?.profile_id
    const consumerName = consumerRes.data?.display_name ?? 'Iemand'

    let sent = 0

    if (type === 'INSERT') {
      // New reservation placed → notify merchant
      if (merchantProfileId) {
        sent = await sendPushToUser(supabase, merchantProfileId, {
          title: 'Nieuwe reservering',
          body: `${consumerName} heeft ${quantity} portie${quantity > 1 ? 's' : ''} van "${dishTitle}" gereserveerd`,
          data: { type: 'reservation_placed', reservationId, target: 'merchant' },
        })
      }
    } else if (type === 'UPDATE' && old_record) {
      const oldStatus = old_record.status
      const newStatus = status

      if (oldStatus === newStatus) {
        // No status change, nothing to notify
        return jsonResponse({ sent: 0, reason: 'no_status_change' })
      }

      if (newStatus === 'confirmed' && oldStatus === 'pending') {
        // Merchant confirmed → notify consumer
        sent = await sendPushToUser(supabase, consumer_id, {
          title: 'Reservering bevestigd',
          body: `Je reservering van "${dishTitle}" bij ${merchantName} is bevestigd`,
          data: { type: 'reservation_confirmed', reservationId, target: 'consumer' },
        })
      } else if (newStatus === 'cancelled') {
        if (cancelled_by === 'consumer' && merchantProfileId) {
          // Consumer cancelled → notify merchant
          sent = await sendPushToUser(supabase, merchantProfileId, {
            title: 'Reservering geannuleerd',
            body: `${consumerName} heeft de reservering van "${dishTitle}" geannuleerd`,
            data: { type: 'reservation_cancelled', reservationId, target: 'merchant' },
          })
        } else if (cancelled_by === 'merchant') {
          // Merchant cancelled → notify consumer
          sent = await sendPushToUser(supabase, consumer_id, {
            title: 'Reservering geannuleerd',
            body: `Je reservering van "${dishTitle}" bij ${merchantName} is helaas geannuleerd`,
            data: { type: 'reservation_cancelled', reservationId, target: 'consumer' },
          })
        }
      } else if (newStatus === 'collected' && oldStatus === 'confirmed') {
        // Marked as collected → notify consumer
        sent = await sendPushToUser(supabase, consumer_id, {
          title: 'Opgehaald!',
          body: `Je reservering van "${dishTitle}" is als opgehaald gemarkeerd. Smakelijk!`,
          data: { type: 'reservation_collected', reservationId, target: 'consumer' },
        })
      } else if (newStatus === 'no_show' && oldStatus === 'confirmed') {
        // No-show → notify consumer
        sent = await sendPushToUser(supabase, consumer_id, {
          title: 'Niet opgehaald',
          body: `Je reservering van "${dishTitle}" bij ${merchantName} is gemarkeerd als niet opgehaald`,
          data: { type: 'reservation_no_show', reservationId, target: 'consumer' },
        })
      }
    }

    return jsonResponse({ sent, type, status })
  } catch (error) {
    console.error('on-reservation-change error:', error)
    return jsonResponse({ error: (error as Error).message }, 500)
  }
})
