import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { formatPickupTime } from '../../lib/format'

interface Dish {
  id: string
  title: string
  description: string | null
  image_url: string | null
  quantity_available: number
  pickup_start: string | null
  pickup_end: string | null
  is_vegetarian: boolean
  is_vegan: boolean
  bring_own_container: boolean
  merchant: {
    id: string
    business_name: string
    city: string
  }
}

type DietFilter = 'vegetarisch' | 'veganistisch'

export default function DiscoverScreen() {
  const { user } = useAuth()
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<DietFilter[]>([])
  const [userCity, setUserCity] = useState<string | null>(null)
  const [cityLoaded, setCityLoaded] = useState(false)

  // Fetch user's city from profile
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('city')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setUserCity(data?.city ?? null)
        setCityLoaded(true)
      })
  }, [user])

  const fetchDishes = useCallback(async () => {
    if (!cityLoaded) return

    let query = supabase
      .from('dishes')
      .select(
        `
        id, title, description, image_url, quantity_available,
        pickup_start, pickup_end, is_vegetarian, is_vegan, bring_own_container,
        merchant:merchants!merchant_id (id, business_name, city)
      `
      )
      .eq('status', 'available')
      .gt('quantity_available', 0)
      .order('pickup_start', { ascending: true })

    if (userCity) {
      query = query.eq('merchant.city', userCity)
    }

    if (search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`)
    }

    if (activeFilters.includes('veganistisch')) {
      query = query.eq('is_vegan', true)
    } else if (activeFilters.includes('vegetarisch')) {
      query = query.eq('is_vegetarian', true)
    }

    const { data, error } = await query

    if (!error && data) {
      setDishes(
        (data as unknown as Dish[]).filter((d) => d.merchant !== null)
      )
    }
  }, [search, activeFilters, userCity, cityLoaded])

  useEffect(() => {
    setLoading(true)
    fetchDishes().finally(() => setLoading(false))
  }, [fetchDishes])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchDishes()
    setRefreshing(false)
  }, [fetchDishes])

  const toggleFilter = (filter: DietFilter) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    )
  }

  const renderDishCard = ({ item }: { item: Dish }) => (
    <Pressable
      className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm"
      onPress={() => router.push(`/dish/${item.id}`)}
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          className="w-full h-44"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-44 bg-brand-100 items-center justify-center">
          <Ionicons name="restaurant-outline" size={48} color="#22c55e" />
        </View>
      )}
      <View className="p-4">
        <Text className="text-lg font-bold text-warm-800" numberOfLines={1}>
          {item.title}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="storefront-outline" size={14} color="#736b62" />
          <Text className="text-sm text-warm-500 ml-1" numberOfLines={1}>
            {item.merchant.business_name} · {item.merchant.city}
          </Text>
        </View>
        <View className="flex-row items-center mt-1.5">
          <Ionicons name="time-outline" size={14} color="#736b62" />
          <Text className="text-sm text-warm-500 ml-1">
            {formatPickupTime(item.pickup_start, item.pickup_end)}
          </Text>
        </View>
        <View className="flex-row flex-wrap mt-2.5 gap-1.5">
          {item.is_vegan && (
            <View className="bg-brand-100 rounded-lg px-2.5 py-1">
              <Text className="text-xs font-bold text-brand-700">Veganistisch</Text>
            </View>
          )}
          {item.is_vegetarian && !item.is_vegan && (
            <View className="bg-brand-100 rounded-lg px-2.5 py-1">
              <Text className="text-xs font-bold text-brand-700">Vegetarisch</Text>
            </View>
          )}
          {item.bring_own_container && (
            <View className="bg-warm-100 rounded-lg px-2.5 py-1">
              <Text className="text-xs font-bold text-warm-600">Eigen bakje</Text>
            </View>
          )}
          <View className="bg-warm-100 rounded-lg px-2.5 py-1">
            <Text className="text-xs font-bold text-warm-600">
              Nog {item.quantity_available}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  )

  return (
    <SafeAreaView className="flex-1 bg-offwhite" edges={['bottom']}>
      <View className="flex-1 px-5 pt-4">
        <Text className="text-2xl font-bold text-warm-800 mb-1">
          Ontdekken
        </Text>
        <Pressable
          className="flex-row items-center mb-4"
          onPress={() => setUserCity(userCity ? null : (userCity ?? null))}
        >
          <Ionicons name="location-outline" size={16} color="#736b62" />
          {userCity ? (
            <Text className="text-base text-warm-500 ml-1">
              {userCity}
            </Text>
          ) : (
            <Text className="text-base text-warm-500 ml-1">
              Alle plaatsen
            </Text>
          )}
          {userCity && (
            <Pressable
              onPress={() => setUserCity(null)}
              className="ml-2 bg-warm-100 rounded-lg px-2 py-0.5"
            >
              <Text className="text-xs text-warm-600">Alle plaatsen</Text>
            </Pressable>
          )}
        </Pressable>

        {/* Search */}
        <View className="flex-row items-center bg-white border border-warm-200 rounded-xl px-4 py-3 mb-3">
          <Ionicons name="search-outline" size={20} color="#9e9589" />
          <TextInput
            className="flex-1 ml-2 text-base text-warm-800"
            placeholder="Zoek gerechten..."
            placeholderTextColor="#b0a89e"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9e9589" />
            </Pressable>
          )}
        </View>

        {/* Filter pills */}
        <View className="flex-row gap-2 mb-4">
          <Pressable
            className={`rounded-xl px-4 py-2 border ${
              activeFilters.includes('vegetarisch')
                ? 'bg-brand-500 border-brand-500'
                : 'bg-white border-warm-200'
            }`}
            onPress={() => toggleFilter('vegetarisch')}
          >
            <Text
              className={`text-sm font-bold ${
                activeFilters.includes('vegetarisch')
                  ? 'text-white'
                  : 'text-warm-600'
              }`}
            >
              Vegetarisch
            </Text>
          </Pressable>
          <Pressable
            className={`rounded-xl px-4 py-2 border ${
              activeFilters.includes('veganistisch')
                ? 'bg-brand-500 border-brand-500'
                : 'bg-white border-warm-200'
            }`}
            onPress={() => toggleFilter('veganistisch')}
          >
            <Text
              className={`text-sm font-bold ${
                activeFilters.includes('veganistisch')
                  ? 'text-white'
                  : 'text-warm-600'
              }`}
            >
              Veganistisch
            </Text>
          </Pressable>
        </View>

        {/* Dish list */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : (
          <FlatList
            data={dishes}
            keyExtractor={(item) => item.id}
            renderItem={renderDishCard}
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
              <View className="flex-1 items-center justify-center py-20">
                <Ionicons name="restaurant-outline" size={48} color="#c4bdb4" />
                <Text className="text-warm-400 text-base text-center mt-4">
                  Geen gerechten beschikbaar
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  )
}
