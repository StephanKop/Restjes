import { createServiceClient } from '../_shared/supabase-client.ts'
import { sendPushToUser, getMerchantProfileId } from '../_shared/expo-push.ts'
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

    let sent = 0

    if (type === 'INSERT') {
      // New review → notify merchant in merchant's locale
      const { merchant_id, consumer_id, rating, reservation_id } = record

      const merchantProfileId = await getMerchantProfileId(supabase, merchant_id)
      if (!merchantProfileId) {
        return jsonResponse({ sent: 0, reason: 'no_merchant_profile' })
      }

      const locale = await getProfileLocale(supabase, merchantProfileId)
      const copy = pushCopy(locale)

      const { data: consumer } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', consumer_id)
        .single()

      const consumerName = (consumer?.display_name as string | undefined) ?? copy.fallbacks.someone

      // Try to get dish title through reservation
      let dishInfo = ''
      if (reservation_id) {
        const { data: reservation } = await supabase
          .from('reservations')
          .select('dish:dishes!dish_id(title)')
          .eq('id', reservation_id)
          .single()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dish = (reservation as any)?.dish
        if (dish?.title) {
          dishInfo = copy.review.dishSuffix(dish.title)
        }
      }

      sent = await sendPushToUser(supabase, merchantProfileId, {
        title: copy.review.newTitle,
        body: copy.review.newBody(consumerName, rating, dishInfo),
        data: { type: 'review_received', target: 'merchant' },
      })
    } else if (type === 'UPDATE' && old_record) {
      // Merchant replied to review → notify consumer in consumer's locale
      const hasNewReply = !old_record.merchant_reply && record.merchant_reply
      if (!hasNewReply) {
        return jsonResponse({ sent: 0, reason: 'no_new_reply' })
      }

      const { consumer_id, merchant_id } = record
      const locale = await getProfileLocale(supabase, consumer_id)
      const copy = pushCopy(locale)

      const { data: merchant } = await supabase
        .from('merchants')
        .select('business_name')
        .eq('id', merchant_id)
        .single()

      const merchantName = (merchant?.business_name as string | undefined) ?? copy.fallbacks.merchant

      sent = await sendPushToUser(supabase, consumer_id, {
        title: copy.review.replyTitle,
        body: copy.review.replyBody(merchantName),
        data: { type: 'review_reply', target: 'consumer' },
      })
    }

    return jsonResponse({ sent, type })
  } catch (error) {
    console.error('on-review-event error:', error)
    return jsonResponse({ error: (error as Error).message }, 500)
  }
})
