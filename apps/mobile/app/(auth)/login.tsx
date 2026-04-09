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
import { Link, router } from 'expo-router'
import { supabase } from '../../lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Vul je e-mailadres en wachtwoord in.')
      return
    }

    setLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        setError('Onjuist e-mailadres of wachtwoord.')
      } else if (signInError.message.includes('Email not confirmed')) {
        setError('Je e-mailadres is nog niet bevestigd. Controleer je inbox.')
      } else {
        setError('Er is iets misgegaan. Probeer het opnieuw.')
      }
      return
    }

    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView className="flex-1 bg-offwhite">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <View className="mb-10">
            <Text className="text-4xl font-extrabold text-warm-800 mb-2">
              Restjes
            </Text>
            <Text className="text-base text-warm-500">
              Red eten, bespaar geld
            </Text>
          </View>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          )}

          <View className="gap-4 mb-6">
            <TextInput
              className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-warm-800 text-base"
              placeholder="E-mailadres"
              placeholderTextColor="#9e9589"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TextInput
              className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-warm-800 text-base"
              placeholder="Wachtwoord"
              placeholderTextColor="#9e9589"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className="bg-brand-500 rounded-xl px-6 py-3.5 items-center mb-6 active:opacity-80"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">Inloggen</Text>
            )}
          </Pressable>

          <View className="items-center gap-3">
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text className="text-warm-500 text-sm">
                  Nog geen account?{' '}
                  <Text className="text-brand-500 font-semibold">Aanmelden</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
