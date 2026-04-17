import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useLocalSearchParams, useNavigation, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'

const RATING_LABELS: Record<number, string> = {
  1: 'Slecht',
  2: 'Matig',
  3: 'Oké',
  4: 'Goed',
  5: 'Uitstekend',
}

const PLACEHOLDERS: Record<number, string> = {
  1: 'Wat ging er mis? Je feedback helpt de aanbieder verbeteren.',
  2: 'Wat kan er beter? Deel je ervaring zodat de aanbieder kan verbeteren.',
  3: 'Vertel meer over je ervaring. Was er iets dat opviel?',
  4: 'Leuk dat je het goed vond! Wat vond je het beste?',
  5: 'Geweldig! Vertel anderen waarom je zo tevreden bent.',
}

interface ReservationInfo {
  id: string
  merchant_id: string
  dish: { title: string }
  merchant: { business_name: string }
}

export default function ReviewScreen() {
  const { reservationId } = useLocalSearchParams<{ reservationId: string }>()
  const navigation = useNavigation()
  const { user } = useAuth()

  const [reservation, setReservation] = useState<ReservationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const maxChars = 500

  useEffect(() => {
    navigation.setOptions({ headerTitle: 'Beoordeling' })
  }, [navigation])

  const fetchReservation = useCallback(async () => {
    const { data } = await supabase
      .from('reservations')
      .select(
        `
        id, merchant_id,
        dish:dishes!dish_id (title),
        merchant:merchants!merchant_id (business_name)
      `
      )
      .eq('id', reservationId)
      .single()

    if (data) {
      setReservation(data as unknown as ReservationInfo)
    }
  }, [reservationId])

  useEffect(() => {
    fetchReservation().finally(() => setLoading(false))
  }, [fetchReservation])

  const handleSubmit = async () => {
    if (!user || !reservation) return

    if (rating < 1 || rating > 5) {
      Alert.alert('Beoordeling nodig', 'Selecteer een beoordeling van 1 tot 5 sterren.')
      return
    }

    setSubmitting(true)

    const { error } = await supabase.from('reviews').insert({
      merchant_id: reservation.merchant_id,
      consumer_id: user.id,
      reservation_id: reservationId,
      rating,
      comment: comment.trim() || null,
    })

    setSubmitting(false)

    if (error) {
      if (error.code === '23505') {
        Alert.alert('Al beoordeeld', 'Je hebt al een beoordeling geplaatst voor deze reservering.')
      } else {
        Alert.alert('Fout', 'Er ging iets mis. Probeer het opnieuw.')
      }
      return
    }

    setSuccess(true)
  }

  if (loading) {
    return (
      <View className="flex-1 bg-offwhite items-center justify-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    )
  }

  if (!reservation) {
    return (
      <View className="flex-1 bg-offwhite items-center justify-center px-5">
        <Text className="text-warm-400 text-base text-center">
          Reservering niet gevonden.
        </Text>
      </View>
    )
  }

  if (success) {
    return (
      <View className="flex-1 bg-offwhite items-center justify-center px-8">
        <View className="w-16 h-16 rounded-full bg-brand-100 items-center justify-center mb-4">
          <Ionicons name="checkmark-circle" size={36} color="#22c55e" />
        </View>
        <Text className="text-xl font-bold text-warm-800 text-center mb-2">
          Bedankt voor je beoordeling!
        </Text>
        <Text className="text-base text-warm-500 text-center mb-8">
          Je helpt {reservation.merchant.business_name} en andere gebruikers met je feedback.
        </Text>
        <Pressable
          className="bg-brand-500 rounded-xl px-8 py-3.5 mb-3 w-full"
          onPress={() => router.push('/(tabs)/reservations')}
        >
          <Text className="text-white font-bold text-base text-center">
            Terug naar reserveringen
          </Text>
        </Pressable>
        <Pressable
          className="border border-warm-200 rounded-xl px-8 py-3.5 w-full"
          onPress={() => router.back()}
        >
          <Text className="text-warm-600 font-bold text-base text-center">
            Sluiten
          </Text>
        </Pressable>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-offwhite"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Dish info */}
        <View className="bg-white rounded-2xl p-5 mb-6">
          <Text className="text-sm text-warm-500 mb-1">Beoordeling voor</Text>
          <Text className="text-lg font-bold text-warm-800">
            {reservation.dish.title}
          </Text>
          <Text className="text-sm text-warm-500 mt-0.5">
            {reservation.merchant.business_name}
          </Text>
        </View>

        {/* Star rating */}
        <View className="items-center mb-6">
          <Text className="text-sm font-bold text-warm-800 mb-3">
            Hoe was het?
          </Text>
          <View className="flex-row gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                className="p-1"
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={star <= rating ? '#f59e0b' : '#d1cbc4'}
                />
              </Pressable>
            ))}
          </View>
          {rating > 0 && (
            <Text className="text-sm font-bold text-amber-600 mt-2">
              {RATING_LABELS[rating]}
            </Text>
          )}
        </View>

        {/* Comment */}
        {rating > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-bold text-warm-800 mb-2">
              Vertel meer (optioneel)
            </Text>
            <TextInput
              className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-base text-warm-800 min-h-[120px]"
              placeholder={PLACEHOLDERS[rating] ?? 'Deel je ervaring...'}
              placeholderTextColor="#b0a89e"
              value={comment}
              onChangeText={(text) => {
                if (text.length <= maxChars) setComment(text)
              }}
              multiline
              textAlignVertical="top"
            />
            <Text
              className={`text-xs text-right mt-1 ${
                comment.length > maxChars * 0.9 ? 'text-red-500' : 'text-warm-400'
              }`}
            >
              {comment.length}/{maxChars}
            </Text>
          </View>
        )}

        {/* Submit */}
        <Pressable
          className={`rounded-xl py-4 items-center ${
            rating === 0 || submitting
              ? 'bg-warm-200'
              : 'bg-brand-500 active:bg-brand-600'
          }`}
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text
              className={`font-bold text-base ${
                rating === 0 ? 'text-warm-400' : 'text-white'
              }`}
            >
              Beoordeling plaatsen
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
