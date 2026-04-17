import { useCallback, useEffect, useState } from 'react'
import { Redirect, Tabs, router } from 'expo-router'
import { ActivityIndicator, View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../lib/auth-context'
import { supabase } from '../../lib/supabase'

export default function TabsLayout() {
  const { session, user, loading } = useAuth()
  const [unreadMessages, setUnreadMessages] = useState(0)

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return

    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)
      .neq('sender_id', user.id)

    setUnreadMessages(count ?? 0)
  }, [user])

  useEffect(() => {
    if (!user) return

    fetchUnreadCount()

    // Listen for new messages in realtime
    const channel = supabase
      .channel('tab-unread')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${user.id}`,
        },
        () => {
          setUnreadMessages((c) => c + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        () => {
          // Re-fetch on read status changes
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchUnreadCount])

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
        name="create"
        listeners={{
          tabPress: (e) => {
            e.preventDefault()
            router.push('/dish/create')
          },
        }}
        options={{
          title: '',
          tabBarIcon: () => (
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: '#22c55e',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                shadowColor: '#22c55e',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons name="add" size={28} color="#ffffff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Berichten',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="chatbubbles-outline" size={size} color={color} />
              {unreadMessages > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    backgroundColor: '#ef4444',
                    borderRadius: 9,
                    minWidth: 18,
                    height: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </Text>
                </View>
              )}
            </View>
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
