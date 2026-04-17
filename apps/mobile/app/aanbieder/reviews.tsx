import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { formatRelativeDate } from '../../lib/format'

interface ReviewItem {
  id: string
  rating: number
  comment: string | null
  created_at: string
  merchant_reply: string | null
  merchant_replied_at: string | null
  consumer: {
    display_name: string | null
    avatar_url: string | null
  }
  reservation: {
    dish: { title: string }
  } | null
}

interface MerchantInfo {
  id: string
  avg_rating: number | null
  review_count: number
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= Math.floor(rating) ? 'star' : star - 0.5 <= rating ? 'star-half' : 'star-outline'}
          size={size}
          color={star <= rating ? '#f59e0b' : '#d1cbc4'}
        />
      ))}
    </View>
  )
}

export default function MerchantReviewsScreen() {
  const { user } = useAuth()
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)

  const maxReplyChars = 300

  const fetchReviews = useCallback(async () => {
    if (!user) return

    const { data: merchantData } = await supabase
      .from('merchants')
      .select('id, avg_rating, review_count')
      .eq('profile_id', user.id)
      .single()

    if (!merchantData) return

    setMerchant(merchantData as MerchantInfo)

    const { data } = await supabase
      .from('reviews')
      .select(
        `
        id, rating, comment, created_at, merchant_reply, merchant_replied_at,
        consumer:profiles!consumer_id (display_name, avatar_url),
        reservation:reservations (
          dish:dishes (title)
        )
      `
      )
      .eq('merchant_id', merchantData.id)
      .order('created_at', { ascending: false })

    if (data) setReviews(data as unknown as ReviewItem[])
  }, [user])

  useEffect(() => {
    fetchReviews().finally(() => setLoading(false))
  }, [fetchReviews])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchReviews()
    setRefreshing(false)
  }, [fetchReviews])

  const handleSubmitReply = async (reviewId: string) => {
    const trimmed = replyText.trim()
    if (!trimmed) return

    setSubmittingReply(true)

    const { error } = await supabase
      .from('reviews')
      .update({
        merchant_reply: trimmed,
        merchant_replied_at: new Date().toISOString(),
      })
      .eq('id', reviewId)

    setSubmittingReply(false)

    if (error) {
      Alert.alert('Fout', 'Kon reactie niet opslaan. Probeer het opnieuw.')
      return
    }

    setReplyingTo(null)
    setReplyText('')
    fetchReviews()
  }

  // Calculate distribution
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const review of reviews) {
    distribution[review.rating] = (distribution[review.rating] ?? 0) + 1
  }
  const totalReviews = reviews.length
  const unreplied = reviews.filter((r) => !r.merchant_reply).length

  const renderReview = ({ item }: { item: ReviewItem }) => {
    const isReplying = replyingTo === item.id

    return (
      <View className="bg-white rounded-2xl p-4 mb-3">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            {item.consumer?.avatar_url ? (
              <Image
                source={{ uri: item.consumer.avatar_url }}
                className="w-8 h-8 rounded-full mr-2"
              />
            ) : (
              <View className="w-8 h-8 rounded-full bg-brand-100 items-center justify-center mr-2">
                <Text className="text-xs font-bold text-brand-700">
                  {(item.consumer?.display_name ?? '?')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-sm font-bold text-warm-800">
                {item.consumer?.display_name ?? 'Anoniem'}
              </Text>
              {item.reservation?.dish?.title && (
                <Text className="text-xs text-warm-400" numberOfLines={1}>
                  {item.reservation.dish.title}
                </Text>
              )}
            </View>
          </View>
          <Text className="text-xs text-warm-400">
            {formatRelativeDate(item.created_at)}
          </Text>
        </View>

        {/* Rating */}
        <StarRow rating={item.rating} />

        {/* Comment */}
        {item.comment && (
          <Text className="text-sm text-warm-600 mt-2 leading-5">
            {item.comment}
          </Text>
        )}

        {/* Existing reply */}
        {item.merchant_reply && !isReplying && (
          <View className="mt-3 rounded-xl bg-brand-50 p-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-xs font-bold text-brand-700">Jouw reactie</Text>
              <Pressable
                onPress={() => {
                  setReplyingTo(item.id)
                  setReplyText(item.merchant_reply ?? '')
                }}
              >
                <Text className="text-xs font-bold text-brand-600">Bewerken</Text>
              </Pressable>
            </View>
            <Text className="text-sm text-brand-800">{item.merchant_reply}</Text>
          </View>
        )}

        {/* Reply button / form */}
        {!item.merchant_reply && !isReplying && (
          <Pressable
            className="mt-2"
            onPress={() => {
              setReplyingTo(item.id)
              setReplyText('')
            }}
          >
            <Text className="text-sm font-bold text-brand-600">Reageren</Text>
          </Pressable>
        )}

        {isReplying && (
          <View className="mt-3">
            <TextInput
              className="bg-warm-50 border border-warm-200 rounded-xl px-4 py-3 text-sm text-warm-800 min-h-[80px]"
              placeholder="Reageer op deze beoordeling..."
              placeholderTextColor="#b0a89e"
              value={replyText}
              onChangeText={(text) => {
                if (text.length <= maxReplyChars) setReplyText(text)
              }}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <View className="flex-row items-center justify-between mt-2">
              <Text
                className={`text-xs ${
                  replyText.length > maxReplyChars * 0.9 ? 'text-red-500' : 'text-warm-400'
                }`}
              >
                {replyText.length}/{maxReplyChars}
              </Text>
              <View className="flex-row gap-2">
                <Pressable
                  className="border border-warm-200 rounded-xl px-4 py-2"
                  onPress={() => {
                    setReplyingTo(null)
                    setReplyText('')
                  }}
                >
                  <Text className="text-sm font-bold text-warm-600">Annuleren</Text>
                </Pressable>
                <Pressable
                  className={`rounded-xl px-4 py-2 ${
                    replyText.trim() && !submittingReply
                      ? 'bg-brand-500 active:bg-brand-600'
                      : 'bg-warm-200'
                  }`}
                  onPress={() => handleSubmitReply(item.id)}
                  disabled={!replyText.trim() || submittingReply}
                >
                  {submittingReply ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text
                      className={`text-sm font-bold ${
                        replyText.trim() ? 'text-white' : 'text-warm-400'
                      }`}
                    >
                      {item.merchant_reply ? 'Bijwerken' : 'Plaatsen'}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        )}
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
    <SafeAreaView className="flex-1 bg-offwhite" edges={['bottom']}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22c55e"
          />
        }
        ListHeaderComponent={
          totalReviews > 0 ? (
            <View className="mb-4">
              {unreplied > 0 && (
                <View className="bg-amber-100 rounded-xl px-4 py-2 mb-4 self-start">
                  <Text className="text-sm font-bold text-amber-800">
                    {unreplied} onbeantwoord
                  </Text>
                </View>
              )}

              {/* Rating overview */}
              <View className="bg-white rounded-2xl p-5 mb-4">
                <View className="flex-row items-center mb-4">
                  <View className="items-center mr-6">
                    <Text className="text-4xl font-bold text-warm-800">
                      {merchant?.avg_rating != null
                        ? merchant.avg_rating.toFixed(1)
                        : '-'}
                    </Text>
                    <StarRow rating={Math.round(merchant?.avg_rating ?? 0)} size={16} />
                    <Text className="text-xs text-warm-400 mt-1">
                      {merchant?.review_count ?? 0}{' '}
                      {(merchant?.review_count ?? 0) === 1 ? 'beoordeling' : 'beoordelingen'}
                    </Text>
                  </View>

                  {/* Distribution bars */}
                  <View className="flex-1 gap-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = distribution[star] ?? 0
                      const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                      return (
                        <View key={star} className="flex-row items-center gap-2">
                          <Text className="text-xs text-warm-500 w-4 text-right">{star}</Text>
                          <View className="flex-1 h-2 rounded-full bg-warm-100 overflow-hidden">
                            <View
                              className="h-full rounded-full bg-amber-500"
                              style={{ width: `${pct}%` }}
                            />
                          </View>
                          <Text className="text-xs text-warm-400 w-5">{count}</Text>
                        </View>
                      )
                    })}
                  </View>
                </View>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="star-outline" size={48} color="#d1cbc4" />
            <Text className="text-warm-400 text-base text-center mt-4">
              Je hebt nog geen beoordelingen ontvangen
            </Text>
            <Text className="text-warm-400 text-sm text-center mt-1">
              Zodra klanten een beoordeling achterlaten, verschijnen ze hier.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}
