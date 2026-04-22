import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useNavigation, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'
import { formatPickupTime, allergenLabel } from '../../../lib/format'
import { useTranslation } from '../../../lib/i18n'
import { localeMeta, type Locale } from '@kliekjesclub/i18n'

interface DishDetail {
  id: string
  title: string
  description: string | null
  image_url: string | null
  quantity_available: number
  pickup_start: string | null
  pickup_end: string | null
  bring_own_container: boolean
  is_frozen: boolean
  expires_at: string | null
  is_vegetarian: boolean
  is_vegan: boolean
  status: string
  merchant: {
    id: string
    business_name: string
    city: string
    address_line1: string | null
    logo_url: string | null
    avg_rating: number | null
    review_count: number
    is_verified: boolean
  }
}

interface Ingredient {
  id: string
  name: string
}

interface Allergen {
  id: string
  allergen: string
}

export default function DishDetailScreen() {
  const { t, locale } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()
  const { user } = useAuth()

  const [dish, setDish] = useState<DishDetail | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [allergens, setAllergens] = useState<Allergen[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [reserving, setReserving] = useState(false)
  const [isOwnDish, setIsOwnDish] = useState(false)

  const fetchDish = useCallback(async () => {
    const [dishRes, ingredientsRes, allergensRes] = await Promise.all([
      supabase
        .from('dishes')
        .select(
          `
          id, title, description, image_url, quantity_available, status,
          pickup_start, pickup_end, bring_own_container, is_frozen, expires_at, is_vegetarian, is_vegan,
          merchant:merchants!merchant_id (id, business_name, city, address_line1, logo_url, avg_rating, review_count, is_verified)
        `
        )
        .eq('id', id)
        .single(),
      supabase
        .from('dish_ingredients')
        .select('id, name')
        .eq('dish_id', id),
      supabase
        .from('dish_allergies')
        .select('id, allergen')
        .eq('dish_id', id),
    ])

    if (dishRes.data) {
      const d = dishRes.data as unknown as DishDetail
      setDish(d)
      navigation.setOptions({ headerTitle: d.title })

      // Check if this is the user's own dish
      if (user) {
        const { data: ownMerchant } = await supabase
          .from('merchants')
          .select('id')
          .eq('profile_id', user.id)
          .eq('id', d.merchant.id)
          .maybeSingle()
        setIsOwnDish(!!ownMerchant)
      }
    }
    if (ingredientsRes.data) setIngredients(ingredientsRes.data)
    if (allergensRes.data) setAllergens(allergensRes.data)
  }, [id, navigation, user])

  useEffect(() => {
    fetchDish().finally(() => setLoading(false))
  }, [fetchDish])

  const handleReserve = async () => {
    if (!dish || !user) return

    setReserving(true)
    const { error } = await supabase.from('reservations').insert({
      dish_id: dish.id,
      consumer_id: user.id,
      merchant_id: dish.merchant.id,
      quantity,
      status: 'pending',
      pickup_time: dish.pickup_start,
    })
    setReserving(false)

    if (error) {
      Alert.alert(t('dish.mobile.reserve.errorTitle'), t('dish.mobile.reserve.errorMessage'))
    } else {
      // Decrement dish quantity via RPC (bypasses RLS)
      await supabase.rpc('decrement_dish_quantity', {
        p_dish_id: dish.id,
        p_quantity: quantity,
      })

      Alert.alert(
        t('dish.mobile.reserve.successTitle'),
        t(quantity === 1 ? 'dish.mobile.reserve.successSingular' : 'dish.mobile.reserve.successPlural', { count: quantity, dishTitle: dish.title }),
        [
          { text: t('dish.mobile.reserve.toReservations'), onPress: () => router.push('/(tabs)/reservations') },
          { text: t('dish.mobile.reserve.ok') },
        ]
      )
    }
  }

  const handleChat = async () => {
    if (!dish || !user) return

    // Prevent chatting with own merchant profile
    const { data: ownMerchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('profile_id', user.id)
      .eq('id', dish.merchant.id)
      .maybeSingle()

    if (ownMerchant) {
      Alert.alert(t('dish.mobile.chat.ownDishTitle'), t('dish.mobile.chat.ownDishMessage'))
      return
    }

    // Check for existing conversation about this dish
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('merchant_id', dish.merchant.id)
      .eq('consumer_id', user.id)
      .eq('dish_id', dish.id)
      .single()

    if (existing) {
      router.push(`/chat/${existing.id}`)
      return
    }

    // Create a new conversation
    const { data: created, error } = await supabase
      .from('conversations')
      .insert({
        merchant_id: dish.merchant.id,
        consumer_id: user.id,
        dish_id: dish.id,
      })
      .select('id')
      .single()

    if (error || !created) {
      Alert.alert(t('dish.mobile.chat.startFailedTitle'), t('dish.mobile.chat.startFailedMessage'))
      return
    }

    router.push(`/chat/${created.id}`)
  }

  if (loading) {
    return (
      <View className="flex-1 bg-offwhite items-center justify-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    )
  }

  const isAvailable = dish?.status === 'available' && (dish?.quantity_available ?? 0) > 0

  if (!dish) {
    return (
      <View className="flex-1 bg-offwhite items-center justify-center px-5">
        <Text className="text-warm-400 text-base text-center">
          {t('dish.mobile.notFound')}
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-offwhite">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        {dish.image_url ? (
          <Image
            source={{ uri: dish.image_url }}
            className="w-full h-64"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-64 bg-brand-100 items-center justify-center">
            <Ionicons name="restaurant-outline" size={64} color="#22c55e" />
          </View>
        )}

        <View className="px-5 pt-5 pb-32">
          {/* Title + description */}
          <Text className="text-2xl font-bold text-warm-800">{dish.title}</Text>
          {dish.description && (
            <Text className="text-base text-warm-600 mt-2 leading-6">
              {dish.description}
            </Text>
          )}

          {/* Info cards */}
          <View className="mt-5 gap-3">
            <View className="bg-white rounded-xl p-4 flex-row items-center">
              <View className="bg-brand-100 rounded-lg p-2 mr-3">
                <Ionicons name="time-outline" size={20} color="#22c55e" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-warm-500 uppercase">{t('dish.mobile.labels.pickup')}</Text>
                <Text className="text-sm font-bold text-warm-800">
                  {formatPickupTime(dish.pickup_start, dish.pickup_end)}
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-xl p-4 flex-row items-center">
              <View className="bg-brand-100 rounded-lg p-2 mr-3">
                <Ionicons name="layers-outline" size={20} color="#22c55e" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-warm-500 uppercase">{t('dish.mobile.labels.available')}</Text>
                <Text className="text-sm font-bold text-warm-800">
                  {t(dish.quantity_available === 1 ? 'dish.detail.info.portionsSingular' : 'dish.detail.info.portionsPlural', { count: dish.quantity_available })}
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-xl p-4 flex-row items-center">
              <View className={`${dish.is_frozen ? 'bg-blue-100' : 'bg-orange-100'} rounded-lg p-2 mr-3`}>
                <Ionicons name={dish.is_frozen ? 'snow-outline' : 'sunny-outline'} size={20} color={dish.is_frozen ? '#1d4ed8' : '#ea580c'} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-warm-500 uppercase">{t('dish.mobile.labels.type')}</Text>
                <Text className="text-sm font-bold text-warm-800">
                  {dish.is_frozen ? t('dish.detail.badges.frozen') : t('dish.detail.badges.fresh')}
                </Text>
              </View>
            </View>

            {!dish.is_frozen && dish.expires_at && (
              <View className="bg-white rounded-xl p-4 flex-row items-center">
                <View className="bg-red-100 rounded-lg p-2 mr-3">
                  <Ionicons name="time-outline" size={20} color="#dc2626" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-warm-500 uppercase">{t('dish.mobile.labels.bestBy')}</Text>
                  <Text className="text-sm font-bold text-warm-800">
                    {new Date(dish.expires_at).toLocaleString(localeMeta[locale as Locale]?.htmlLang ?? 'nl-NL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            )}

            {dish.bring_own_container && (
              <View className="bg-white rounded-xl p-4 flex-row items-center">
                <View className="bg-amber-100 rounded-lg p-2 mr-3">
                  <Ionicons name="cube-outline" size={20} color="#d97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-warm-500 uppercase">{t('dish.mobile.labels.packaging')}</Text>
                  <Text className="text-sm font-bold text-warm-800">
                    {t('dish.mobile.labels.bringOwnContainer')}
                  </Text>
                </View>
              </View>
            )}

            {/* Dietary labels */}
            {(dish.is_vegetarian || dish.is_vegan) && (
              <View className="flex-row gap-2">
                {dish.is_vegan && (
                  <View className="bg-brand-100 rounded-xl px-4 py-2.5 flex-row items-center">
                    <Ionicons name="leaf-outline" size={16} color="#15803d" />
                    <Text className="text-sm font-bold text-brand-700 ml-1.5">{t('dish.badges.vegan')}</Text>
                  </View>
                )}
                {dish.is_vegetarian && (
                  <View className="bg-brand-100 rounded-xl px-4 py-2.5 flex-row items-center">
                    <Ionicons name="leaf-outline" size={16} color="#15803d" />
                    <Text className="text-sm font-bold text-brand-700 ml-1.5">{t('dish.badges.vegetarian')}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <View className="mt-6">
              <Text className="text-lg font-bold text-warm-800 mb-3">{t('dish.mobile.sections.ingredients')}</Text>
              <View className="flex-row flex-wrap gap-2">
                {ingredients.map((ing) => (
                  <View key={ing.id} className="bg-white border border-warm-200 rounded-xl px-3.5 py-2">
                    <Text className="text-sm text-warm-700">{ing.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Allergens */}
          {allergens.length > 0 && (
            <View className="mt-6">
              <Text className="text-lg font-bold text-warm-800 mb-3">{t('dish.mobile.sections.allergens')}</Text>
              <View className="flex-row flex-wrap gap-2">
                {allergens.map((a) => (
                  <View key={a.id} className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2">
                    <Text className="text-sm font-bold text-red-700">
                      {allergenLabel(a.allergen)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Merchant card */}
          <Pressable
            className="bg-white rounded-2xl p-4 mt-6 flex-row items-center"
            onPress={() => router.push(`/merchant/${dish.merchant.id}`)}
          >
            {dish.merchant.logo_url ? (
              <Image
                source={{ uri: dish.merchant.logo_url }}
                className="w-12 h-12 rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <View className="w-12 h-12 rounded-xl bg-brand-100 items-center justify-center">
                <Ionicons name="storefront-outline" size={24} color="#22c55e" />
              </View>
            )}
            <View className="flex-1 ml-3">
              <View className="flex-row items-center">
                <Text className="text-base font-bold text-warm-800">
                  {dish.merchant.business_name}
                </Text>
                {dish.merchant.is_verified && (
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" style={{ marginLeft: 4 }} />
                )}
              </View>
              <Text className="text-sm text-warm-500">
                {dish.merchant.address_line1 ? `${dish.merchant.address_line1}, ` : ''}
                {dish.merchant.city}
              </Text>
              {dish.merchant.avg_rating != null && dish.merchant.review_count > 0 && (
                <View className="flex-row items-center mt-0.5">
                  <Ionicons name="star" size={12} color="#f59e0b" />
                  <Text className="text-xs text-warm-500 ml-1">
                    {t('dish.mobile.merchantRating', { rating: dish.merchant.avg_rating, count: dish.merchant.review_count })}
                  </Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#b0a89e" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-warm-200 px-5 pt-4 pb-8">
        {isOwnDish ? (
          <Pressable
            className="bg-brand-500 rounded-xl py-4 items-center"
            onPress={() => router.push(`/dish/${dish.id}/edit`)}
          >
            <Text className="text-white font-bold text-base">{t('dish.mobile.cta.editDish')}</Text>
          </Pressable>
        ) : isAvailable ? (
          <View className="flex-row items-center justify-between">
            <Pressable
              className="w-12 h-12 rounded-xl bg-warm-100 items-center justify-center"
              onPress={handleChat}
            >
              <Ionicons name="chatbubble-outline" size={22} color="#3d3833" />
            </Pressable>
            <View className="flex-row items-center ml-3">
              <Pressable
                className="w-10 h-10 rounded-xl bg-warm-100 items-center justify-center"
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Ionicons name="remove" size={20} color="#3d3833" />
              </Pressable>
              <Text className="text-lg font-bold text-warm-800 mx-4">{quantity}</Text>
              <Pressable
                className="w-10 h-10 rounded-xl bg-warm-100 items-center justify-center"
                onPress={() =>
                  setQuantity((q) => Math.min(dish.quantity_available, q + 1))
                }
              >
                <Ionicons name="add" size={20} color="#3d3833" />
              </Pressable>
            </View>
            <Pressable
              className="bg-brand-500 rounded-xl px-6 py-3.5 flex-1 ml-3"
              onPress={handleReserve}
              disabled={reserving}
            >
              <Text className="text-white font-bold text-center text-base">
                {reserving ? t('dish.mobile.cta.reserving') : t('dish.mobile.cta.reserve')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="rounded-xl bg-warm-100 py-4 items-center">
            <Text className="text-warm-500 font-bold text-base">{t('dish.mobile.cta.unavailable')}</Text>
          </View>
        )}
      </View>
    </View>
  )
}
