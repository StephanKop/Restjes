import { useCallback, useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { formatPickupTime, allergenLabel } from '../../lib/format'

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
  is_frozen: boolean
  bring_own_container: boolean
  merchant: {
    id: string
    business_name: string
    city: string
  }
  dish_allergies: { allergen: string }[]
}

type DishFilter = 'vegetarisch' | 'veganistisch' | 'vers' | 'ingevroren'

const ALL_ALLERGENS = [
  'gluten', 'crustaceans', 'eggs', 'fish', 'peanuts', 'soybeans',
  'milk', 'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs',
] as const

const SCREEN_WIDTH = Dimensions.get('window').width

export default function DiscoverScreen() {
  const { user } = useAuth()
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<DishFilter[]>([])
  const [excludedAllergens, setExcludedAllergens] = useState<string[]>([])
  const [filterOpen, setFilterOpen] = useState(false)
  const [userCity, setUserCity] = useState<string | null>(null)
  const [cityLoaded, setCityLoaded] = useState(false)

  // Sidebar animation
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current
  const backdropAnim = useRef(new Animated.Value(0)).current

  const openFilter = () => {
    setFilterOpen(true)
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const closeFilter = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setFilterOpen(false))
  }

  const activeFilterCount =
    activeFilters.length + excludedAllergens.length + (userCity ? 0 : 0)

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
        pickup_start, pickup_end, is_vegetarian, is_vegan, is_frozen, bring_own_container,
        merchant:merchants!merchant_id (id, business_name, city),
        dish_allergies (allergen)
      `
      )
      .eq('status', 'available')
      .gt('quantity_available', 0)
      .or(`pickup_end.gt.${new Date().toISOString()},pickup_end.is.null`)
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

    if (activeFilters.includes('vers')) {
      query = query.eq('is_frozen', false)
    } else if (activeFilters.includes('ingevroren')) {
      query = query.eq('is_frozen', true)
    }

    const { data, error } = await query

    if (!error && data) {
      let filtered = (data as unknown as Dish[]).filter((d) => d.merchant !== null)

      // Client-side allergen exclusion
      if (excludedAllergens.length > 0) {
        filtered = filtered.filter((d) =>
          !d.dish_allergies?.some((a) => excludedAllergens.includes(a.allergen))
        )
      }

      setDishes(filtered)
    }
  }, [search, activeFilters, excludedAllergens, userCity, cityLoaded])

  useEffect(() => {
    setLoading(true)
    fetchDishes().finally(() => setLoading(false))
  }, [fetchDishes])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchDishes()
    setRefreshing(false)
  }, [fetchDishes])

  const toggleFilter = (filter: DishFilter) => {
    setActiveFilters((prev) => {
      if (filter === 'vers' && prev.includes('ingevroren')) {
        return [...prev.filter((f) => f !== 'ingevroren'), filter]
      }
      if (filter === 'ingevroren' && prev.includes('vers')) {
        return [...prev.filter((f) => f !== 'vers'), filter]
      }
      return prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    })
  }

  const toggleAllergen = (allergen: string) => {
    setExcludedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    )
  }

  const clearAllFilters = () => {
    setActiveFilters([])
    setExcludedAllergens([])
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
          <Ionicons name="storefront-outline" size={14} color="#8a8680" />
          <Text className="text-sm text-warm-500 ml-1" numberOfLines={1}>
            {item.merchant.business_name} · {item.merchant.city}
          </Text>
        </View>
        <View className="flex-row items-center mt-1.5">
          <Ionicons name="time-outline" size={14} color="#8a8680" />
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
          {item.is_frozen && (
            <View className="bg-blue-50 rounded-lg px-2.5 py-1">
              <Text className="text-xs font-bold text-blue-700">Ingevroren</Text>
            </View>
          )}
          {item.bring_own_container && (
            <View className="bg-warm-100 rounded-lg px-2.5 py-1">
              <Text className="text-xs font-bold text-warm-600">Eigen bakje</Text>
            </View>
          )}
          {item.dish_allergies?.length > 0 && (
            <View className="bg-red-50 rounded-lg px-2.5 py-1">
              <Text className="text-xs font-bold text-red-700">
                {item.dish_allergies.length} allergenen
              </Text>
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
          <Ionicons name="location-outline" size={16} color="#8a8680" />
          {userCity ? (
            <Text className="text-base text-warm-500 ml-1">{userCity}</Text>
          ) : (
            <Text className="text-base text-warm-500 ml-1">Alle plaatsen</Text>
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

        {/* Search + Filter button */}
        <View className="flex-row items-center gap-2 mb-4">
          <View className="flex-1 flex-row items-center bg-white border border-warm-200 rounded-xl px-4 py-3">
            <Ionicons name="search-outline" size={20} color="#b0a89e" />
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
                <Ionicons name="close-circle" size={20} color="#b0a89e" />
              </Pressable>
            )}
          </View>
          <Pressable
            className={`rounded-xl px-3.5 py-3 border ${
              activeFilterCount > 0
                ? 'bg-brand-500 border-brand-500'
                : 'bg-white border-warm-200'
            }`}
            onPress={openFilter}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="options-outline"
                size={22}
                color={activeFilterCount > 0 ? '#fff' : '#8a8680'}
              />
              {activeFilterCount > 0 && (
                <View className="bg-white rounded-full w-5 h-5 items-center justify-center ml-1.5">
                  <Text className="text-xs font-bold text-brand-600">
                    {activeFilterCount}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>

        {/* Active filter summary chips */}
        {activeFilterCount > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
            contentContainerStyle={{ gap: 6 }}
          >
            {activeFilters.map((f) => (
              <Pressable
                key={f}
                className="flex-row items-center bg-brand-100 rounded-lg px-2.5 py-1.5"
                onPress={() => toggleFilter(f)}
              >
                <Text className="text-xs font-bold text-brand-700 capitalize">{f}</Text>
                <Ionicons name="close" size={14} color="#15803d" style={{ marginLeft: 4 }} />
              </Pressable>
            ))}
            {excludedAllergens.length > 0 && (
              <View className="flex-row items-center bg-red-100 rounded-lg px-2.5 py-1.5">
                <Text className="text-xs font-bold text-red-700">
                  {excludedAllergens.length} allergenen uitgesloten
                </Text>
              </View>
            )}
            <Pressable
              className="rounded-lg px-2.5 py-1.5"
              onPress={clearAllFilters}
            >
              <Text className="text-xs font-bold text-warm-500">Wissen</Text>
            </Pressable>
          </ScrollView>
        )}

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
                <Ionicons name="restaurant-outline" size={48} color="#d1cbc4" />
                <Text className="text-warm-400 text-base text-center mt-4">
                  Geen gerechten beschikbaar
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Filter sidebar */}
      {filterOpen && (
        <View className="absolute inset-0" style={{ zIndex: 50 }}>
          {/* Backdrop */}
          <Animated.View
            className="absolute inset-0 bg-black"
            style={{ opacity: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) }}
          >
            <Pressable className="flex-1" onPress={closeFilter} />
          </Animated.View>

          {/* Sidebar panel */}
          <Animated.View
            className="absolute top-0 right-0 bottom-0 bg-offwhite"
            style={{
              width: SCREEN_WIDTH,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <SafeAreaView className="flex-1" edges={['bottom']}>
              {/* Header */}
              <View className="flex-row items-center justify-between px-5 pt-2 pb-3 border-b border-warm-200">
                <Pressable onPress={closeFilter} className="flex-row items-center">
                  <Ionicons name="arrow-back" size={24} color="#3d3833" />
                  <Text className="text-lg font-bold text-warm-800 ml-2">Filters</Text>
                </Pressable>
                {activeFilterCount > 0 && (
                  <Pressable onPress={clearAllFilters}>
                    <Text className="text-sm font-bold text-red-500">Alles wissen</Text>
                  </Pressable>
                )}
              </View>

              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
              >
                {/* Diet section */}
                <Text className="text-sm font-bold text-warm-500 uppercase tracking-wide mb-3">
                  Dieet
                </Text>
                <View className="gap-2 mb-6">
                  {(['vegetarisch', 'veganistisch'] as DishFilter[]).map((filter) => {
                    const active = activeFilters.includes(filter)
                    return (
                      <Pressable
                        key={filter}
                        className={`flex-row items-center rounded-xl px-4 py-3.5 border ${
                          active ? 'bg-brand-100 border-brand-300' : 'bg-white border-warm-200'
                        }`}
                        onPress={() => toggleFilter(filter)}
                      >
                        <Ionicons
                          name="leaf-outline"
                          size={20}
                          color={active ? '#15803d' : '#b0a89e'}
                        />
                        <Text
                          className={`text-base ml-3 flex-1 ${
                            active ? 'text-brand-700 font-bold' : 'text-warm-700'
                          }`}
                        >
                          {filter === 'vegetarisch' ? 'Vegetarisch' : 'Veganistisch'}
                        </Text>
                        {active && (
                          <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
                        )}
                      </Pressable>
                    )
                  })}
                </View>

                {/* Storage type section */}
                <Text className="text-sm font-bold text-warm-500 uppercase tracking-wide mb-3">
                  Bewaring
                </Text>
                <View className="flex-row gap-3 mb-6">
                  {([
                    { key: 'vers' as DishFilter, label: 'Vers', icon: 'sunny-outline' as const, activeColor: '#ea580c', activeBg: 'bg-orange-50', activeBorder: 'border-orange-300' },
                    { key: 'ingevroren' as DishFilter, label: 'Ingevroren', icon: 'snow-outline' as const, activeColor: '#1d4ed8', activeBg: 'bg-blue-50', activeBorder: 'border-blue-300' },
                  ]).map(({ key, label, icon, activeColor, activeBg, activeBorder }) => {
                    const active = activeFilters.includes(key)
                    return (
                      <Pressable
                        key={key}
                        className={`flex-1 rounded-xl px-4 py-4 border-2 items-center ${
                          active ? `${activeBg} ${activeBorder}` : 'bg-white border-warm-200'
                        }`}
                        onPress={() => toggleFilter(key)}
                      >
                        <Ionicons
                          name={icon}
                          size={28}
                          color={active ? activeColor : '#b0a89e'}
                        />
                        <Text
                          className={`text-sm font-bold mt-1.5 ${
                            active ? 'text-warm-800' : 'text-warm-500'
                          }`}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>

                {/* Allergens section */}
                <Text className="text-sm font-bold text-warm-500 uppercase tracking-wide mb-1">
                  Allergenen uitsluiten
                </Text>
                <Text className="text-xs text-warm-400 mb-3">
                  Gerechten met deze allergenen worden niet getoond.
                </Text>
                <View className="gap-2">
                  {ALL_ALLERGENS.map((allergen) => {
                    const excluded = excludedAllergens.includes(allergen)
                    return (
                      <Pressable
                        key={allergen}
                        className={`flex-row items-center rounded-xl px-4 py-3.5 border ${
                          excluded ? 'bg-red-50 border-red-300' : 'bg-white border-warm-200'
                        }`}
                        onPress={() => toggleAllergen(allergen)}
                      >
                        <Ionicons
                          name={excluded ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={excluded ? '#dc2626' : '#b0a89e'}
                        />
                        <Text
                          className={`text-base ml-3 ${
                            excluded ? 'text-red-700 font-bold' : 'text-warm-700'
                          }`}
                        >
                          {allergenLabel(allergen)}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>
              </ScrollView>

              {/* Apply button */}
              <View className="px-5 pb-4 pt-3 border-t border-warm-200">
                <Pressable
                  className="bg-brand-500 rounded-xl py-4 items-center active:bg-brand-600"
                  onPress={closeFilter}
                >
                  <Text className="text-white font-bold text-base">
                    Toon resultaten ({dishes.length})
                  </Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  )
}
