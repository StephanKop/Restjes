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
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { formatPickupTime, allergenLabel } from '../../lib/format'

interface DishDetail {
  id: string
  title: string
  description: string | null
  image_url: string | null
  quantity_available: number
  pickup_start: string | null
  pickup_end: string | null
  bring_own_container: boolean
  is_vegetarian: boolean
  is_vegan: boolean
  merchant: {
    id: string
    business_name: string
    city: string
    address_line1: string | null
    logo_url: string | null
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
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()
  const { user } = useAuth()

  const [dish, setDish] = useState<DishDetail | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [allergens, setAllergens] = useState<Allergen[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [reserving, setReserving] = useState(false)

  const fetchDish = useCallback(async () => {
    const [dishRes, ingredientsRes, allergensRes] = await Promise.all([
      supabase
        .from('dishes')
        .select(
          `
          id, title, description, image_url, quantity_available,
          pickup_start, pickup_end, bring_own_container, is_vegetarian, is_vegan,
          merchant:merchants!merchant_id (id, business_name, city, address_line1, logo_url)
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
    }
    if (ingredientsRes.data) setIngredients(ingredientsRes.data)
    if (allergensRes.data) setAllergens(allergensRes.data)
  }, [id, navigation])

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
      Alert.alert('Fout', 'Er is iets misgegaan bij het reserveren. Probeer het opnieuw.')
    } else {
      Alert.alert(
        'Gelukt!',
        `Je hebt ${quantity} portie${quantity > 1 ? 's' : ''} van "${dish.title}" gereserveerd. Bekijk je reserveringen voor meer details.`,
        [
          { text: 'Naar reserveringen', onPress: () => router.push('/(tabs)/reservations') },
          { text: 'OK' },
        ]
      )
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-offwhite items-center justify-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    )
  }

  if (!dish) {
    return (
      <View className="flex-1 bg-offwhite items-center justify-center px-5">
        <Text className="text-warm-400 text-base text-center">
          Gerecht niet gevonden.
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
                <Text className="text-xs text-warm-500 uppercase">Ophalen</Text>
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
                <Text className="text-xs text-warm-500 uppercase">Beschikbaar</Text>
                <Text className="text-sm font-bold text-warm-800">
                  {dish.quantity_available} portie{dish.quantity_available !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {dish.bring_own_container && (
              <View className="bg-white rounded-xl p-4 flex-row items-center">
                <View className="bg-amber-100 rounded-lg p-2 mr-3">
                  <Ionicons name="cube-outline" size={20} color="#d97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-warm-500 uppercase">Verpakking</Text>
                  <Text className="text-sm font-bold text-warm-800">
                    Neem je eigen bakje mee
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
                    <Text className="text-sm font-bold text-brand-700 ml-1.5">Veganistisch</Text>
                  </View>
                )}
                {dish.is_vegetarian && (
                  <View className="bg-brand-100 rounded-xl px-4 py-2.5 flex-row items-center">
                    <Ionicons name="leaf-outline" size={16} color="#15803d" />
                    <Text className="text-sm font-bold text-brand-700 ml-1.5">Vegetarisch</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <View className="mt-6">
              <Text className="text-lg font-bold text-warm-800 mb-3">Ingrediënten</Text>
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
              <Text className="text-lg font-bold text-warm-800 mb-3">Allergenen</Text>
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
              <Text className="text-base font-bold text-warm-800">
                {dish.merchant.business_name}
              </Text>
              <Text className="text-sm text-warm-500">
                {dish.merchant.address_line1 ? `${dish.merchant.address_line1}, ` : ''}
                {dish.merchant.city}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#b0a89e" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Reserve section */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-warm-200 px-5 pt-4 pb-8">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
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
            className="bg-brand-500 rounded-xl px-6 py-3.5 flex-1 ml-4"
            onPress={handleReserve}
            disabled={reserving}
          >
            <Text className="text-white font-bold text-center text-base">
              {reserving ? 'Bezig...' : 'Reserveren'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
