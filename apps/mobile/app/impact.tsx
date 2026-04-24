import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'
import { useTranslation } from '../lib/i18n'
import { localeMeta, type Locale } from '@kliekjesclub/i18n'

const CO2_PER_MEAL_KG = 1.25
const WATER_PER_MEAL_L = 1000

const MONTH_KEYS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
] as const

type MonthBucket = { labelKey: (typeof MONTH_KEYS)[number]; key: string; count: number }

function buildMonthBuckets(
  rows: { created_at: string; quantity: number }[],
  monthsBack = 6,
): MonthBucket[] {
  const now = new Date()
  const buckets: MonthBucket[] = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets.push({ labelKey: MONTH_KEYS[d.getMonth()], key, count: 0 })
  }
  for (const row of rows) {
    const d = new Date(row.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const bucket = buckets.find((b) => b.key === key)
    if (bucket) bucket.count += row.quantity
  }
  return buckets
}

export default function ImpactScreen() {
  const { t, locale } = useTranslation()
  const { user } = useAuth()

  const formatNumber = (n: number, digits = 0): string =>
    n.toLocaleString(localeMeta[locale as Locale]?.htmlLang ?? 'nl-NL', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
  const [rows, setRows] = useState<{ created_at: string; quantity: number }[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('reservations')
      .select('quantity, created_at')
      .eq('consumer_id', user.id)
      .eq('status', 'collected')
    if (data) setRows(data)
  }, [user])

  useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))
  }, [load])

  const totalMeals = rows.reduce((sum, r) => sum + (r.quantity || 0), 0)
  const totalCo2Kg = totalMeals * CO2_PER_MEAL_KG
  const totalWaterL = totalMeals * WATER_PER_MEAL_L
  const buckets = buildMonthBuckets(rows, 6)
  const maxBucket = Math.max(1, ...buckets.map((b) => b.count))

  return (
    <SafeAreaView className="flex-1 bg-offwhite" edges={['bottom']}>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : totalMeals === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="leaf-outline" size={56} color="#d1cbc4" />
          <Text className="mt-4 text-center text-lg font-bold text-warm-800">
            {t('impact.emptyTitle')}
          </Text>
          <Text className="mt-2 text-center text-warm-500">
            {t('impact.emptyBody')}
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)' as any)}
            className="mt-6 rounded-xl bg-brand-500 px-5 py-3"
          >
            <Text className="font-bold text-white">{t('impact.emptyCta')}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-5 text-warm-500">
            {t('impact.subtitle')}
          </Text>

          {/* Stat cards */}
          <View className="mb-4 rounded-2xl bg-white p-5">
            <Text className="text-sm font-bold text-warm-500">{t('impact.mealsSaved')}</Text>
            <Text className="mt-1 text-4xl font-extrabold text-warm-900">
              {formatNumber(totalMeals)}
            </Text>
            <Text className="mt-1 text-xs text-warm-400">
              {t('impact.mealsSubtext')}
            </Text>
          </View>

          <View className="mb-4 flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-white p-5">
              <Text className="text-sm font-bold text-warm-500">{t('impact.co2Saved')}</Text>
              <Text className="mt-1 text-2xl font-extrabold text-brand-600">
                {formatNumber(totalCo2Kg, 1)} kg
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-white p-5">
              <Text className="text-sm font-bold text-warm-500">{t('impact.waterSaved')}</Text>
              <Text className="mt-1 text-2xl font-extrabold text-blue-600">
                {formatNumber(totalWaterL / 1000, 1)} m³
              </Text>
            </View>
          </View>

          {/* Monthly bars */}
          <View className="mb-5 rounded-2xl bg-white p-5">
            <Text className="mb-4 text-base font-bold text-warm-800">
              {t('impact.mealsPerMonth')}
            </Text>
            <View className="flex-row items-end" style={{ height: 160, gap: 10 }}>
              {buckets.map((b) => {
                const heightPct = (b.count / maxBucket) * 100
                return (
                  <View key={b.key} className="flex-1 items-center">
                    <View className="w-full flex-1 items-center justify-end">
                      {b.count > 0 && (
                        <Text className="text-xs font-bold text-warm-700 mb-1">
                          {b.count}
                        </Text>
                      )}
                      <View
                        className="w-full rounded-t-lg bg-brand-500"
                        style={{
                          height: `${b.count > 0 ? Math.max(heightPct, 4) : 0}%`,
                        }}
                      />
                    </View>
                    <Text className="mt-2 text-xs font-semibold uppercase text-warm-500">
                      {t(`impact.months.${b.labelKey}`)}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>

          <Text className="text-xs text-warm-400 leading-5">
            {t('impact.footnote')}
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
