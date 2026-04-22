import { createServiceClient } from '../_shared/supabase-client.ts'
import { sendPushToUser } from '../_shared/expo-push.ts'
import { corsResponse, jsonResponse } from '../_shared/cors.ts'
import { getProfileLocale, pushCopy } from '../_shared/i18n.ts'

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

    const [dishRes, merchantRes, consumerRes] = await Promise.all([
      supabase.from('dishes').select('title').eq('id', dish_id).single(),
      supabase.from('merchants').select('profile_id, business_name').eq('id', merchant_id).single(),
      supabase.from('profiles').select('display_name').eq('id', consumer_id).single(),
    ])

    const merchantProfileId = merchantRes.data?.profile_id as string | undefined
    const merchantName = (merchantRes.data?.business_name as string | undefined) ?? ''
    const consumerName = (consumerRes.data?.display_name as string | undefined) ?? ''
    const dishTitle = (dishRes.data?.title as string | undefined) ?? ''

    let sent = 0

    if (type === 'INSERT') {
      // New reservation placed → notify merchant in merchant's locale
      if (merchantProfileId) {
        const locale = await getProfileLocale(supabase, merchantProfileId)
        const copy = pushCopy(locale)
        const name = consumerName || copy.fallbacks.someone
        const dish = dishTitle || copy.fallbacks.dish
        sent = await sendPushToUser(supabase, merchantProfileId, {
          title: copy.reservation.newTitle,
          body: quantity === 1
            ? copy.reservation.newBodySingular(name, dish)
            : copy.reservation.newBodyPlural(name, quantity, dish),
          data: { type: 'reservation_placed', reservationId, target: 'merchant' },
        })
      }
    } else if (type === 'UPDATE' && old_record) {
      const oldStatus = old_record.status
      const newStatus = status

      if (oldStatus === newStatus) {
        return jsonResponse({ sent: 0, reason: 'no_status_change' })
      }

      if (newStatus === 'confirmed' && oldStatus === 'pending') {
        // Merchant confirmed → notify consumer
        const locale = await getProfileLocale(supabase, consumer_id)
        const copy = pushCopy(locale)
        const merchant = merchantName || copy.fallbacks.merchant
        const dish = dishTitle || copy.fallbacks.dish
        sent = await sendPushToUser(supabase, consumer_id, {
          title: copy.reservation.confirmedTitle,
          body: copy.reservation.confirmedBody(dish, merchant),
          data: { type: 'reservation_confirmed', reservationId, target: 'consumer' },
        })
      } else if (newStatus === 'cancelled') {
        if (cancelled_by === 'consumer' && merchantProfileId) {
          const locale = await getProfileLocale(supabase, merchantProfileId)
          const copy = pushCopy(locale)
          const name = consumerName || copy.fallbacks.someone
          const dish = dishTitle || copy.fallbacks.dish
          sent = await sendPushToUser(supabase, merchantProfileId, {
            title: copy.reservation.cancelledTitle,
            body: copy.reservation.cancelledByConsumerBody(name, dish),
            data: { type: 'reservation_cancelled', reservationId, target: 'merchant' },
          })
        } else if (cancelled_by === 'merchant') {
          const locale = await getProfileLocale(supabase, consumer_id)
          const copy = pushCopy(locale)
          const merchant = merchantName || copy.fallbacks.merchant
          const dish = dishTitle || copy.fallbacks.dish
          sent = await sendPushToUser(supabase, consumer_id, {
            title: copy.reservation.cancelledTitle,
            body: copy.reservation.cancelledByMerchantBody(dish, merchant),
            data: { type: 'reservation_cancelled', reservationId, target: 'consumer' },
          })
        }
      } else if (newStatus === 'collected' && oldStatus === 'confirmed') {
        const locale = await getProfileLocale(supabase, consumer_id)
        const copy = pushCopy(locale)
        const dish = dishTitle || copy.fallbacks.dish
        sent = await sendPushToUser(supabase, consumer_id, {
          title: copy.reservation.collectedTitle,
          body: copy.reservation.collectedBody(dish),
          data: { type: 'reservation_collected', reservationId, target: 'consumer' },
        })
      } else if (newStatus === 'no_show' && oldStatus === 'confirmed') {
        const locale = await getProfileLocale(supabase, consumer_id)
        const copy = pushCopy(locale)
        const merchant = merchantName || copy.fallbacks.merchant
        const dish = dishTitle || copy.fallbacks.dish
        sent = await sendPushToUser(supabase, consumer_id, {
          title: copy.reservation.noShowTitle,
          body: copy.reservation.noShowBody(dish, merchant),
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
