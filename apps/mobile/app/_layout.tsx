import '../global.css'
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { AuthProvider, useAuth } from '../lib/auth-context'
import {
  registerForPushNotifications,
  setupNotificationListeners,
} from '../lib/notifications'

function NotificationSetup() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    registerForPushNotifications(user.id)
    const cleanup = setupNotificationListeners()
    return cleanup
  }, [user])

  return null
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationSetup />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="dish/create"
          options={{
            headerShown: true,
            headerTitle: 'Nieuw gerecht',
            headerBackTitle: 'Terug',
            headerStyle: { backgroundColor: '#faf9f6' },
            headerShadowVisible: false,
            headerTintColor: '#3d3833',
          }}
        />
        <Stack.Screen
          name="dish/[id]"
          options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: 'Terug',
            headerStyle: { backgroundColor: '#faf9f6' },
            headerShadowVisible: false,
            headerTintColor: '#3d3833',
          }}
        />
        <Stack.Screen
          name="merchant/[id]"
          options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: 'Terug',
            headerStyle: { backgroundColor: '#faf9f6' },
            headerShadowVisible: false,
            headerTintColor: '#3d3833',
          }}
        />
        <Stack.Screen
          name="chat/[conversationId]"
          options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: 'Terug',
            headerStyle: { backgroundColor: '#faf9f6' },
            headerShadowVisible: false,
            headerTintColor: '#3d3833',
          }}
        />
      </Stack>
    </AuthProvider>
  )
}
