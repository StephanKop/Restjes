'use client'

import { useState } from 'react'
import { updateMerchant } from '@/actions/merchants'

interface EditMerchantFormProps {
  merchantId: string
  currentData: {
    business_name: string
    description: string
    city: string
    phone: string
    website: string
    address_line1: string
    postal_code: string
  }
}

export function EditMerchantForm({ merchantId, currentData }: EditMerchantFormProps) {
  const [editing, setEditing] = useState(false)
  const [data, setData] = useState(currentData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(field: keyof typeof data, value: string) {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setLoading(true)
    setError(null)
    const result = await updateMerchant(merchantId, {
      business_name: data.business_name,
      description: data.description || undefined,
      city: data.city || undefined,
      phone: data.phone || undefined,
      website: data.website || undefined,
      address_line1: data.address_line1 || undefined,
      postal_code: data.postal_code || undefined,
    })
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setEditing(false)
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="w-full rounded-lg border border-warm-200 px-4 py-2 text-sm font-medium text-warm-600 transition-colors hover:bg-warm-50"
      >
        Bedrijfsgegevens bewerken
      </button>
    )
  }

  const fields: { key: keyof typeof data; label: string }[] = [
    { key: 'business_name', label: 'Bedrijfsnaam' },
    { key: 'description', label: 'Beschrijving' },
    { key: 'address_line1', label: 'Adres' },
    { key: 'postal_code', label: 'Postcode' },
    { key: 'city', label: 'Stad' },
    { key: 'phone', label: 'Telefoon' },
    { key: 'website', label: 'Website' },
  ]

  return (
    <div className="space-y-3 border-t border-warm-100 pt-4">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="mb-1 block text-xs font-medium text-warm-500">{field.label}</label>
          {field.key === 'description' ? (
            <textarea
              value={data[field.key]}
              onChange={(e) => update(field.key, e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-warm-200 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
            />
          ) : (
            <input
              value={data[field.key]}
              onChange={(e) => update(field.key, e.target.value)}
              className="w-full rounded-lg border border-warm-200 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
            />
          )}
        </div>
      ))}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
        >
          {loading ? 'Opslaan...' : 'Opslaan'}
        </button>
        <button
          onClick={() => { setEditing(false); setData(currentData) }}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-warm-500 hover:bg-warm-50"
        >
          Annuleren
        </button>
      </div>
    </div>
  )
}
