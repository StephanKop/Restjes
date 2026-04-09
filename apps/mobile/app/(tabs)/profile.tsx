import { useCallback, useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth-context'
import { supabase } from '../../lib/supabase'

export default function ProfileScreen() {
  const { user, signOut } = useAuth()

  const displayName =
    user?.user_metadata?.display_name ?? user?.email ?? 'Gebruiker'
  const email = user?.email ?? ''

  const [city, setCity] = useState('')
  const [editingCity, setEditingCity] = useState(false)
  const [cityInput, setCityInput] = useState('')

  const fetchCity = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('city')
      .eq('id', user.id)
      .single()
    if (data?.city) setCity(data.city)
  }, [user])

  useEffect(() => {
    fetchCity()
  }, [fetchCity])

  const handleSaveCity = async () => {
    const trimmed = cityInput.trim()
    if (!trimmed || !user) return

    const { error } = await supabase
      .from('profiles')
      .update({ city: trimmed })
      .eq('id', user.id)

    if (error) {
      Alert.alert('Fout', 'Kon woonplaats niet opslaan.')
      return
    }

    setCity(trimmed)
    setEditingCity(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.replace('/(auth)/login')
  }

  return (
    <SafeAreaView className="flex-1 bg-offwhite" edges={['bottom']}>
      <View className="flex-1 px-5 pt-4">
        <Text className="text-2xl font-bold text-warm-800 mb-6">Profiel</Text>

        <View className="bg-white rounded-2xl p-5 mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-14 h-14 bg-brand-100 rounded-full items-center justify-center mr-4">
              <Ionicons name="person" size={28} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-warm-800">
                {displayName}
              </Text>
              <Text className="text-sm text-warm-500">{email}</Text>
            </View>
          </View>

          {/* City */}
          {editingCity ? (
            <View className="flex-row items-center mb-3">
              <TextInput
                className="flex-1 bg-warm-100 border border-warm-200 rounded-xl px-4 py-2.5 text-base text-warm-800"
                placeholder="Woonplaats"
                placeholderTextColor="#9e9589"
                value={cityInput}
                onChangeText={setCityInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveCity}
              />
              <Pressable
                className="ml-2 bg-brand-500 rounded-xl px-4 py-2.5"
                onPress={handleSaveCity}
              >
                <Text className="text-white font-bold text-sm">Opslaan</Text>
              </Pressable>
              <Pressable
                className="ml-2"
                onPress={() => setEditingCity(false)}
              >
                <Ionicons name="close" size={22} color="#9e9589" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setCityInput(city)
                setEditingCity(true)
              }}
              className="flex-row items-center bg-warm-100 rounded-xl px-4 py-3 mb-3 active:opacity-80"
            >
              <Ionicons name="location-outline" size={18} color="#736b62" />
              <Text className="text-warm-700 text-sm ml-2 flex-1">
                {city || 'Stel je woonplaats in'}
              </Text>
              <Ionicons name="pencil-outline" size={16} color="#9e9589" />
            </Pressable>
          )}

          <Pressable
            onPress={() => router.push('/dish/create')}
            className="flex-row items-center bg-brand-50 rounded-xl px-4 py-3 active:opacity-80"
          >
            <Ionicons name="add-circle-outline" size={20} color="#22c55e" />
            <Text className="text-brand-600 font-semibold text-sm ml-2 flex-1">
              Nieuw gerecht plaatsen
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#22c55e" />
          </Pressable>
        </View>

        <View className="bg-white rounded-2xl overflow-hidden">
          <Pressable
            onPress={() => {}}
            className="flex-row items-center px-5 py-4 border-b border-warm-100 active:bg-warm-100"
          >
            <Ionicons name="settings-outline" size={20} color="#302b26" />
            <Text className="text-warm-800 text-base ml-3 flex-1">
              Instellingen
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#9e9589" />
          </Pressable>
          <Pressable
            onPress={() => {}}
            className="flex-row items-center px-5 py-4 border-b border-warm-100 active:bg-warm-100"
          >
            <Ionicons name="help-circle-outline" size={20} color="#302b26" />
            <Text className="text-warm-800 text-base ml-3 flex-1">
              Hulp en ondersteuning
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#9e9589" />
          </Pressable>
          <Pressable
            onPress={() => {}}
            className="flex-row items-center px-5 py-4 active:bg-warm-100"
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#302b26"
            />
            <Text className="text-warm-800 text-base ml-3 flex-1">
              Over Restjes
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#9e9589" />
          </Pressable>
        </View>

        <View className="mt-auto pb-4">
          <Pressable
            onPress={handleSignOut}
            className="border border-red-200 rounded-xl px-6 py-3.5 items-center active:bg-red-50"
          >
            <Text className="text-red-500 font-bold text-base">Uitloggen</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
