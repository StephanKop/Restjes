import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth-context'
import { supabase } from '../../lib/supabase'
import { pickImage as pickImageFromLib } from '../../lib/image-picker'

interface ProfileData {
  display_name: string | null
  avatar_url: string | null
  city: string | null
  phone: string | null
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  // Editable fields
  const [editingField, setEditingField] = useState<string | null>(null)
  const [fieldInput, setFieldInput] = useState('')
  const [savingField, setSavingField] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const email = user?.email ?? ''

  const fetchProfile = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, city, phone')
      .eq('id', user.id)
      .single()

    if (data) setProfile(data as ProfileData)
  }, [user])

  useEffect(() => {
    fetchProfile().finally(() => setLoading(false))
  }, [fetchProfile])

  const saveField = async (field: keyof ProfileData, value: string) => {
    if (!user) return
    setSavingField(true)

    const trimmed = value.trim()
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: trimmed || null })
      .eq('id', user.id)

    if (error) {
      Alert.alert('Fout', 'Kon niet opslaan.')
    } else {
      setProfile((prev) => prev ? { ...prev, [field]: trimmed || null } : prev)

      // Also update user metadata for display_name
      if (field === 'display_name' && trimmed) {
        await supabase.auth.updateUser({
          data: { display_name: trimmed },
        })
      }
    }

    setSavingField(false)
    setEditingField(null)
  }

  const handlePickAvatar = async () => {
    const asset = await pickImageFromLib()
    if (!asset || !user) return

    setUploadingAvatar(true)
    const ext = asset.uri.split('.').pop() ?? 'jpg'
    const fileName = `avatars/${user.id}/${Date.now()}.${ext}`

    const response = await fetch(asset.uri)
    const blob = await response.blob()
    const arrayBuffer = await new Response(blob).arrayBuffer()

    // Delete old avatar
    if (profile?.avatar_url) {
      const oldPath = profile.avatar_url.split('/dish-images/')[1]
      if (oldPath) await supabase.storage.from('dish-images').remove([oldPath])
    }

    const { error: uploadError } = await supabase.storage
      .from('dish-images')
      .upload(fileName, arrayBuffer, {
        contentType: asset.mimeType ?? `image/${ext}`,
        upsert: false,
      })

    if (uploadError) {
      Alert.alert('Fout', 'Kon profielfoto niet uploaden.')
      setUploadingAvatar(false)
      return
    }

    const { data: urlData } = supabase.storage.from('dish-images').getPublicUrl(fileName)
    const avatarUrl = urlData.publicUrl

    await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id)

    setProfile((prev) => prev ? { ...prev, avatar_url: avatarUrl } : prev)
    setUploadingAvatar(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.replace('/(auth)/login')
  }

  const displayName = profile?.display_name ?? user?.user_metadata?.display_name ?? email.split('@')[0] ?? 'Gebruiker'

  const renderEditableRow = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    field: keyof ProfileData,
    value: string | null,
    placeholder: string,
    keyboardType?: 'default' | 'phone-pad'
  ) => {
    const isEditing = editingField === field

    if (isEditing) {
      return (
        <View className="flex-row items-center mb-3">
          <TextInput
            className="flex-1 bg-warm-100 border border-warm-200 rounded-xl px-4 py-2.5 text-[16px] text-warm-800"
            placeholder={placeholder}
            placeholderTextColor="#b0a89e"
            value={fieldInput}
            onChangeText={setFieldInput}
            autoFocus
            returnKeyType="done"
            keyboardType={keyboardType}
            onSubmitEditing={() => saveField(field, fieldInput)}
          />
          <Pressable
            className="ml-2 bg-brand-500 rounded-xl px-4 py-2.5"
            onPress={() => saveField(field, fieldInput)}
            disabled={savingField}
          >
            {savingField ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-sm">Opslaan</Text>
            )}
          </Pressable>
          <Pressable className="ml-2" onPress={() => setEditingField(null)}>
            <Ionicons name="close" size={22} color="#b0a89e" />
          </Pressable>
        </View>
      )
    }

    return (
      <Pressable
        onPress={() => {
          setFieldInput(value ?? '')
          setEditingField(field)
        }}
        className="flex-row items-center bg-warm-100 rounded-xl px-4 py-3 mb-3 active:opacity-80"
      >
        <Ionicons name={icon} size={18} color="#8a8680" />
        <Text className="text-warm-700 text-sm ml-2 flex-1">
          {value || placeholder}
        </Text>
        <Ionicons name="pencil-outline" size={16} color="#b0a89e" />
      </Pressable>
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
    <SafeAreaView className="flex-1 bg-offwhite" edges={['top', 'bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-2 pb-8">
          <Text className="text-2xl font-extrabold text-warm-800 mb-6">Profiel</Text>

          <View className="bg-white rounded-2xl p-5 mb-4">
            {/* Avatar + name */}
            <View className="flex-row items-center mb-4">
              <Pressable onPress={handlePickAvatar} className="active:opacity-80">
                {uploadingAvatar ? (
                  <View className="w-14 h-14 bg-warm-100 rounded-full items-center justify-center">
                    <ActivityIndicator size="small" color="#22c55e" />
                  </View>
                ) : profile?.avatar_url ? (
                  <View>
                    <Image
                      source={{ uri: profile.avatar_url }}
                      className="w-14 h-14 rounded-full"
                      resizeMode="cover"
                    />
                    <View className="absolute bottom-0 right-0 bg-brand-500 rounded-full p-1">
                      <Ionicons name="camera" size={10} color="#ffffff" />
                    </View>
                  </View>
                ) : (
                  <View className="w-14 h-14 bg-brand-100 rounded-full items-center justify-center">
                    <Ionicons name="person" size={28} color="#22c55e" />
                    <View className="absolute bottom-0 right-0 bg-brand-500 rounded-full p-1">
                      <Ionicons name="camera" size={10} color="#ffffff" />
                    </View>
                  </View>
                )}
              </Pressable>
              <View className="flex-1 ml-4">
                <Text className="text-lg font-bold text-warm-800">
                  {displayName}
                </Text>
                <Text className="text-sm text-warm-500">{email}</Text>
              </View>
            </View>

            {/* Editable fields */}
            {renderEditableRow('person-outline', 'Naam', 'display_name', profile?.display_name ?? null, 'Stel je naam in')}
            {renderEditableRow('location-outline', 'Woonplaats', 'city', profile?.city ?? null, 'Stel je woonplaats in')}
            {renderEditableRow('call-outline', 'Telefoon', 'phone', profile?.phone ?? null, 'Stel je telefoonnummer in', 'phone-pad')}
          </View>

          {/* Impact */}
          <View className="bg-white rounded-2xl overflow-hidden mb-4">
            <Pressable
              onPress={() => router.push('/impact' as any)}
              className="flex-row items-center px-5 py-4 active:bg-warm-100"
            >
              <View className="w-8 h-8 rounded-lg bg-brand-100 items-center justify-center mr-3">
                <Ionicons name="leaf-outline" size={18} color="#22c55e" />
              </View>
              <Text className="text-warm-800 text-base font-bold flex-1">
                Mijn impact
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#b0a89e" />
            </Pressable>
          </View>

          {/* Merchant section */}
          <View className="bg-white rounded-2xl overflow-hidden mb-4">
            <Pressable
              onPress={() => router.push('/aanbieder/' as any)}
              className="flex-row items-center px-5 py-4 border-b border-warm-100 active:bg-warm-100"
            >
              <View className="w-8 h-8 rounded-lg bg-brand-100 items-center justify-center mr-3">
                <Ionicons name="storefront-outline" size={18} color="#22c55e" />
              </View>
              <Text className="text-warm-800 text-base font-bold flex-1">
                Mijn aanbod
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#b0a89e" />
            </Pressable>
            <Pressable
              onPress={() => router.push('/dish/create')}
              className="flex-row items-center px-5 py-4 active:bg-warm-100"
            >
              <View className="w-8 h-8 rounded-lg bg-brand-100 items-center justify-center mr-3">
                <Ionicons name="add-circle-outline" size={18} color="#22c55e" />
              </View>
              <Text className="text-brand-600 text-base font-semibold flex-1">
                Nieuw gerecht plaatsen
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#22c55e" />
            </Pressable>
          </View>

          {/* App menu */}
          <View className="bg-white rounded-2xl overflow-hidden mb-4">
            <Pressable
              onPress={() => {}}
              className="flex-row items-center px-5 py-4 border-b border-warm-100 active:bg-warm-100"
            >
              <Ionicons name="settings-outline" size={20} color="#3d3833" />
              <Text className="text-warm-800 text-base ml-3 flex-1">
                Instellingen
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#b0a89e" />
            </Pressable>
            <Pressable
              onPress={() => {}}
              className="flex-row items-center px-5 py-4 border-b border-warm-100 active:bg-warm-100"
            >
              <Ionicons name="help-circle-outline" size={20} color="#3d3833" />
              <Text className="text-warm-800 text-base ml-3 flex-1">
                Hulp en ondersteuning
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#b0a89e" />
            </Pressable>
            <Pressable
              onPress={() => {}}
              className="flex-row items-center px-5 py-4 active:bg-warm-100"
            >
              <Ionicons name="information-circle-outline" size={20} color="#3d3833" />
              <Text className="text-warm-800 text-base ml-3 flex-1">
                Over Kliekjesclub
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#b0a89e" />
            </Pressable>
          </View>

          {/* Sign out */}
          <Pressable
            onPress={handleSignOut}
            className="border border-red-200 rounded-xl px-6 py-3.5 items-center active:bg-red-50"
          >
            <Text className="text-red-500 font-bold text-base">Uitloggen</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
