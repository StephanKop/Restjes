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
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { formatRelativeDate } from '../../lib/format'

type ReservationStatus = 'pending' | 'confirmed' | 'collected' | 'cancelled' | 'no_show'
type TabKey = 'alle' | 'nieuw' | 'bevestigd' | 'afgerond'

interface MerchantReservation {
  id: string
  quantity: number
  status: ReservationStatus
  pickup_time: string | null
  notes: string | null
  created_at: string
  dish: {
    id: string
    title: string
  }
  consumer: {
    display_name: string | null
  }
}

const STATUS_CONFIG: Record<ReservationStatus, { label: string; bgClass: string; textClass: string }> = {
  pending: { label: 'In afwachting', bgClass: 'bg-amber-100', textClass: 'text-amber-700' },
  confirmed: { label: 'Bevestigd', bgClass: 'bg-brand-100', textClass: 'text-brand-700' },
  collected: { label: 'Opgehaald', bgClass: 'bg-warm-100', textClass: 'text-warm-600' },
  cancelled: { label: 'Geannuleerd', bgClass: 'bg-red-100', textClass: 'text-red-700' },
  no_show: { label: 'Niet opgehaald', bgClass: 'bg-red-100', textClass: 'text-red-700' },
}

const TAB_FILTERS: Record<TabKey, (status: ReservationStatus) => boolean> = {
  alle: () => true,
  nieuw: (s) => s === 'pending',
  bevestigd: (s) => s === 'confirmed',
  afgerond: (s) => s === 'collected' || s === 'cancelled' || s === 'no_show',
}

