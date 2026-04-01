import '../global.css'
import { Stack } from 'expo-router'
import { AuthProvider } from '../lib/auth-context'

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
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
