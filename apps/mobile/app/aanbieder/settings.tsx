import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'

interface MerchantProfile {
  id: string
  business_name: string
  description: string | null
  address_line1: string | null
  city: string | null
  postal_code: string | null
  phone: string | null
  website: string | null
  logo_url: string | null
}

export default function MerchantSettingsScreen() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [merchant, setMerchant] = useState<MerchantProfile | null>(null)

  const [businessName, setBusinessName] = useState('')
  const [description, setDescription] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null)
  const [newLogo, setNewLogo] = useState<ImagePicker.ImagePickerAsset | null>(null)

  const fetchMerchant = useCallback(async () => {
    if (!user) return

    const { data } = await supabase
      .from('merchants')
      .select('id, business_name, description, address_line1, city, postal_code, phone, website, logo_url')
      .eq('profile_id', user.id)
      .single()

    if (data) {
      const m = data as MerchantProfile
      setMerchant(m)
      setBusinessName(m.business_name ?? '')
      setDescription(m.description ?? '')
      setAddressLine1(m.address_line1 ?? '')
      setCity(m.city ?? '')
      setPostalCode(m.postal_code ?? '')
      setPhone(m.phone ?? '')
      setWebsite(m.website ?? '')
      setExistingLogoUrl(m.logo_url)
    }
  }, [user])

  useEffect(() => {
    fetchMerchant().finally(() => setLoading(false))
  }, [fetchMerchant])

  const pickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Toestemming nodig', 'We hebben toegang tot je foto\'s nodig.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) setNewLogo(result.assets[0])
  }

  const uploadLogo = async (merchantId: string): Promise<string | null> => {
    if (!newLogo || !user) return null

    const ext = newLogo.uri.split('.').pop() ?? 'jpg'
    const fileName = `logos/${merchantId}/${Date.now()}.${ext}`

    const response = await fetch(newLogo.uri)
    const blob = await response.blob()
    const arrayBuffer = await new Response(blob).arrayBuffer()

    const { error } = await supabase.storage
      .from('dish-images')
      .upload(fileName, arrayBuffer, {
        contentType: newLogo.mimeType ?? `image/${ext}`,
        upsert: false,
      })

    if (error) return null

    const { data: urlData } = supabase.storage.from('dish-images').getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const handleSave = async () => {
    if (!businessName.trim()) {
      Alert.alert('Verplicht veld', 'Vul een bedrijfsnaam in.')
      return
    }
    if (!user) return

    setSaving(true)

    try {
      let logoUrl = existingLogoUrl

      if (merchant) {
        // Upload new logo if selected
        if (newLogo) {
          const uploaded = await uploadLogo(merchant.id)
          if (uploaded) {
            if (existingLogoUrl) {
              const oldPath = existingLogoUrl.split('/dish-images/')[1]
              if (oldPath) await supabase.storage.from('dish-images').remove([oldPath])
            }
            logoUrl = uploaded
          }
        }

        // Update existing merchant
        const { error } = await supabase
          .from('merchants')
          .update({
            business_name: businessName.trim(),
            description: description.trim() || null,
            address_line1: addressLine1.trim() || null,
            city: city.trim() || null,
            postal_code: postalCode.trim() || null,
            phone: phone.trim() || null,
            website: website.trim() || null,
            logo_url: logoUrl,
          })
          .eq('id', merchant.id)

        if (error) {
          Alert.alert('Fout', error.message)
          setSaving(false)
          return
        }
      } else {
        // Create new merchant
        const { data: created, error } = await supabase
          .from('merchants')
          .insert({
            profile_id: user.id,
            business_name: businessName.trim(),
            description: description.trim() || null,
            address_line1: addressLine1.trim() || null,
            city: city.trim() || null,
            postal_code: postalCode.trim() || null,
            phone: phone.trim() || null,
            website: website.trim() || null,
          })
          .select('id')
          .single()

        if (error || !created) {
          Alert.alert('Fout', error?.message ?? 'Kon profiel niet aanmaken.')
          setSaving(false)
          return
        }

        // Upload logo for newly created merchant
        if (newLogo) {
          const uploaded = await uploadLogo(created.id)
          if (uploaded) {
            await supabase
              .from('merchants')
              .update({ logo_url: uploaded })
              .eq('id', created.id)
          }
        }
      }

      Alert.alert('Opgeslagen', 'Je aanbiedersprofiel is bijgewerkt.', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch {
      Alert.alert('Fout', 'Er is iets misgegaan. Probeer het opnieuw.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-offwhite items-center justify-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    )
  }

  const displayLogo = newLogo?.uri ?? existingLogoUrl

  return (
    <SafeAreaView className="flex-1 bg-offwhite" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          {/* Logo */}
          <View className="items-center mb-6">
            <Pressable onPress={pickLogo} className="active:opacity-80">
              {displayLogo ? (
                <Image
                  source={{ uri: displayLogo }}
                  className="w-24 h-24 rounded-2xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-24 h-24 rounded-2xl bg-warm-100 items-center justify-center">
                  <Ionicons name="storefront-outline" size={36} color="#9e9589" />
                </View>
              )}
              <View className="absolute bottom-0 right-0 bg-brand-500 rounded-full p-1.5">
                <Ionicons name="camera" size={14} color="#ffffff" />
              </View>
            </Pressable>
            <Text className="text-xs text-warm-400 mt-2">Tik om logo te wijzigen</Text>
          </View>

          {/* Business name */}
          <Text className="text-sm font-bold text-warm-600 mb-1.5">Bedrijfsnaam *</Text>
          <TextInput
            className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-base text-warm-800 mb-4"
            placeholder="Naam van je bedrijf of keuken"
            placeholderTextColor="#9e9589"
            value={businessName}
            onChangeText={setBusinessName}
          />

          {/* Description */}
          <Text className="text-sm font-bold text-warm-600 mb-1.5">Beschrijving</Text>
          <TextInput
            className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-base text-warm-800 mb-4"
            placeholder="Vertel iets over je aanbod..."
            placeholderTextColor="#9e9589"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          {/* Address */}
          <Text className="text-sm font-bold text-warm-600 mb-1.5">Adres</Text>
          <TextInput
            className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-base text-warm-800 mb-3"
            placeholder="Straatnaam en huisnummer"
            placeholderTextColor="#9e9589"
            value={addressLine1}
            onChangeText={setAddressLine1}
          />
          <View className="flex-row gap-3 mb-4">
            <TextInput
              className="flex-1 bg-white border border-warm-200 rounded-xl px-4 py-3 text-base text-warm-800"
              placeholder="Postcode"
              placeholderTextColor="#9e9589"
              value={postalCode}
              onChangeText={setPostalCode}
            />
            <TextInput
              className="flex-1 bg-white border border-warm-200 rounded-xl px-4 py-3 text-base text-warm-800"
              placeholder="Plaats"
              placeholderTextColor="#9e9589"
              value={city}
              onChangeText={setCity}
            />
          </View>

          {/* Phone */}
          <Text className="text-sm font-bold text-warm-600 mb-1.5">Telefoonnummer</Text>
          <TextInput
            className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-base text-warm-800 mb-4"
            placeholder="06-12345678"
            placeholderTextColor="#9e9589"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {/* Website */}
          <Text className="text-sm font-bold text-warm-600 mb-1.5">Website</Text>
          <TextInput
            className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-base text-warm-800 mb-6"
            placeholder="https://www.voorbeeld.nl"
            placeholderTextColor="#9e9589"
            value={website}
            onChangeText={setWebsite}
            keyboardType="url"
            autoCapitalize="none"
          />

          {/* Save */}
          <Pressable
            className={`rounded-xl py-4 items-center ${
              saving ? 'bg-brand-300' : 'bg-brand-500 active:bg-brand-600'
            }`}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">Opslaan</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
