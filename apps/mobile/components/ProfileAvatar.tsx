import { useEffect, useState } from 'react'
import { Pressable, Image, Text } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'

export function ProfileAvatar({ size = 36, bare = false }: { size?: number; bare?: boolean }) {
  const { user } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [initial, setInitial] = useState<string>('?')

  useEffect(() => {
    if (!user) return
    let cancelled = false

    const fallbackName =
      (user.user_metadata?.display_name as string | undefined) ||
      user.email ||
      '?'
    setInitial(fallbackName.charAt(0).toUpperCase())

    supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (cancelled || !data) return
        setAvatarUrl(data.avatar_url ?? null)
        const name = data.display_name || fallbackName
        setInitial(name.charAt(0).toUpperCase())
      })

    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <Pressable
      onPress={() => router.navigate('/(tabs)/profile')}
      accessibilityRole="button"
      accessibilityLabel="Profile"
      hitSlop={8}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        ...(bare
          ? { overflow: 'hidden' as const }
          : {
              borderWidth: 2,
              borderColor: '#ffffff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 3,
            }),
      }}
      className="bg-brand-100 items-center justify-center active:opacity-80"
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{
            width: bare ? size : size - 4,
            height: bare ? size : size - 4,
            borderRadius: bare ? size / 2 : (size - 4) / 2,
          }}
        />
      ) : (
        <Text className="text-brand-700 font-bold" style={{ fontSize: size * 0.42 }}>
          {initial}
        </Text>
      )}
    </Pressable>
  )
}
