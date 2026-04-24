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
import { supabase } from '../../lib/supabase'
import { useTranslation } from '../../lib/i18n'
import { signInWithOAuthNative } from '../../lib/oauth'
import { GoogleLogo } from '../../components/GoogleLogo'

export default function LoginScreen() {
  const { t } = useTranslation()
  const videoRef = useRef<Video>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('auth.mobile.errors.fillInFields'))
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
        setError(t('auth.login.errors.invalidCredentials'))
      } else if (signInError.message.includes('Email not confirmed')) {
        setError(t('auth.mobile.errors.emailNotConfirmedMobile'))
      } else {
        setError(t('auth.login.errors.generic'))
      }
      return
    }

    router.replace('/(tabs)')
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError(null)

    try {
      const result = await signInWithOAuthNative('google')
      if (result.ok) {
        router.replace('/(tabs)')
        return
      }
      if (result.reason === 'start') setError(t('auth.mobile.errors.googleStartFailed'))
      else if (result.reason === 'session') setError(t('auth.mobile.errors.sessionFailed'))
      // 'cancelled' — user closed the browser, no message needed
    } catch {
      setError(t('auth.mobile.errors.googleGeneric'))
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
              {t('auth.mobile.tagline')}
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
                <GoogleLogo />
                <Text className="text-warm-800 font-bold text-base ml-3">
                  {t('auth.mobile.continueWithGoogle')}
                </Text>
              </>
            )}
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-white/20" />
            <Text className="text-white/50 text-xs mx-4 font-semibold">{t('auth.mobile.dividerOr')}</Text>
            <View className="flex-1 h-px bg-white/20" />
          </View>

          {/* Email/password inputs */}
          <View className="gap-3 mb-4">
            <TextInput
              className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-warm-800 text-[16px]"
              placeholder={t('auth.fields.emailLabel')}
              placeholderTextColor="#b0a89e"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TextInput
              className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-warm-800 text-[16px]"
              placeholder={t('auth.fields.passwordLabel')}
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
              <Text className="text-white font-bold text-base">{t('auth.login.submit')}</Text>
            )}
          </Pressable>

          <View className="items-center gap-3">
            <Link href={'/(auth)/forgot-password' as any} asChild>
              <Pressable>
                <Text className="text-white/70 text-sm font-semibold">
                  {t('auth.login.forgotPassword')}
                </Text>
              </Pressable>
            </Link>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text className="text-white/70 text-sm">
                  {t('auth.login.noAccount')}{' '}
                  <Text className="text-white font-semibold">{t('auth.login.signUpLink')}</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
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
