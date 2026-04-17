import { useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'
import { Video, ResizeMode } from 'expo-av'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { supabase } from '../../lib/supabase'

WebBrowser.maybeCompleteAuthSession()

export default function SignupScreen() {
  const videoRef = useRef<Video>(null)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError(null)

    try {
      const redirectUri = makeRedirectUri({ scheme: 'kliekjesclub' })

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      })

      if (oauthError || !data.url) {
        setError('Kon Google-login niet starten. Probeer het opnieuw.')
        setGoogleLoading(false)
        return
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri)

      if (result.type === 'success') {
        const url = new URL(result.url)
        const params = new URLSearchParams(
          url.hash ? url.hash.substring(1) : url.search.substring(1)
        )
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (!sessionError) {
            router.replace('/(tabs)')
            return
          }
        }

        setError('Kon sessie niet instellen. Probeer het opnieuw.')
      }
    } catch {
      setError('Er is iets misgegaan met Google-login.')
    } finally {
      setGoogleLoading(false)
    }
  }

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-offwhite">
        <View className="flex-1 justify-center px-6">
          <View className="bg-white rounded-2xl p-6 items-center">
            <Text className="text-2xl font-bold text-warm-800 mb-3">
              Welkom bij Kliekjesclub!
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
    <View style={styles.container}>
      {/* Video background */}
      <Video
        ref={videoRef}
        source={require('../../assets/hero.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />

      {/* Dark overlay */}
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', padding: 24, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-8">
            <Text className="text-3xl font-bold text-white mb-2">
              Account aanmaken
            </Text>
            <Text className="text-base text-white/80">
              Begin met het redden van eten bij jou in de buurt
            </Text>
          </View>

          {error && (
            <View className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 mb-4">
              <Text className="text-white text-sm">{error}</Text>
            </View>
          )}

          {/* Google button */}
          <Pressable
            onPress={handleGoogleLogin}
            disabled={googleLoading}
            className="bg-white rounded-xl px-6 py-3.5 mb-3 flex-row items-center justify-center active:opacity-90"
          >
            {googleLoading ? (
              <ActivityIndicator color="#3d3833" />
            ) : (
              <>
                <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#4285F4' }}>G</Text>
                </View>
                <Text className="text-warm-800 font-bold text-base ml-3">
                  Doorgaan met Google
                </Text>
              </>
            )}
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-white/20" />
            <Text className="text-white/50 text-xs mx-4 font-semibold">OF</Text>
            <View className="flex-1 h-px bg-white/20" />
          </View>

          <View className="gap-3 mb-4">
            <TextInput
              className="bg-white/15 border border-white/20 rounded-xl px-4 py-3 text-white text-base"
              placeholder="Naam"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />
            <TextInput
              className="bg-white/15 border border-white/20 rounded-xl px-4 py-3 text-white text-base"
              placeholder="Woonplaats"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              className="bg-white/15 border border-white/20 rounded-xl px-4 py-3 text-white text-base"
              placeholder="E-mailadres"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TextInput
              className="bg-white/15 border border-white/20 rounded-xl px-4 py-3 text-white text-base"
              placeholder="Wachtwoord"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <Pressable
            onPress={handleSignup}
            disabled={loading}
            className="bg-brand-500 rounded-xl px-6 py-3.5 items-center mb-5 active:opacity-80"
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
                <Text className="text-white/70 text-sm">
                  Al een account?{' '}
                  <Text className="text-white font-semibold">Inloggen</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  content: {
    flex: 1,
  },
})
