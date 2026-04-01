'use client'

import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Image from 'next/image'

interface MerchantProfile {
  id: string
  profile_id: string
  description: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  postal_code: string | null
  phone: string | null
  website: string | null
  logo_url: string | null
}

interface MerchantSettingsFormProps {
  merchant: MerchantProfile | null
  userId: string
  displayName: string
}

export function MerchantSettingsForm({ merchant, userId, displayName }: MerchantSettingsFormProps) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(merchant?.logo_url ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData(e.currentTarget)

      let logoUrl = merchant?.logo_url ?? null

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop()
        const filePath = `${userId}/logo.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('merchant-assets')
          .upload(filePath, logoFile, { upsert: true })

        if (uploadError) {
          throw new Error(`Logo upload mislukt: ${uploadError.message}`)
        }

        const { data: publicUrlData } = supabase.storage
          .from('merchant-assets')
          .getPublicUrl(filePath)

        logoUrl = publicUrlData.publicUrl
      }

      const merchantData = {
        profile_id: userId,
        business_name: displayName || 'Aanbieder',
        description: (formData.get('description') as string) || null,
        address_line1: (formData.get('address_line1') as string) || null,
        address_line2: (formData.get('address_line2') as string) || null,
        city: (formData.get('city') as string) || null,
        postal_code: (formData.get('postal_code') as string) || null,
        phone: (formData.get('phone') as string) || null,
        website: (formData.get('website') as string) || null,
        logo_url: logoUrl,
      }

      if (merchant) {
        const { error: updateError } = await supabase
          .from('merchants')
          .update(merchantData)
          .eq('id', merchant.id)

        if (updateError) throw new Error(updateError.message)
      } else {
        const { error: insertError } = await supabase
          .from('merchants')
          .insert(merchantData)

        if (insertError) throw new Error(insertError.message)
      }

      setSuccess(true)

      if (!merchant) {
        router.push('/aanbieder/dishes')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo upload */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-warm-800">Profielfoto</label>
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <Image
              src={logoPreview}
              alt="Logo preview"
              width={80}
              height={80}
              className="rounded-xl object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-warm-100">
              <span className="text-3xl">📸</span>
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-cream px-4 py-2 text-sm font-semibold text-warm-700 transition-colors hover:bg-warm-100"
            >
              Afbeelding kiezen
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <p className="mt-1 text-xs text-warm-400">JPG, PNG of WebP. Max 2MB.</p>
          </div>
        </div>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Postcode"
          name="postal_code"
          defaultValue={merchant?.postal_code ?? ''}
          placeholder="1234 AB"
        />
        <Input
          label="Plaats"
          name="city"
          defaultValue={merchant?.city ?? ''}
          placeholder="Amsterdam"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Telefoonnummer"
          name="phone"
          type="tel"
          defaultValue={merchant?.phone ?? ''}
          placeholder="06-12345678"
        />
        <Input
          label="Website"
          name="website"
          type="url"
          defaultValue={merchant?.website ?? ''}
          placeholder="https://www.voorbeeld.nl"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {success && (
        <div className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
          Profiel bijgewerkt!
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        {merchant ? 'Opslaan' : 'Profiel aanmaken'}
      </Button>
    </form>
  )
}
