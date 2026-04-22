import '../global.css'
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider, useAuth } from '../lib/auth-context'
import { LocaleProvider } from '../lib/i18n'
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

const headerOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: '#faf9f6' },
  headerShadowVisible: false,
  headerTintColor: '#3d3833',
  headerBackTitle: 'Terug',
  headerBlurEffect: 'none' as const,
}

export default function RootLayout() {
  return (
    <LocaleProvider>
    <AuthProvider>
      <StatusBar style="dark" />
      <NotificationSetup />
      <Stack screenOptions={{
        headerShown: false,
        ...headerOptions,
        headerShown: false,
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="dish/create" options={{ ...headerOptions, headerTitle: 'Nieuw gerecht' }} />
        <Stack.Screen name="dish/[id]/index" options={{ ...headerOptions, headerTitle: '' }} />
        <Stack.Screen name="dish/[id]/edit" options={{ ...headerOptions, headerTitle: 'Gerecht bewerken' }} />
        <Stack.Screen name="merchant/[id]/index" options={{ ...headerOptions, headerTitle: '' }} />
        <Stack.Screen name="merchant/[id]/reviews" options={{ ...headerOptions, headerTitle: 'Beoordelingen' }} />
        <Stack.Screen name="chat/[conversationId]" options={{ ...headerOptions, headerTitle: '' }} />
        <Stack.Screen name="review/[reservationId]" options={{ ...headerOptions, headerTitle: 'Beoordeling' }} />
        <Stack.Screen name="impact" options={{ headerShown: false }} />
        <Stack.Screen name="aanbieder/index" options={{ ...headerOptions, headerTitle: 'Mijn aanbod' }} />
        <Stack.Screen name="aanbieder/dishes" options={{ ...headerOptions, headerTitle: 'Mijn gerechten' }} />
        <Stack.Screen name="aanbieder/reservations" options={{ ...headerOptions, headerTitle: 'Reserveringen' }} />
        <Stack.Screen name="aanbieder/reviews" options={{ ...headerOptions, headerTitle: 'Beoordelingen' }} />
        <Stack.Screen name="aanbieder/settings" options={{ ...headerOptions, headerTitle: 'Instellingen' }} />
      </Stack>
    </AuthProvider>
    </LocaleProvider>
  )
}
