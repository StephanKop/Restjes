import '../global.css'
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
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
      <StatusBar style="dark" />
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
        <Stack.Screen
          name="review/[reservationId]"
          options={{
            headerShown: true,
            headerTitle: 'Beoordeling',
            headerBackTitle: 'Terug',
            headerStyle: { backgroundColor: '#faf9f6' },
            headerShadowVisible: false,
            headerTintColor: '#3d3833',
          }}
        />
        <Stack.Screen
          name="aanbieder/index"
          options={{
            headerShown: true,
            headerTitle: 'Mijn aanbod',
            headerBackTitle: 'Terug',
            headerStyle: { backgroundColor: '#faf9f6' },
            headerShadowVisible: false,
            headerTintColor: '#3d3833',
          }}
        />
        <Stack.Screen
          name="aanbieder/dishes"
          options={{
            headerShown: true,
            headerTitle: 'Mijn gerechten',
            headerBackTitle: 'Terug',
            headerStyle: { backgroundColor: '#faf9f6' },
            headerShadowVisible: false,
            headerTintColor: '#3d3833',
          }}
        />
        <Stack.Screen
          name="aanbieder/reservations"
          options={{
            headerShown: true,
            headerTitle: 'Reserveringen',
            headerBackTitle: 'Terug',
            headerStyle: { backgroundColor: '#faf9f6' },
            headerShadowVisible: false,
            headerTintColor: '#3d3833',
          }}
        />
        <Stack.Screen
          name="aanbieder/reviews"
          options={{
            headerShown: true,
            headerTitle: 'Beoordelingen',
            headerBackTitle: 'Terug',
            headerStyle: { backgroundColor: '#faf9f6' },
            headerShadowVisible: false,
            headerTintColor: '#3d3833',
          }}
        />
        <Stack.Screen
          name="aanbieder/settings"
          options={{
            headerShown: true,
            headerTitle: 'Instellingen',
            headerBackTitle: 'Terug',
            headerStyle: { backgroundColor: '#faf9f6' },
            headerShadowVisible: false,
            headerTintColor: '#3d3833',
          }}
        />
        <Stack.Screen
          name="dish/[id]/index"
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
          name="dish/[id]/edit"
          options={{
            headerShown: true,
            headerTitle: 'Gerecht bewerken',
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
