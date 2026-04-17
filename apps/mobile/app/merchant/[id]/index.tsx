import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useNavigation, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../../lib/supabase'
import { formatPickupTime, formatRelativeDate } from '../../../lib/format'

interface Merchant {
  id: string
  business_name: string
  description: string | null
  city: string
  address_line1: string | null
  postal_code: string | null
  logo_url: string | null
  avg_rating: number | null
  review_count: number
}

interface MerchantDish {
  id: string
  title: string
  image_url: string | null
  quantity_available: number
  pickup_start: string | null
  pickup_end: string | null
  is_vegetarian: boolean
  is_vegan: boolean
}

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  merchant_reply: string | null
  profile: {
    display_name: string | null
    avatar_url: string | null
  }
}

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
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

export default function MerchantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()

  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [dishes, setDishes] = useState<MerchantDish[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMerchant = useCallback(async () => {
    const [merchantRes, dishesRes, reviewsRes] = await Promise.all([
      supabase
        .from('merchants')
        .select('id, business_name, description, city, address_line1, postal_code, logo_url, avg_rating, review_count')
        .eq('id', id)
        .single(),
      supabase
        .from('dishes')
        .select('id, title, image_url, quantity_available, pickup_start, pickup_end, is_vegetarian, is_vegan')
        .eq('merchant_id', id)
        .eq('status', 'available')
        .gt('quantity_available', 0)
        .order('pickup_start', { ascending: true }),
      supabase
        .from('reviews')
        .select('id, rating, comment, created_at, merchant_reply, profile:profiles!consumer_id (display_name, avatar_url)')
        .eq('merchant_id', id)
        .order('created_at', { ascending: false })
        .limit(3),
    ])

    if (merchantRes.data) {
      setMerchant(merchantRes.data as Merchant)
      navigation.setOptions({ headerTitle: merchantRes.data.business_name })
    }
    if (dishesRes.data) setDishes(dishesRes.data as MerchantDish[])
    if (reviewsRes.data) setReviews(reviewsRes.data as unknown as Review[])
  }, [id, navigation])

  useEffect(() => {
    fetchMerchant().finally(() => setLoading(false))
  }, [fetchMerchant])

  if (loading) {
    return (
      <View className="flex-1 bg-offwhite items-center justify-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    )
  }

  if (!merchant) {
    return (
      <View className="flex-1 bg-offwhite items-center justify-center px-5">
        <Text className="text-warm-400 text-base text-center">
          Aanbieder niet gevonden.
        </Text>
      </View>
    )
  }

  const renderDishCard = ({ item }: { item: MerchantDish }) => (
    <Pressable
      className="bg-white rounded-2xl mr-4 overflow-hidden w-56"
      onPress={() => router.push(`/dish/${item.id}`)}
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          className="w-full h-32"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-32 bg-brand-100 items-center justify-center">
          <Ionicons name="restaurant-outline" size={32} color="#22c55e" />
        </View>
      )}
      <View className="p-3">
        <Text className="text-sm font-bold text-warm-800" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-xs text-warm-500 mt-1">
          {formatPickupTime(item.pickup_start, item.pickup_end)}
        </Text>
        <View className="flex-row gap-1 mt-2">
          {item.is_vegan && (
            <View className="bg-brand-100 rounded-lg px-2 py-0.5">
              <Text className="text-xs text-brand-700">Vegan</Text>
            </View>
          )}
          {item.is_vegetarian && !item.is_vegan && (
            <View className="bg-brand-100 rounded-lg px-2 py-0.5">
              <Text className="text-xs text-brand-700">Vega</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  )

  const renderReview = (review: Review) => (
    <View key={review.id} className="bg-white rounded-xl p-4 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          {review.profile?.avatar_url ? (
            <Image
              source={{ uri: review.profile.avatar_url }}
              className="w-8 h-8 rounded-full mr-2"
            />
          ) : (
            <View className="w-8 h-8 rounded-full bg-brand-100 items-center justify-center mr-2">
              <Text className="text-xs font-bold text-brand-700">
                {(review.profile?.display_name ?? '?')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="text-sm font-bold text-warm-800">
            {review.profile?.display_name ?? 'Anoniem'}
          </Text>
        </View>
        <Text className="text-xs text-warm-400">
          {formatRelativeDate(review.created_at)}
        </Text>
      </View>
      <StarRating rating={review.rating} size={14} />
      {review.comment && (
        <Text className="text-sm text-warm-600 mt-2 leading-5">
          {review.comment}
        </Text>
      )}
      {review.merchant_reply && (
        <View className="mt-3 rounded-xl bg-brand-50 p-3">
          <Text className="text-xs font-bold text-brand-700 mb-1">
            Reactie van aanbieder
          </Text>
          <Text className="text-sm text-brand-800">{review.merchant_reply}</Text>
        </View>
      )}
    </View>
  )

  return (
    <FlatList
      className="flex-1 bg-offwhite"
      data={[]}
      renderItem={null}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View className="px-5 pt-5 pb-8">
          {/* Header */}
          <View className="flex-row items-center mb-4">
            {merchant.logo_url ? (
              <Image
                source={{ uri: merchant.logo_url }}
                className="w-16 h-16 rounded-2xl"
                resizeMode="cover"
              />
            ) : (
              <View className="w-16 h-16 rounded-2xl bg-brand-100 items-center justify-center">
                <Ionicons name="storefront-outline" size={32} color="#22c55e" />
              </View>
            )}
            <View className="flex-1 ml-4">
              <Text className="text-2xl font-bold text-warm-800">
                {merchant.business_name}
              </Text>
              <Text className="text-sm text-warm-500 mt-0.5">
                {merchant.address_line1 ? `${merchant.address_line1}, ` : ''}
                {merchant.postal_code ? `${merchant.postal_code} ` : ''}
                {merchant.city}
              </Text>
            </View>
          </View>

          {/* Rating */}
          {merchant.avg_rating !== null && merchant.review_count > 0 && (
            <View className="flex-row items-center mb-4">
              <StarRating rating={merchant.avg_rating} size={18} />
              <Text className="text-sm font-bold text-warm-700 ml-2">
                {merchant.avg_rating.toFixed(1)}
              </Text>
              <Text className="text-sm text-warm-500 ml-1">
                ({merchant.review_count} {merchant.review_count === 1 ? 'beoordeling' : 'beoordelingen'})
              </Text>
            </View>
          )}

          {/* Description */}
          {merchant.description && (
            <Text className="text-base text-warm-600 leading-6 mb-6">
              {merchant.description}
            </Text>
          )}

          {/* Available dishes */}
          <Text className="text-lg font-bold text-warm-800 mb-3">
            Beschikbare gerechten
          </Text>
          {dishes.length > 0 ? (
            <FlatList
              data={dishes}
              keyExtractor={(item) => item.id}
              renderItem={renderDishCard}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            />
          ) : (
            <View className="bg-white rounded-xl p-4">
              <Text className="text-sm text-warm-400 text-center">
                Geen gerechten beschikbaar op dit moment.
              </Text>
            </View>
          )}

          {/* Reviews */}
          <View className="flex-row items-center justify-between mt-8 mb-3">
            <Text className="text-lg font-bold text-warm-800">
              Beoordelingen
            </Text>
            {reviews.length > 0 && (
              <Pressable onPress={() => router.push(`/merchant/${merchant.id}/reviews` as any)}>
                <Text className="text-sm font-bold text-brand-600">
                  Alles bekijken
                </Text>
              </Pressable>
            )}
          </View>
          {reviews.length > 0 ? (
            <>
              {reviews.map(renderReview)}
              {merchant.review_count > 3 && (
                <Pressable
                  className="bg-white rounded-xl py-3.5 items-center mt-1"
                  onPress={() => router.push(`/merchant/${merchant.id}/reviews` as any)}
                >
                  <Text className="text-sm font-bold text-brand-600">
                    Alle {merchant.review_count} beoordelingen bekijken
                  </Text>
                </Pressable>
              )}
            </>
          ) : (
            <View className="bg-white rounded-xl p-4">
              <Text className="text-sm text-warm-400 text-center">
                Nog geen beoordelingen.
              </Text>
            </View>
          )}
        </View>
      }
    />
  )
}