export default function MerchantReservationsScreen() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<MerchantReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('alle')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchReservations = useCallback(async () => {
    if (!user) return

    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!merchant) return

    const { data } = await supabase
      .from('reservations')
      .select(
        `
        id, quantity, status, pickup_time, notes, created_at,
        dish:dishes!dish_id (id, title),
        consumer:profiles!consumer_id (display_name)
      `
      )
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false })

    if (data) setReservations(data as unknown as MerchantReservation[])
  }, [user])

  useEffect(() => {
    fetchReservations().finally(() => setLoading(false))
  }, [fetchReservations])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchReservations()
    setRefreshing(false)
  }, [fetchReservations])

  const updateStatus = async (reservationId: string, newStatus: string, cancelledBy?: 'consumer' | 'merchant') => {
    setUpdatingId(reservationId)
    const { error } = await supabase
      .from('reservations')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', reservationId)

    // Try setting cancelled_by separately (column may not exist yet)
    if (!error && cancelledBy) {
      await supabase
        .from('reservations')
        .update({ cancelled_by: cancelledBy } as any)
        .eq('id', reservationId)
        .then(() => {})
        .catch(() => {})
    }

    if (error) {
      Alert.alert('Fout', 'Kon de status niet bijwerken.')
    } else {
      // Update dish status via RPC (bypasses RLS)
      if (newStatus === 'collected') {
        const reservation = reservations.find((r) => r.id === reservationId)
        if (reservation) {
          await supabase.rpc('mark_dish_collected', { p_dish_id: reservation.dish.id })
        }
      }
      await fetchReservations()
    }
    setUpdatingId(null)
  }

  const handleConfirm = (id: string) => updateStatus(id, 'confirmed')

  const handleDecline = (item: MerchantReservation) => {
    Alert.alert(
      'Reservering afwijzen?',
      'De klant wordt hiervan op de hoogte gesteld.',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Afwijzen',
          style: 'destructive',
          onPress: () => updateStatus(item.id, 'cancelled', 'merchant'),
        },
      ]
    )
  }

  const handleCollected = (id: string) => updateStatus(id, 'collected')

  const handleNoShow = (item: MerchantReservation) => {
    Alert.alert(
      'Niet opgehaald?',
      'De klant wordt als niet opgehaald gemarkeerd.',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Bevestigen',
          style: 'destructive',
          onPress: () => updateStatus(item.id, 'no_show'),
        },
      ]
    )
  }

  const pendingCount = reservations.filter((r) => r.status === 'pending').length
  const filtered = reservations.filter((r) => TAB_FILTERS[activeTab](r.status))

  const renderTab = (key: TabKey, label: string, badge?: number) => (
    <Pressable
      key={key}
      className={`rounded-xl px-4 py-2 border mr-2 ${
        activeTab === key
          ? 'bg-brand-500 border-brand-500'
          : 'bg-white border-warm-200'
      }`}
      onPress={() => setActiveTab(key)}
    >
      <View className="flex-row items-center">
        <Text
          className={`text-sm font-bold ${
            activeTab === key ? 'text-white' : 'text-warm-600'
          }`}
        >
          {label}
        </Text>
        {badge != null && badge > 0 && (
          <View
            className={`ml-1.5 h-5 w-5 rounded-full items-center justify-center ${
              activeTab === key ? 'bg-white' : 'bg-amber-100'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === key ? 'text-brand-600' : 'text-amber-800'
              }`}
            >
              {badge}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  )

  const renderReservation = ({ item }: { item: MerchantReservation }) => {
    const status = STATUS_CONFIG[item.status]
    const isUpdating = updatingId === item.id

    return (
      <View className="bg-white rounded-2xl p-4 mb-3">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-3">
            <Text className="text-base font-bold text-warm-800" numberOfLines={1}>
              {item.dish.title}
            </Text>
            <Text className="text-sm text-warm-500 mt-0.5">
              Klant: {item.consumer?.display_name ?? 'Onbekend'}
            </Text>
          </View>
          <View className={`${status.bgClass} rounded-lg px-2.5 py-1`}>
            <Text className={`text-xs font-bold ${status.textClass}`}>
              {status.label}
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-x-4 gap-y-1 mb-2">
          <Text className="text-sm text-warm-500">Aantal: {item.quantity}</Text>
          <Text className="text-sm text-warm-500">{formatRelativeDate(item.created_at)}</Text>
          {item.pickup_time && (
            <Text className="text-sm text-warm-500">
              Ophalen:{' '}
              {new Date(item.pickup_time).toLocaleString('nl-NL', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </View>

        {item.notes && (
          <View className="bg-warm-50 rounded-lg px-3 py-2 mb-3">
            <Text className="text-sm text-warm-700">
              <Text className="font-bold">Opmerking: </Text>
              {item.notes}
            </Text>
          </View>
        )}

        {/* Merchant actions */}
        {item.status === 'pending' && (
          <View className="flex-row gap-2 mt-1">
            <Pressable
              className="flex-1 bg-brand-500 rounded-xl py-2.5 items-center active:bg-brand-600"
              onPress={() => handleConfirm(item.id)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-sm">Bevestigen</Text>
              )}
            </Pressable>
            <Pressable
              className="border border-red-200 rounded-xl px-4 py-2.5 items-center active:bg-red-50"
              onPress={() => handleDecline(item)}
              disabled={isUpdating}
            >
              <Text className="text-red-600 font-bold text-sm">Afwijzen</Text>
            </Pressable>
          </View>
        )}

        {item.status === 'confirmed' && (
          <View className="flex-row gap-2 mt-1">
            <Pressable
              className="flex-1 bg-brand-500 rounded-xl py-2.5 items-center active:bg-brand-600"
              onPress={() => handleCollected(item.id)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-sm">Opgehaald</Text>
              )}
            </Pressable>
            <Pressable
              className="border border-red-200 rounded-xl px-4 py-2.5 items-center active:bg-red-50"
              onPress={() => handleNoShow(item)}
              disabled={isUpdating}
            >
              <Text className="text-red-600 font-bold text-sm">Niet opgehaald</Text>
            </Pressable>
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
      <View className="flex-1 px-5 pt-4">
        {pendingCount > 0 && (
          <Text className="text-sm text-warm-500 mb-3">
            {pendingCount} {pendingCount === 1 ? 'nieuwe reservering' : 'nieuwe reserveringen'} wachtend op bevestiging
          </Text>
        )}

        {/* Tabs */}
        <View className="flex-row mb-4">
          {renderTab('alle', 'Alle')}
          {renderTab('nieuw', 'Nieuw', pendingCount)}
          {renderTab('bevestigd', 'Bevestigd')}
          {renderTab('afgerond', 'Afgerond')}
        </View>

        <FlatList
          data={filtered}
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
              <Ionicons name="calendar-outline" size={48} color="#c4bdb4" />
              <Text className="text-warm-400 text-base text-center mt-4">
                {activeTab === 'alle'
                  ? 'Er zijn nog geen reserveringen binnengekomen'
                  : 'Geen reserveringen in deze categorie'}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  )
}
