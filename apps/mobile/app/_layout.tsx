import '../global.css'
import { useEffect, useMemo } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider, useAuth } from '../lib/auth-context'
import { LocaleProvider, useTranslation } from '../lib/i18n'
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

function RootStack() {
  const { t } = useTranslation()

  const headerOptions = useMemo(() => ({
    headerShown: true,
    headerStyle: { backgroundColor: '#faf9f6' },
    headerShadowVisible: false,
    headerTintColor: '#3d3833',
    headerBackTitle: t('nav.stackTitles.back'),
    headerBlurEffect: 'none' as const,
  }), [t])

  return (
    <Stack screenOptions={{
      ...headerOptions,
      headerShown: false,
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="dish/create" options={{ ...headerOptions, headerTitle: t('nav.stackTitles.newDish') }} />
      <Stack.Screen name="dish/[id]/index" options={{ ...headerOptions, headerTitle: '' }} />
      <Stack.Screen name="dish/[id]/edit" options={{ ...headerOptions, headerTitle: t('nav.stackTitles.editDish') }} />
      <Stack.Screen name="merchant/[id]/index" options={{ ...headerOptions, headerTitle: '' }} />
      <Stack.Screen name="merchant/[id]/reviews" options={{ ...headerOptions, headerTitle: t('nav.stackTitles.reviews') }} />
      <Stack.Screen name="chat/[conversationId]" options={{ ...headerOptions, headerTitle: '' }} />
      <Stack.Screen name="review/[reservationId]" options={{ ...headerOptions, headerTitle: t('nav.stackTitles.review') }} />
      <Stack.Screen name="impact" options={{ headerShown: false }} />
      <Stack.Screen name="aanbieder/index" options={{ ...headerOptions, headerTitle: t('nav.stackTitles.myOffer') }} />
      <Stack.Screen name="aanbieder/dishes" options={{ ...headerOptions, headerTitle: t('nav.stackTitles.myDishes') }} />
      <Stack.Screen name="aanbieder/reservations" options={{ ...headerOptions, headerTitle: t('nav.stackTitles.reservations') }} />
      <Stack.Screen name="aanbieder/reviews" options={{ ...headerOptions, headerTitle: t('nav.stackTitles.reviews') }} />
      <Stack.Screen name="aanbieder/settings" options={{ ...headerOptions, headerTitle: t('nav.stackTitles.settings') }} />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <NotificationSetup />
        <RootStack />
      </AuthProvider>
    </LocaleProvider>
  )
}
