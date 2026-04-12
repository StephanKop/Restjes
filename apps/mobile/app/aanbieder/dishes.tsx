import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { formatPickupTime } from '../../lib/format'

type DishStatus = 'available' | 'reserved' | 'collected' | 'expired'

interface MerchantDish {
  id: string
  title: string
  description: string | null
  image_url: string | null
  quantity_available: number
  status: DishStatus
  pickup_start: string | null
  pickup_end: string | null
}

const STATUS_CONFIG: Record<DishStatus, { label: string; bgClass: string; textClass: string }> = {
  available: { label: 'Beschikbaar', bgClass: 'bg-green-100', textClass: 'text-green-800' },
  reserved: { label: 'Gereserveerd', bgClass: 'bg-amber-100', textClass: 'text-amber-800' },
  collected: { label: 'Opgehaald', bgClass: 'bg-warm-100', textClass: 'text-warm-600' },
  expired: { label: 'Verlopen', bgClass: 'bg-red-100', textClass: 'text-red-800' },
}

export default function MerchantDishesScreen() {
  const { user } = useAuth()
  const [merchantId, setMerchantId] = useState<string | null>(null)
  const [dishes, setDishes] = useState<MerchantDish[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDishes = useCallback(async () => {
    if (!user) return

    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!merchant) return

    setMerchantId(merchant.id)

    const { data } = await supabase
      .from('dishes')
      .select('id, title, description, image_url, quantity_available, status, pickup_start, pickup_end')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false })

    if (data) setDishes(data as MerchantDish[])
  }, [user])

  useEffect(() => {
    fetchDishes().finally(() => setLoading(false))
  }, [fetchDishes])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchDishes()
    setRefreshing(false)
  }, [fetchDishes])

  const handleDelete = (dish: MerchantDish) => {
    Alert.alert(
      'Gerecht verwijderen',
      `Weet je zeker dat je "${dish.title}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`,
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            // Delete image from storage if exists
            if (dish.image_url) {
              const path = dish.image_url.split('/dish-images/')[1]
              if (path) {
                await supabase.storage.from('dish-images').remove([path])
              }
            }

            // Delete related records then the dish
            await supabase.from('dish_ingredients').delete().eq('dish_id', dish.id)
            await supabase.from('dish_allergies').delete().eq('dish_id', dish.id)
            const { error } = await supabase.from('dishes').delete().eq('id', dish.id)

            if (error) {
              Alert.alert('Fout', 'Kon het gerecht niet verwijderen. Mogelijk zijn er nog reserveringen aan gekoppeld.')
            } else {
              fetchDishes()
            }
          },
        },
      ]
    )
  }

  const renderDish = ({ item }: { item: MerchantDish }) => {
    const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.available

    return (
      <View className="bg-white rounded-2xl overflow-hidden mb-4">
        {/* Image */}
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            className="w-full h-40"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-40 bg-brand-100 items-center justify-center">
            <Ionicons name="restaurant-outline" size={40} color="#22c55e" />
          </View>
        )}

        {/* Status badge overlay */}
        <View className="absolute top-3 right-3">
          <View className={`${status.bgClass} rounded-xl px-3 py-1`}>
            <Text className={`text-xs font-bold ${status.textClass}`}>
              {status.label}
            </Text>
          </View>
        </View>

        <View className="p-4">
          <Text className="text-lg font-bold text-warm-800 mb-1" numberOfLines={1}>
            {item.title}
          </Text>
          {item.description && (
            <Text className="text-sm text-warm-500 mb-2" numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View className="flex-row flex-wrap gap-2 mb-4">
            <View className="bg-warm-50 rounded-lg px-2.5 py-1">
              <Text className="text-xs text-warm-600">
                Aantal: {item.quantity_available}
              </Text>
            </View>
            <View className="bg-warm-50 rounded-lg px-2.5 py-1">
              <Text className="text-xs text-warm-600">
                {formatPickupTime(item.pickup_start, item.pickup_end)}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <Pressable
              className="flex-1 border border-warm-200 rounded-xl py-2.5 items-center active:bg-warm-50"
              onPress={() => router.push(`/dish/${item.id}/edit`)}
            >
              <Text className="text-sm font-bold text-warm-700">Bewerken</Text>
            </Pressable>
            <Pressable
              className="border border-red-200 rounded-xl px-4 py-2.5 items-center active:bg-red-50"
              onPress={() => handleDelete(item)}
            >
              <Ionicons name="trash-outline" size={18} color="#dc2626" />
            </Pressable>
          </View>
        </View>
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
      <View className="flex-1 px-5 pt-4">
        {/* Add button */}
        <Pressable
          className="bg-brand-500 rounded-xl px-5 py-3 mb-4 flex-row items-center justify-center active:bg-brand-600"
          onPress={() => router.push('/dish/create')}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text className="text-white font-bold text-sm ml-1">Nieuw gerecht</Text>
        </Pressable>

        <FlatList
          data={dishes}
          keyExtractor={(item) => item.id}
          renderItem={renderDish}
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
              <Ionicons name="restaurant-outline" size={48} color="#c4bdb4" />
              <Text className="text-warm-400 text-base text-center mt-4 mb-2">
                Je hebt nog geen gerechten geplaatst
              </Text>
              <Text className="text-warm-400 text-sm text-center">
                Plaats je eerste gerecht en help voedselverspilling tegen te gaan.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  )
}
