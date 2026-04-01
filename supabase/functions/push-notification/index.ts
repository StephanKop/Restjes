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
    const message = payload.record

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'No record in webhook payload' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    const { conversation_id, sender_id, content } = message

    if (!conversation_id || !sender_id || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields in message' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Look up the conversation to find all participants
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('customer_id, merchant_id')
      .eq('id', conversation_id)
      .single()

    if (convError || !conversation) {
      throw new Error(
        `Failed to fetch conversation ${conversation_id}: ${convError?.message}`,
      )
    }

    // Determine the recipient (the participant who is NOT the sender)
    const recipientId =
      conversation.customer_id === sender_id
        ? conversation.merchant_id
        : conversation.customer_id

    if (!recipientId) {
      console.log('No recipient found for message, skipping notification')
      return new Response(
        JSON.stringify({ sent: false, reason: 'no_recipient' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Look up sender's display name from profiles
    const { data: senderProfile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', sender_id)
      .single()

    if (profileError) {
      console.warn(`Could not fetch sender profile: ${profileError.message}`)
    }

    const senderName = senderProfile?.display_name ?? 'Someone'

    // Look up recipient's push tokens
    const { data: pushTokens, error: tokenError } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', recipientId)

    if (tokenError) {
      throw new Error(`Failed to fetch push tokens: ${tokenError.message}`)
    }

    if (!pushTokens || pushTokens.length === 0) {
      console.log(`No push tokens found for recipient ${recipientId}`)
      return new Response(
        JSON.stringify({ sent: false, reason: 'no_push_tokens' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Truncate message body to 100 characters
    const body =
      content.length > 100 ? content.substring(0, 100) + '...' : content

    // Build Expo push messages for each token
    const messages = pushTokens.map((tokenRow: { token: string }) => ({
      to: tokenRow.token,
      title: senderName,
      body,
      sound: 'default',
      data: {
        conversationId: conversation_id,
        type: 'message',
      },
    }))

    // Send via Expo Push API
    const pushResponse = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const pushResult = await pushResponse.json()

    if (!pushResponse.ok) {
      console.error('Expo push API error:', pushResult)
      throw new Error(`Expo push API returned ${pushResponse.status}`)
    }

    console.log(
      `Sent ${messages.length} push notification(s) to recipient ${recipientId}`,
    )

    return new Response(
      JSON.stringify({
        sent: true,
        notifications_count: messages.length,
        expo_response: pushResult,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('push-notification error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
