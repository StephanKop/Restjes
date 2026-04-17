import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { formatRelativeDate } from '../../lib/format'

interface Conversation {
  id: string
  merchant_id: string
  consumer_id: string
  last_message_at: string | null
  merchant: {
    id: string
    business_name: string
    logo_url: string | null
  }
  consumer: {
    id: string
    display_name: string
    avatar_url: string | null
  }
  last_message: {
    content: string
    sender_id: string
    is_read: boolean
  } | null
  unread_count: number
}

export default function MessagesScreen() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchConversations = useCallback(async () => {
    if (!user) return

    // Fetch conversations where user is consumer OR merchant owner
    const { data: myMerchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('profile_id', user.id)
      .limit(1)

    const merchantId = myMerchant?.[0]?.id

    let query = supabase
      .from('conversations')
      .select(
        `
        id, merchant_id, consumer_id, last_message_at,
        merchant:merchants!merchant_id (id, business_name, logo_url),
        consumer:profiles!consumer_id (id, display_name, avatar_url)
      `
      )
      .order('last_message_at', { ascending: false })

    if (merchantId) {
      query = query.or(`consumer_id.eq.${user.id},merchant_id.eq.${merchantId}`)
    } else {
      query = query.eq('consumer_id', user.id)
    }

    const { data: convos, error } = await query

    if (error || !convos) return

    // Fetch last message and unread count for each conversation
    const enriched = await Promise.all(
      (convos as unknown as Conversation[]).map(async (convo) => {
        const [lastMsgRes, unreadRes] = await Promise.all([
          supabase
            .from('messages')
            .select('content, sender_id, is_read')
            .eq('conversation_id', convo.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', convo.id)
            .eq('is_read', false)
            .neq('sender_id', user.id),
        ])

        return {
          ...convo,
          last_message: lastMsgRes.data ?? null,
          unread_count: unreadRes.count ?? 0,
        }
      })
    )

    setConversations(enriched)
  }, [user])

  useEffect(() => {
    setLoading(true)
    fetchConversations().finally(() => setLoading(false))
  }, [fetchConversations])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchConversations()
    setRefreshing(false)
  }, [fetchConversations])

  const renderConversation = ({ item }: { item: Conversation }) => {
    const hasUnread = item.unread_count > 0
    const isOwnMerchant = item.consumer_id !== user?.id

    // Show the other party's info
    const otherName = isOwnMerchant
      ? item.consumer?.display_name ?? 'Onbekend'
      : item.merchant?.business_name ?? 'Onbekend'
    const otherAvatar = isOwnMerchant
      ? item.consumer?.avatar_url
      : item.merchant?.logo_url

    return (
      <Pressable
        className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        {/* Avatar */}
        {otherAvatar ? (
          <Image
            source={{ uri: otherAvatar }}
            className="w-12 h-12 rounded-xl"
            resizeMode="cover"
          />
        ) : (
          <View className="w-12 h-12 rounded-xl bg-brand-100 items-center justify-center">
            <Text className="text-lg font-bold text-brand-700">
              {otherName[0].toUpperCase()}
            </Text>
          </View>
        )}

        {/* Content */}
        <View className="flex-1 ml-3 mr-2">
          <Text
            className={`text-base text-warm-800 ${hasUnread ? 'font-bold' : 'font-semibold'}`}
            numberOfLines={1}
          >
            {otherName}
          </Text>
          {item.last_message && (
            <Text
              className={`text-sm mt-0.5 ${hasUnread ? 'text-warm-700 font-semibold' : 'text-warm-500'}`}
              numberOfLines={1}
            >
              {item.last_message.sender_id === user?.id ? 'Jij: ' : ''}
              {item.last_message.content}
            </Text>
          )}
        </View>

        {/* Time + unread */}
        <View className="items-end">
          {item.last_message_at && (
            <Text className="text-xs text-warm-400">
              {formatRelativeDate(item.last_message_at)}
            </Text>
          )}
          {hasUnread && (
            <View className="bg-brand-500 rounded-full min-w-5 h-5 items-center justify-center px-1.5 mt-1">
              <Text className="text-xs font-bold text-white">
                {item.unread_count}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-offwhite" edges={['bottom']}>
      <View className="flex-1 px-5 pt-4">
        <Text className="text-2xl font-bold text-warm-800 mb-1">
          Berichten
        </Text>
        <Text className="text-base text-warm-500 mb-4">
          Je gesprekken
        </Text>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={renderConversation}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#22c55e"
              />
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <Ionicons name="chatbubbles-outline" size={48} color="#d1cbc4" />
                <Text className="text-warm-400 text-base text-center mt-4">
                  Je hebt nog geen berichten
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  )
}
