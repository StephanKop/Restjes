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
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'
import { Video, ResizeMode } from 'expo-av'
import { supabase } from '../../lib/supabase'
import { useTranslation } from '../../lib/i18n'
import { signInWithOAuthNative } from '../../lib/oauth'
import { GoogleLogo } from '../../components/GoogleLogo'

export default function SignupScreen() {
  const { t } = useTranslation()
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
      setError(t('auth.mobile.signup.fillAllFields'))
      return
    }

    if (password.length < 6) {
      setError(t('auth.signup.errors.passwordTooShort'))
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
        setError(t('auth.mobile.signup.emailAlreadyUsed'))
      } else {
        setError(t('auth.signup.errors.generic'))
      }
      return
    }

    setSuccess(true)
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
    } catch {
      setError(t('auth.mobile.errors.googleGeneric'))
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
              {t('auth.mobile.signup.successHeading')}
            </Text>
            <Text className="text-warm-500 text-center text-base mb-6">
              {t('auth.mobile.signup.successBody')}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable className="bg-brand-500 rounded-xl px-6 py-3.5 active:opacity-80">
                <Text className="text-white font-bold text-base">
                  {t('auth.mobile.signup.successCta')}
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
          <View className="items-center mb-6">
            <Image
              source={require('../../assets/images/logo.png')}
              style={{ width: 96, height: 96 }}
              resizeMode="contain"
            />
          </View>
          <View className="mb-8">
            <Text className="text-3xl font-bold text-white mb-2">
              {t('auth.mobile.signup.heading')}
            </Text>
            <Text className="text-base text-white/80">
              {t('auth.mobile.signup.subheading')}
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

          <View className="gap-3 mb-4">
            <TextInput
              className="bg-white/15 border border-white/20 rounded-xl px-4 py-3 text-white text-[16px]"
              placeholder={t('auth.fields.nameLabel')}
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />
            <TextInput
              className="bg-white/15 border border-white/20 rounded-xl px-4 py-3 text-white text-[16px]"
              placeholder={t('auth.mobile.signup.cityLabel')}
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              className="bg-white/15 border border-white/20 rounded-xl px-4 py-3 text-white text-[16px]"
              placeholder={t('auth.fields.emailLabel')}
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TextInput
              className="bg-white/15 border border-white/20 rounded-xl px-4 py-3 text-white text-[16px]"
              placeholder={t('auth.fields.passwordLabel')}
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
                {t('auth.signup.submit')}
              </Text>
            )}
          </Pressable>

          <View className="items-center gap-3">
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-white/70 text-sm">
                  {t('auth.mobile.signup.haveAccount')}{' '}
                  <Text className="text-white font-semibold">{t('auth.login.submit')}</Text>
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
