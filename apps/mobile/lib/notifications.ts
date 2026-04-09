import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
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
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device')
    return
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted')
    return
  }

  // Get the Expo push token
  const tokenData = await Notifications.getExpoPushTokenAsync()
  const token = tokenData.data

  // Upsert the token to the database
  const platform = Platform.OS as 'ios' | 'android'
  await supabase.from('push_tokens').upsert(
    { profile_id: userId, token, platform },
    { onConflict: 'profile_id,token' }
  )

  // Set up notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Standaard',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    })
  }

  return token
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

      if (data?.type === 'message' && data?.conversationId) {
        router.push(`/chat/${data.conversationId}`)
      } else if (data?.type === 'reservation') {
        router.push('/(tabs)/reservations')
      }
    }
  )

  return () => subscription.remove()
}
