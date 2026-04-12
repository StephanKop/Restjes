const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

interface PushPayload {
  title: string
  body: string
  data?: Record<string, unknown>
}

/**
 * Send a push notification to all devices registered for a given user.
 * Returns the number of notifications sent.
 */
export async function sendPushToUser(
  supabase: ReturnType<typeof import('https://esm.sh/@supabase/supabase-js@2').createClient>,
  profileId: string,
  payload: PushPayload,
): Promise<number> {
  const { data: pushTokens, error } = await supabase
    .from('push_tokens')
    .select('token')
    .eq('profile_id', profileId)

  if (error) {
    console.error(`Failed to fetch push tokens for ${profileId}:`, error.message)
    return 0
  }

  if (!pushTokens || pushTokens.length === 0) {
    console.log(`No push tokens for profile ${profileId}`)
    return 0
  }

  const messages = pushTokens.map((row: { token: string }) => ({
    to: row.token,
    title: payload.title,
    body: payload.body,
    sound: 'default' as const,
    data: payload.data ?? {},
  }))

  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  })

  if (!response.ok) {
    const result = await response.json()
    console.error('Expo push API error:', result)
    return 0
  }

  console.log(`Sent ${messages.length} push(es) to profile ${profileId}`)
  return messages.length
}

/**
 * Resolve a merchant_id to the owning profile_id.
 */
export async function getMerchantProfileId(
  supabase: ReturnType<typeof import('https://esm.sh/@supabase/supabase-js@2').createClient>,
  merchantId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('merchants')
    .select('profile_id')
    .eq('id', merchantId)
    .single()
  return data?.profile_id ?? null
}
