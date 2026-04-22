import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { supabase } from './supabase'

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export async function registerForPushNotifications(userId: string) {
  // iOS simulator cannot receive APNs push. Android emulators with Google Play
  // Services *can* receive FCM push, so we only gate on iOS.
  if (!Device.isDevice && Platform.OS === 'ios') {
    console.log('[push] iOS simulator — skipping registration')
    return
  }

  // Android requires the default channel to exist *before* the first token
  // request, otherwise FCM delivers silently without surfacing a heads-up.
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Standaard',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      })
    } catch (err) {
      console.log('[push] channel setup failed:', err instanceof Error ? err.message : err)
    }
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log('[push] permission not granted:', finalStatus)
      return
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    if (!projectId) {
      console.warn('[push] no EAS projectId — token request will likely fail')
    }

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    )
    const token = tokenData.data
    console.log('[push] got token:', token)

    const platform = Platform.OS as 'ios' | 'android'
    const { error: upsertError } = await supabase.from('push_tokens').upsert(
      { profile_id: userId, token, platform },
      { onConflict: 'profile_id,token' },
    )

    if (upsertError) {
      console.error('[push] failed to save token:', upsertError.message)
      return
    }

    console.log('[push] token saved for user', userId)
    return token
  } catch (err) {
    // Builds without the aps-environment entitlement (e.g. personal dev team)
    // cannot register with APNs. Log and continue — the rest of the app works fine.
    console.log('[push] registration skipped:', err instanceof Error ? err.message : err)
  }
}

export async function unregisterPushNotifications(userId: string) {
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync()
    await supabase
      .from('push_tokens')
      .delete()
      .eq('profile_id', userId)
      .eq('token', tokenData.data)
  } catch {
    // Ignore errors during cleanup
  }
}

export function setupNotificationListeners() {
  // Handle notification taps (when user taps on a notification)
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data

      if (!data?.type) return

      switch (data.type) {
        // Message notifications
        case 'message':
          if (data.conversationId) {
            router.push(`/chat/${data.conversationId}`)
          }
          break

        // Reservation notifications — route based on target
        case 'reservation_placed':
          router.push('/aanbieder/reservations' as any)
          break

        case 'reservation_confirmed':
        case 'reservation_collected':
        case 'reservation_no_show':
          router.push('/(tabs)/reservations')
          break

        case 'reservation_cancelled':
          if (data.target === 'merchant') {
            router.push('/aanbieder/reservations' as any)
          } else {
            router.push('/(tabs)/reservations')
          }
          break

        // Review notifications
        case 'review_received':
          router.push('/aanbieder/reviews' as any)
          break

        case 'review_reply':
          router.push('/(tabs)/reservations')
          break

        // Backward compat for old 'reservation' type from on-reservation-placed
        case 'reservation':
          if (data.target === 'merchant') {
            router.push('/aanbieder/reservations' as any)
          } else {
            router.push('/(tabs)/reservations')
          }
          break
      }
    }
  )

  return () => subscription.remove()
}
