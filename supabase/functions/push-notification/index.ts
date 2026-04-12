import { createServiceClient } from '../_shared/supabase-client.ts'
import { sendPushToUser } from '../_shared/expo-push.ts'
import { corsResponse, jsonResponse } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse()

  try {
    const supabase = createServiceClient()
    const payload = await req.json()
    const message = payload.record

    if (!message) {
      return jsonResponse({ error: 'No record in webhook payload' }, 400)
    }

    const { conversation_id, sender_id, content } = message

    if (!conversation_id || !sender_id || !content) {
      return jsonResponse({ error: 'Missing required fields in message' }, 400)
    }

    // Look up the conversation to find participants
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('consumer_id, merchant_id')
      .eq('id', conversation_id)
      .single()

    if (convError || !conversation) {
      throw new Error(`Failed to fetch conversation ${conversation_id}: ${convError?.message}`)
    }

    // Determine recipient profile_id
    let recipientProfileId: string | null = null

    if (conversation.consumer_id === sender_id) {
      // Sender is consumer → recipient is merchant owner
      const { data: merchant } = await supabase
        .from('merchants')
        .select('profile_id')
        .eq('id', conversation.merchant_id)
        .single()
      recipientProfileId = merchant?.profile_id ?? null
    } else {
      // Sender is merchant owner → recipient is consumer
      recipientProfileId = conversation.consumer_id
    }

    if (!recipientProfileId) {
      return jsonResponse({ sent: false, reason: 'no_recipient' })
    }

    // Get sender display name
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', sender_id)
      .single()

    const senderName = senderProfile?.display_name ?? 'Iemand'
    const body = content.length > 100 ? content.substring(0, 100) + '...' : content

    const sent = await sendPushToUser(supabase, recipientProfileId, {
      title: senderName,
      body,
      data: { conversationId: conversation_id, type: 'message' },
    })

    return jsonResponse({ sent: sent > 0, notifications_count: sent })
  } catch (error) {
    console.error('push-notification error:', error)
    return jsonResponse({ error: (error as Error).message }, 500)
  }
})
