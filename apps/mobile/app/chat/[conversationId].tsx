import { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { formatRelativeDate } from '../../lib/format'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

interface ConversationInfo {
  id: string
  merchant_id: string
  consumer_id: string
  merchant: {
    business_name: string
    profile_id: string
  }
}

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>()
  const navigation = useNavigation()
  const { user } = useAuth()

  const [messages, setMessages] = useState<Message[]>([])
  const [convo, setConvo] = useState<ConversationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const flatListRef = useRef<FlatList<Message>>(null)

  // Fetch conversation info
  const fetchConversation = useCallback(async () => {
    const { data } = await supabase
      .from('conversations')
      .select('id, merchant_id, consumer_id, merchant:merchants!merchant_id (business_name, profile_id)')
      .eq('id', conversationId)
      .single()

    if (data) {
      const info = data as unknown as ConversationInfo
      setConvo(info)
      navigation.setOptions({ headerTitle: info.merchant.business_name })
    }
  }, [conversationId, navigation])

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, is_read, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      setMessages(data)
    }
  }, [conversationId])

  // Mark unread messages as read
  const markAsRead = useCallback(async () => {
    if (!user) return

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('is_read', false)
  }, [conversationId, user])

  // Subscribe to realtime
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchConversation(), fetchMessages()])
      await markAsRead()
      setLoading(false)
    }
    init()

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => [newMsg, ...prev])

          // Mark as read if from other party
          if (newMsg.sender_id !== user?.id) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id)
              .then(() => {})
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [conversationId, fetchConversation, fetchMessages, markAsRead, user])

  const handleSend = async () => {
    const content = input.trim()
    if (!content || !user || !convo) return

    setSending(true)
    setInput('')

    const { error } = await supabase.from('messages').insert({
      conversation_id: convo.id,
      sender_id: user.id,
      content,
      is_read: false,
    })

    if (!error) {
      // Update last_message_at on conversation
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', convo.id)
    }

    setSending(false)
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.sender_id === user?.id

    return (
      <View
        className={`mb-2 max-w-[80%] ${isOwn ? 'self-end' : 'self-start'}`}
      >
        <View
          className={`rounded-2xl px-4 py-3 ${
            isOwn ? 'bg-brand-500' : 'bg-white'
          }`}
        >
          <Text
            className={`text-base leading-5 ${
              isOwn ? 'text-white' : 'text-warm-800'
            }`}
          >
            {item.content}
          </Text>
        </View>
        <Text
          className={`text-xs text-warm-400 mt-1 ${
            isOwn ? 'text-right' : 'text-left'
          }`}
        >
          {formatRelativeDate(item.created_at)}
        </Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View className="flex-1 bg-offwhite items-center justify-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-offwhite"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 8 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="chatbubble-outline" size={48} color="#d1cbc4" />
            <Text className="text-warm-400 text-base text-center mt-4">
              Stuur het eerste bericht
            </Text>
          </View>
        }
      />

      {/* Input bar */}
      <View className="bg-white border-t border-warm-200 px-4 pt-3 pb-8 flex-row items-end">
        <TextInput
          className="flex-1 bg-warm-100 rounded-xl px-4 py-3 text-base text-warm-800 max-h-24"
          placeholder="Schrijf een bericht..."
          placeholderTextColor="#b0a89e"
          value={input}
          onChangeText={setInput}
          multiline
          returnKeyType="default"
        />
        <Pressable
          className={`ml-3 w-11 h-11 rounded-xl items-center justify-center ${
            input.trim() ? 'bg-brand-500' : 'bg-warm-200'
          }`}
          onPress={handleSend}
          disabled={!input.trim() || sending}
        >
          <Ionicons
            name="send"
            size={18}
            color={input.trim() ? '#ffffff' : '#b0a89e'}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}
