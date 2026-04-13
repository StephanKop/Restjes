'use client'

import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CameraIcon } from '@/components/icons'

interface MerchantProfile {
  id: string
  profile_id: string
  description: string | null
  address_line1: string | null
  address_line2: string | null
  postal_code: string | null
  logo_url: string | null
}

interface ProfileFormProps {
  userId: string
  email: string
  profile: {
    display_name: string
    avatar_url: string | null
    city: string
    phone: string
  }
  merchant: MerchantProfile | null
}

export function ProfileForm({ userId, email, profile, merchant }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [displayName, setDisplayName] = useState(profile.display_name)
  const [city, setCity] = useState(profile.city)
  const [phone, setPhone] = useState(profile.phone)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentPhoto = profile.avatar_url ?? merchant?.logo_url ?? null
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentPhoto)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData(e.currentTarget)

      // --- Upload photo if changed ---
      let avatarUrl = currentPhoto
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop()
        const filePath = `${userId}/avatar.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('merchant-assets')
          .upload(filePath, photoFile, { upsert: true })

        if (uploadError) throw new Error(`Foto upload mislukt: ${uploadError.message}`)

        const { data: publicUrlData } = supabase.storage
          .from('merchant-assets')
          .getPublicUrl(filePath)

        avatarUrl = publicUrlData.publicUrl
      }

      // --- Save profile ---
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          avatar_url: avatarUrl,
          city: city || null,
          phone: phone || null,
        })
        .eq('id', userId)

      if (profileError) throw new Error(profileError.message)

      // --- Save merchant ---
      const description = (formData.get('description') as string) || null
      const addressLine1 = (formData.get('address_line1') as string) || null
      const addressLine2 = (formData.get('address_line2') as string) || null
      const postalCode = (formData.get('postal_code') as string) || null

      const hasMerchantData =
        description || addressLine1 || postalCode || merchant

      if (hasMerchantData) {
        // Geocode address
        let latitude: number | null = null
        let longitude: number | null = null
        if (addressLine1 && city) {
          try {
            const geoRes = await fetch('/api/geocode', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                address: [addressLine1, postalCode, city, 'Nederland']
                  .filter(Boolean)
                  .join(', '),
              }),
            })
            if (geoRes.ok) {
              const geo = await geoRes.json()
              latitude = geo.latitude
              longitude = geo.longitude
            }
          } catch {
            // Geocoding failed silently
          }
        }

        const merchantData = {
          profile_id: userId,
          business_name: displayName || 'Aanbieder',
          description,
          address_line1: addressLine1,
          address_line2: addressLine2,
          city: city || null,
          postal_code: postalCode,
          phone: phone || null,
          logo_url: avatarUrl,
          latitude,
          longitude,
        }

        if (merchant) {
          const { error: updateError } = await supabase
            .from('merchants')
            .update(merchantData)
            .eq('id', merchant.id)

          if (updateError) throw new Error(updateError.message)
        } else {
          const { error: insertError } = await supabase.from('merchants').insert(merchantData)

          if (insertError) throw new Error(insertError.message)
        }
      }

      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-2xl bg-white p-8 shadow-card" data-reveal>
        {/* Profile photo */}
        <div className="mb-6 flex items-center gap-5">
          <div className="relative">
            {photoPreview ? (
              <Image
                src={photoPreview}
                alt={profile.display_name}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover"
                unoptimized={photoFile !== null}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700">
                {displayName.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white shadow-md transition-colors hover:bg-brand-600"
            >
              <CameraIcon className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          <div>
            <p className="font-semibold text-warm-800">{displayName || 'Geen naam'}</p>
            <p className="text-sm text-warm-500">{email}</p>
          </div>
        </div>

        <div className="space-y-4">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Telefoonnummer"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06-12345678"
            />
            <Input
              label="Stad"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="bijv. Amsterdam"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-semibold text-warm-800"
            >
              Beschrijving
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={merchant?.description ?? ''}
              placeholder="Vertel iets over jezelf of wat je aanbiedt..."
              className="w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-warm-800 placeholder:text-warm-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Adresregel 1"
              name="address_line1"
              defaultValue={merchant?.address_line1 ?? ''}
              placeholder="Straatnaam en huisnummer"
            />
            <Input
              label="Adresregel 2"
              name="address_line2"
              defaultValue={merchant?.address_line2 ?? ''}
              placeholder="Toevoeging (optioneel)"
            />
          </div>

          <Input
            label="Postcode"
            name="postal_code"
            defaultValue={merchant?.postal_code ?? ''}
            placeholder="1234 AB"
          />
        </div>
      </div>

      {/* ── Feedback + submit ── */}
      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {success && (
        <div className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
          Profiel opgeslagen!
        </div>
      )}

      <Button type="submit" variant="primary" loading={loading} className="w-full">
        Opslaan
      </Button>
    </form>
  )
}
