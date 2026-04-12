import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { formatPickupTime, formatRelativeDate } from '../../lib/format'

type ReservationStatus = 'pending' | 'confirmed' | 'collected' | 'cancelled' | 'no_show'
type TabKey = 'actief' | 'afgerond' | 'geannuleerd'

interface Reservation {
  id: string
  quantity: number
  status: ReservationStatus
  pickup_time: string | null
  created_at: string
  dish: {
    id: string
    title: string
    pickup_start: string | null
    pickup_end: string | null
  }
  merchant: {
    id: string
    business_name: string
  }
}

const STATUS_CONFIG: Record<ReservationStatus, { label: string; bgClass: string; textClass: string }> = {
  pending: { label: 'In afwachting', bgClass: 'bg-amber-100', textClass: 'text-amber-700' },
  confirmed: { label: 'Bevestigd', bgClass: 'bg-brand-100', textClass: 'text-brand-700' },
  collected: { label: 'Opgehaald', bgClass: 'bg-warm-100', textClass: 'text-warm-600' },
  cancelled: { label: 'Geannuleerd', bgClass: 'bg-red-100', textClass: 'text-red-700' },
  no_show: { label: 'Niet opgehaald', bgClass: 'bg-red-100', textClass: 'text-red-700' },
}

const TAB_FILTERS: Record<TabKey, ReservationStatus[]> = {
  actief: ['pending', 'confirmed'],
  afgerond: ['collected'],
  geannuleerd: ['cancelled', 'no_show'],
}

