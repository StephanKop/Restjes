import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link } from 'expo-router'
import { supabase } from '../../lib/supabase'

export default function SignupScreen() {
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!name || !city || !email || !password) {
      setError('Vul alle velden in.')
      return
    }

    if (password.length < 6) {
      setError('Je wachtwoord moet minimaal 6 tekens bevatten.')
      return
    }

    setLoading(true)
    setError(null)

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: name.trim(),
          city: city.trim(),
        },
      },
    })

    setLoading(false)

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('Dit e-mailadres is al in gebruik.')
      } else {
        setError('Er is iets misgegaan. Probeer het opnieuw.')
      }
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-offwhite">
        <View className="flex-1 justify-center px-6">
          <View className="bg-white rounded-2xl p-6 items-center">
            <Text className="text-2xl font-bold text-warm-800 mb-3">
              Welkom bij Restjes!
            </Text>
            <Text className="text-warm-500 text-center text-base mb-6">
              We hebben een bevestigingslink naar je e-mailadres gestuurd.
              Controleer je inbox om je account te activeren.
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable className="bg-brand-500 rounded-xl px-6 py-3.5 active:opacity-80">
                <Text className="text-white font-bold text-base">
                  Naar inloggen
                </Text>
              </Pressable>
            </Link>
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
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-10">
            <Text className="text-3xl font-bold text-warm-800 mb-2">
              Account aanmaken
            </Text>
            <Text className="text-base text-warm-500">
              Begin met het redden van eten bij jou in de buurt
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
              placeholder="Naam"
              placeholderTextColor="#9e9589"
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />
            <TextInput
              className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-warm-800 text-base"
              placeholder="Woonplaats"
              placeholderTextColor="#9e9589"
              value={city}
              onChangeText={setCity}
            />
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
              autoComplete="new-password"
            />
          </View>

          <Pressable
            onPress={handleSignup}
            disabled={loading}
            className="bg-brand-500 rounded-xl px-6 py-3.5 items-center mb-6 active:opacity-80"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                Account aanmaken
              </Text>
            )}
          </Pressable>

          <View className="items-center gap-3">
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-warm-500 text-sm">
                  Al een account?{' '}
                  <Text className="text-brand-500 font-semibold">Inloggen</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
