import { useCallback, useEffect, useState } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'

interface MerchantStats {
  dishCount: number
  activeDishCount: number
  pendingReservations: number
  totalReservations: number
  avgRating: number | null
  reviewCount: number
}

export default function AanbiederDashboard() {
  const { user } = useAuth()
  const [merchantId, setMerchantId] = useState<string | null>(null)
  const [stats, setStats] = useState<MerchantStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!user) return

    const { data: merchant } = await supabase
      .from('merchants')
      .select('id, avg_rating, review_count')
      .eq('profile_id', user.id)
      .single()

    if (!merchant) {
      setLoading(false)
      return
    }

    setMerchantId(merchant.id)

    const [dishesRes, reservationsRes] = await Promise.all([
      supabase
        .from('dishes')
        .select('id, status')
        .eq('merchant_id', merchant.id),
      supabase
        .from('reservations')
        .select('id, status')
        .eq('merchant_id', merchant.id),
    ])

    const dishes = dishesRes.data ?? []
    const reservations = reservationsRes.data ?? []

    setStats({
      dishCount: dishes.length,
      activeDishCount: dishes.filter((d) => d.status === 'available').length,
      pendingReservations: reservations.filter((r) => r.status === 'pending').length,
      totalReservations: reservations.length,
      avgRating: merchant.avg_rating,
      reviewCount: merchant.review_count ?? 0,
    })
  }, [user])

  useEffect(() => {
    fetchStats().finally(() => setLoading(false))
  }, [fetchStats])

  if (loading) {
    return (
      <View className="flex-1 bg-offwhite items-center justify-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    )
  }

  if (!merchantId) {
    return (
      <View className="flex-1 bg-offwhite px-5 pt-8">
        <View className="bg-white rounded-2xl p-6 items-center">
          <View className="w-14 h-14 rounded-2xl bg-brand-100 items-center justify-center mb-4">
            <Ionicons name="storefront-outline" size={28} color="#22c55e" />
          </View>
          <Text className="text-lg font-bold text-warm-800 text-center mb-2">
            Word aanbieder
          </Text>
          <Text className="text-sm text-warm-500 text-center mb-5">
            Je hebt nog geen aanbiedersprofiel. Maak een gerecht aan om te beginnen, of stel je profiel in.
          </Text>
          <Pressable
            className="bg-brand-500 rounded-xl px-6 py-3 mb-3 w-full"
            onPress={() => router.push('/dish/create')}
          >
            <Text className="text-white font-bold text-base text-center">
              Eerste gerecht plaatsen
            </Text>
          </Pressable>
          <Pressable
            className="border border-warm-200 rounded-xl px-6 py-3 w-full"
            onPress={() => router.push('/aanbieder/settings' as any)}
          >
            <Text className="text-warm-600 font-bold text-base text-center">
              Profiel instellen
            </Text>
          </Pressable>
        </View>
      </View>
    )
  }

  const menuItems = [
    {
      icon: 'restaurant-outline' as const,
      label: 'Mijn gerechten',
      subtitle: `${stats?.activeDishCount ?? 0} beschikbaar van ${stats?.dishCount ?? 0}`,
      href: '/aanbieder/dishes',
      color: '#22c55e',
      bg: 'bg-brand-100',
    },
    {
      icon: 'calendar-outline' as const,
      label: 'Reserveringen',
      subtitle: stats?.pendingReservations
        ? `${stats.pendingReservations} wachtend op bevestiging`
        : `${stats?.totalReservations ?? 0} totaal`,
      href: '/aanbieder/reservations',
      color: '#f59e0b',
      bg: 'bg-amber-100',
      badge: stats?.pendingReservations || undefined,
    },
    {
      icon: 'star-outline' as const,
      label: 'Beoordelingen',
      subtitle: stats?.avgRating
        ? `${stats.avgRating.toFixed(1)} gemiddeld · ${stats.reviewCount} beoordelingen`
        : 'Nog geen beoordelingen',
      href: '/aanbieder/reviews',
      color: '#f59e0b',
      bg: 'bg-yellow-100',
    },
    {
      icon: 'settings-outline' as const,
      label: 'Instellingen',
      subtitle: 'Profiel en bedrijfsgegevens',
      href: '/aanbieder/settings',
      color: '#736b62',
      bg: 'bg-warm-100',
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-offwhite" edges={['bottom']}>
      <View className="flex-1 px-5 pt-4">
        {/* Quick stats */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-white rounded-2xl p-4">
            <Text className="text-2xl font-bold text-warm-800">
              {stats?.activeDishCount ?? 0}
            </Text>
            <Text className="text-xs text-warm-500 mt-0.5">Actieve gerechten</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4">
            <Text className="text-2xl font-bold text-warm-800">
              {stats?.pendingReservations ?? 0}
            </Text>
            <Text className="text-xs text-warm-500 mt-0.5">Nieuw</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4">
            <Text className="text-2xl font-bold text-warm-800">
              {stats?.avgRating != null ? stats.avgRating.toFixed(1) : '-'}
            </Text>
            <Text className="text-xs text-warm-500 mt-0.5">Beoordeling</Text>
          </View>
        </View>

        {/* Add dish button */}
        <Pressable
          className="bg-brand-500 rounded-2xl px-5 py-4 mb-6 flex-row items-center justify-center active:bg-brand-600"
          onPress={() => router.push('/dish/create')}
        >
          <Ionicons name="add-circle-outline" size={22} color="#ffffff" />
          <Text className="text-white font-bold text-base ml-2">
            Nieuw gerecht plaatsen
          </Text>
        </Pressable>

        {/* Menu */}
        <View className="bg-white rounded-2xl overflow-hidden">
          {menuItems.map((item, index) => (
            <Pressable
              key={item.label}
              className={`flex-row items-center px-5 py-4 active:bg-warm-50 ${
                index < menuItems.length - 1 ? 'border-b border-warm-100' : ''
              }`}
              onPress={() => router.push(item.href as any)}
            >
              <View
                className={`w-10 h-10 rounded-xl ${item.bg} items-center justify-center mr-4`}
              >
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-warm-800">
                  {item.label}
                </Text>
                <Text className="text-xs text-warm-500 mt-0.5">
                  {item.subtitle}
                </Text>
              </View>
              {item.badge ? (
                <View className="bg-amber-100 rounded-full px-2.5 py-1 mr-2">
                  <Text className="text-xs font-bold text-amber-800">
                    {item.badge}
                  </Text>
                </View>
              ) : null}
              <Ionicons name="chevron-forward" size={18} color="#9e9589" />
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}
