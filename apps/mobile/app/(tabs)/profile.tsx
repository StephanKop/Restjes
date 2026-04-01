import { View, Text, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth-context'

export default function ProfileScreen() {
  const { user, signOut } = useAuth()

  const displayName =
    user?.user_metadata?.display_name ?? user?.email ?? 'Gebruiker'
  const email = user?.email ?? ''
  const role = user?.user_metadata?.role

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

          {role === 'merchant' && (
            <Pressable
              onPress={() => {
                // Placeholder: navigate to merchant dashboard
              }}
              className="flex-row items-center bg-brand-50 rounded-xl px-4 py-3 active:opacity-80"
            >
              <Ionicons name="storefront-outline" size={20} color="#22c55e" />
              <Text className="text-brand-600 font-semibold text-sm ml-2 flex-1">
                Aanbieder dashboard
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#22c55e" />
            </Pressable>
          )}
        </View>

        <View className="bg-white rounded-2xl overflow-hidden">
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
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#3d3833"
            />
            <Text className="text-warm-800 text-base ml-3 flex-1">
              Over Restjes
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#b0a89e" />
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