export default function ReservationsScreen() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [reviewMap, setReviewMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('actief')

  const fetchReservations = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('reservations')
      .select(
        `
        id, quantity, status, pickup_time, created_at,
        dish:dishes!dish_id (id, title, pickup_start, pickup_end),
        merchant:merchants!merchant_id (id, business_name)
      `
      )
      .eq('consumer_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const items = data as unknown as Reservation[]
      setReservations(items)

      // Fetch existing reviews for collected reservations
      const collectedIds = items
        .filter((r) => r.status === 'collected')
        .map((r) => r.id)

      if (collectedIds.length > 0) {
        const { data: reviews } = await supabase
          .from('reviews')
          .select('reservation_id, rating')
          .eq('consumer_id', user.id)
          .in('reservation_id', collectedIds)

        const map: Record<string, number> = {}
        if (reviews) {
          for (const review of reviews) {
            if (review.reservation_id) {
              map[review.reservation_id] = review.rating
            }
          }
        }
        setReviewMap(map)
      }
    }
  }, [user])

  useEffect(() => {
    setLoading(true)
    fetchReservations().finally(() => setLoading(false))
  }, [fetchReservations])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchReservations()
    setRefreshing(false)
  }, [fetchReservations])

  const handleCancel = (reservation: Reservation) => {
    Alert.alert(
      'Reservering annuleren',
      `Weet je zeker dat je de reservering voor "${reservation.dish.title}" wilt annuleren?`,
      [
        { text: 'Nee', style: 'cancel' },
        {
          text: 'Ja, annuleren',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('reservations')
              .update({ status: 'cancelled' })
              .eq('id', reservation.id)

            // Try setting cancelled_by (column may not exist yet)
            if (!error) {
              await supabase
                .from('reservations')
                .update({ cancelled_by: 'consumer' } as any)
                .eq('id', reservation.id)
                .then(() => {})
                .catch(() => {})
            }

            if (error) {
              Alert.alert('Fout', 'Kon de reservering niet annuleren.')
            } else {
              fetchReservations()
            }
          },
        },
      ]
    )
  }

  const filteredReservations = reservations.filter((r) =>
    TAB_FILTERS[activeTab].includes(r.status)
  )

  const renderTab = (key: TabKey, label: string) => (
    <Pressable
      key={key}
      className={`flex-1 py-2.5 rounded-xl ${
        activeTab === key ? 'bg-brand-500' : 'bg-transparent'
      }`}
      onPress={() => setActiveTab(key)}
    >
      <Text
        className={`text-sm font-bold text-center ${
          activeTab === key ? 'text-white' : 'text-warm-500'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  )

  const renderReservation = ({ item }: { item: Reservation }) => {
    const status = STATUS_CONFIG[item.status]
    const canCancel = item.status === 'pending' || item.status === 'confirmed'

    return (
      <View className="bg-white rounded-2xl p-4 mb-3">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-3">
            <Text className="text-base font-bold text-warm-800" numberOfLines={1}>
              {item.dish.title}
            </Text>
            <Text className="text-sm text-warm-500 mt-0.5">
              {item.merchant.business_name}
            </Text>
          </View>
          <View className={`${status.bgClass} rounded-lg px-2.5 py-1`}>
            <Text className={`text-xs font-bold ${status.textClass}`}>
              {status.label}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mt-1">
          <Ionicons name="time-outline" size={14} color="#736b62" />
          <Text className="text-sm text-warm-500 ml-1">
            {formatPickupTime(item.dish.pickup_start, item.dish.pickup_end)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-3">
          <View className="flex-row items-center">
            <Text className="text-sm text-warm-500">
              {item.quantity} portie{item.quantity !== 1 ? 's' : ''} · {formatRelativeDate(item.created_at)}
            </Text>
          </View>
          {canCancel && (
            <Pressable
              className="border border-red-200 rounded-xl px-3 py-1.5"
              onPress={() => handleCancel(item)}
            >
              <Text className="text-xs font-bold text-red-600">Annuleren</Text>
            </Pressable>
          )}
        </View>

        {/* Review section for collected reservations */}
        {item.status === 'collected' && (
          <View className="mt-3 pt-3 border-t border-warm-100">
            {reviewMap[item.id] != null ? (
              <View className="flex-row items-center">
                <Text className="text-xs font-bold text-warm-500 mr-2">Jouw beoordeling:</Text>
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= reviewMap[item.id] ? 'star' : 'star-outline'}
                      size={14}
                      color={star <= reviewMap[item.id] ? '#f59e0b' : '#c4bdb4'}
                    />
                  ))}
                </View>
              </View>
            ) : (
              <Pressable
                className="flex-row items-center bg-brand-50 rounded-xl px-4 py-2.5 self-start"
                onPress={() => router.push(`/review/${item.id}` as any)}
              >
                <Ionicons name="star-outline" size={16} color="#15803d" />
                <Text className="text-sm font-bold text-brand-700 ml-1.5">
                  Beoordeling schrijven
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-offwhite" edges={['bottom']}>
      <View className="flex-1 px-5 pt-4">
        <Text className="text-2xl font-bold text-warm-800 mb-1">
          Mijn reserveringen
        </Text>
        <Text className="text-base text-warm-500 mb-4">
          Bekijk en beheer je gereserveerde gerechten
        </Text>

        {/* Segmented control */}
        <View className="flex-row bg-warm-100 rounded-xl p-1 mb-4">
          {renderTab('actief', 'Actief')}
          {renderTab('afgerond', 'Afgerond')}
          {renderTab('geannuleerd', 'Geannuleerd')}
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : (
          <FlatList
            data={filteredReservations}
            keyExtractor={(item) => item.id}
            renderItem={renderReservation}
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
                <Ionicons
                  name={
                    activeTab === 'actief'
                      ? 'calendar-outline'
                      : activeTab === 'afgerond'
                      ? 'checkmark-circle-outline'
                      : 'close-circle-outline'
                  }
                  size={48}
                  color="#c4bdb4"
                />
                <Text className="text-warm-400 text-base text-center mt-4">
                  {activeTab === 'actief'
                    ? 'Je hebt geen actieve reserveringen.'
                    : activeTab === 'afgerond'
                    ? 'Je hebt nog geen afgeronde reserveringen.'
                    : 'Geen geannuleerde reserveringen.'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  )
}
