import { useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native'
import { Link, router } from 'expo-router'
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { supabase } from '../../lib/supabase'

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const videoRef = useRef<Video>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

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

        // Handle both fragment and query params
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
        <View className="flex-1 justify-center px-6">
          {/* Branding */}
          <View className="items-center mb-8">
            <Image
              source={require('../../assets/images/logo.png')}
              style={{ width: 160, height: 160 }}
              resizeMode="contain"
            />
            <Text className="text-lg text-white/80 mt-2">
              Red eten, bespaar geld
            </Text>
          </View>

          {/* Error */}
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
                <GoogleIcon />
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

          {/* Email/password inputs */}
          <View className="gap-3 mb-4">
            <TextInput
              className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-warm-800 text-[16px]"
              placeholder="E-mailadres"
              placeholderTextColor="#b0a89e"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TextInput
              className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-warm-800 text-[16px]"
              placeholder="Wachtwoord"
              placeholderTextColor="#b0a89e"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className="bg-brand-500 rounded-xl px-6 py-3.5 items-center mb-5 active:opacity-80"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">Inloggen</Text>
            )}
          </Pressable>

          <View className="items-center gap-3">
            <Link href={'/(auth)/forgot-password' as any} asChild>
              <Pressable>
                <Text className="text-white/70 text-sm font-semibold">
                  Wachtwoord vergeten?
                </Text>
              </Pressable>
            </Link>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text className="text-white/70 text-sm">
                  Nog geen account?{' '}
                  <Text className="text-white font-semibold">Aanmelden</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

function GoogleIcon() {
  // Inline SVG isn't available in RN, so use a text-based approach
  // This renders the Google "G" logo using styled views
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#4285F4' }}>G</Text>
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
