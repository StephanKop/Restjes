import { Redirect, Tabs } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../lib/auth-context'

export default function TabsLayout() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-offwhite">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    )
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#faf9f6' },
        headerShadowVisible: false,
        headerTintColor: '#3d3833',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#b0a89e',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e1dc',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ontdekken',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Reserveringen',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Berichten',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profiel',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
