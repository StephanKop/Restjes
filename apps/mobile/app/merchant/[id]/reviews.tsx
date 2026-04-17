import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../../lib/supabase'
import { formatRelativeDate } from '../../../lib/format'

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  merchant_reply: string | null
  consumer: {
    display_name: string | null
    avatar_url: string | null
  }
  reservation: {
    dish: { title: string }
  } | null
}

interface MerchantInfo {
  business_name: string
  avg_rating: number | null
  review_count: number
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<Ionicons key={i} name="star" size={size} color="#f59e0b" />)
    } else if (i - 0.5 <= rating) {
      stars.push(<Ionicons key={i} name="star-half" size={size} color="#f59e0b" />)
    } else {
      stars.push(<Ionicons key={i} name="star-outline" size={size} color="#d1cbc4" />)
    }
  }
  return <View className="flex-row">{stars}</View>
}

export default function MerchantReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()

  const [merchant, setMerchant] = useState<MerchantInfo | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchReviews = useCallback(async () => {
    const [merchantRes, reviewsRes] = await Promise.all([
      supabase
        .from('merchants')
        .select('business_name, avg_rating, review_count')
        .eq('id', id)
        .single(),
      supabase
        .from('reviews')
        .select(
          `
          id, rating, comment, created_at, merchant_reply,
          consumer:profiles!consumer_id (display_name, avatar_url),
          reservation:reservations (
            dish:dishes (title)
          )
        `
        )
        .eq('merchant_id', id)
        .order('created_at', { ascending: false }),
    ])

    if (merchantRes.data) {
      setMerchant(merchantRes.data as MerchantInfo)
      navigation.setOptions({
        headerTitle: `Beoordelingen`,
      })
    }
    if (reviewsRes.data) setReviews(reviewsRes.data as unknown as Review[])
  }, [id, navigation])

  useEffect(() => {
    fetchReviews().finally(() => setLoading(false))
  }, [fetchReviews])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchReviews()
    setRefreshing(false)
  }, [fetchReviews])

  // Rating distribution
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const review of reviews) {
    distribution[review.rating] = (distribution[review.rating] ?? 0) + 1
  }
  const totalReviews = reviews.length

  const renderReview = ({ item }: { item: Review }) => {
    const dishTitle =
      item.reservation?.dish?.title ?? null

    return (
      <View className="bg-white rounded-2xl p-4 mb-3 mx-5">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            {item.consumer?.avatar_url ? (
              <Image
                source={{ uri: item.consumer.avatar_url }}
                className="w-9 h-9 rounded-full mr-2.5"
              />
            ) : (
              <View className="w-9 h-9 rounded-full bg-brand-100 items-center justify-center mr-2.5">
                <Text className="text-xs font-bold text-brand-700">
                  {(item.consumer?.display_name ?? '?')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-sm font-bold text-warm-800">
                {item.consumer?.display_name ?? 'Anoniem'}
              </Text>
              {dishTitle && (
                <Text className="text-xs text-warm-400" numberOfLines={1}>
                  {dishTitle}
                </Text>
              )}
            </View>
          </View>
          <Text className="text-xs text-warm-400">
            {formatRelativeDate(item.created_at)}
          </Text>
        </View>

        <StarRating rating={item.rating} />

        {item.comment && (
          <Text className="text-sm text-warm-600 mt-2 leading-5">
            {item.comment}
          </Text>
        )}

        {item.merchant_reply && (
          <View className="mt-3 rounded-xl bg-brand-50 p-3">
            <Text className="text-xs font-bold text-brand-700 mb-1">
              Reactie van aanbieder
            </Text>
            <Text className="text-sm text-brand-800">{item.merchant_reply}</Text>
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
    <FlatList
      className="flex-1 bg-offwhite"
      data={reviews}
      keyExtractor={(item) => item.id}
      renderItem={renderReview}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
      }
      ListHeaderComponent={
        merchant && totalReviews > 0 ? (
          <View className="mx-5 mb-4">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-4">
                <View className="items-center mr-6">
                  <Text className="text-4xl font-bold text-warm-800">
                    {merchant.avg_rating != null ? merchant.avg_rating.toFixed(1) : '-'}
                  </Text>
                  <StarRating rating={Math.round(merchant.avg_rating ?? 0)} size={16} />
                  <Text className="text-xs text-warm-400 mt-1">
                    {merchant.review_count}{' '}
                    {merchant.review_count === 1 ? 'beoordeling' : 'beoordelingen'}
                  </Text>
                </View>
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
        <View className="items-center justify-center py-20 px-5">
          <Ionicons name="star-outline" size={48} color="#d1cbc4" />
          <Text className="text-warm-400 text-base text-center mt-4">
            Nog geen beoordelingen
          </Text>
        </View>
      }
    />
  )
}
