'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ProfileFormProps {
  userId: string
  email: string
  profile: {
    display_name: string
    avatar_url: string | null
    city: string
    phone: string
  }
}

export function ProfileForm({ userId, email, profile }: ProfileFormProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [city, setCity] = useState(profile.city)
  const [phone, setPhone] = useState(profile.phone)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        city: city || null,
        phone: phone || null,
      })
      .eq('id', userId)

    if (updateError) {
      setError('Er is iets misgegaan. Probeer het opnieuw.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.display_name}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
            {displayName.charAt(0).toUpperCase() || '?'}
          </div>
        )}
        <div>
          <p className="font-semibold text-warm-800">{displayName || 'Geen naam'}</p>
          <p className="text-sm text-warm-500">{email}</p>
        </div>
      </div>

      <hr className="border-warm-100" />

      {/* Fields */}
      <Input
        label="Naam"
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Je naam"
        required
      />

      <Input
        label="E-mailadres"
        type="email"
        value={email}
        disabled
        className="bg-warm-50 text-warm-400"
      />

      <Input
        label="Stad"
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="bijv. Amsterdam"
      />

      <Input
        label="Telefoonnummer"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="06-12345678"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Profiel opgeslagen!</p>}

      <Button type="submit" variant="primary" loading={loading} className="w-full">
        Opslaan
      </Button>
    </form>
  )
}
