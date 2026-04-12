import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleReset = async () => {
    const trimmed = email.trim()
    if (!trimmed) {
      setError('Vul je e-mailadres in.')
      return
    }

    setLoading(true)
    setError(null)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed)

    setLoading(false)

    if (resetError) {
      setError('Er is iets misgegaan. Probeer het opnieuw.')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-offwhite">
        <View className="flex-1 justify-center px-6">
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-brand-100 items-center justify-center mb-4">
              <Ionicons name="mail-outline" size={32} color="#22c55e" />
            </View>
            <Text className="text-xl font-bold text-warm-800 text-center mb-2">
              E-mail verzonden
            </Text>
            <Text className="text-base text-warm-500 text-center mb-8">
              We hebben een e-mail gestuurd naar {email.trim()} met instructies om je wachtwoord te herstellen.
            </Text>
            <Pressable
              className="bg-brand-500 rounded-xl px-8 py-3.5 w-full mb-3"
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text className="text-white font-bold text-base text-center">
                Terug naar inloggen
              </Text>
            </Pressable>
            <Pressable onPress={() => setSuccess(false)}>
              <Text className="text-brand-500 font-semibold text-sm">
                Opnieuw verzenden
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-offwhite">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          {/* Back button */}
          <Pressable
            className="absolute top-4 left-6 flex-row items-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#3d3833" />
            <Text className="text-warm-700 text-base ml-1">Terug</Text>
          </Pressable>

          <View className="mb-8">
            <Text className="text-2xl font-bold text-warm-800 mb-2">
              Wachtwoord vergeten?
            </Text>
            <Text className="text-base text-warm-500">
              Vul je e-mailadres in en we sturen je een link om je wachtwoord te herstellen.
            </Text>
          </View>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          )}

          <TextInput
            className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-warm-800 text-base mb-6"
            placeholder="E-mailadres"
            placeholderTextColor="#9e9589"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="done"
            onSubmitEditing={handleReset}
          />

          <Pressable
            onPress={handleReset}
            disabled={loading}
            className="bg-brand-500 rounded-xl px-6 py-3.5 items-center active:opacity-80"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                Verstuur herstel-e-mail
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
