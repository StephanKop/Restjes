'use client'

import { useState } from 'react'
import { updateProfile } from '@/actions/users'

interface EditProfileFormProps {
  userId: string
  currentName: string
  currentCity: string
  currentPhone: string
}

export function EditProfileForm({ userId, currentName, currentCity, currentPhone }: EditProfileFormProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(currentName)
  const [city, setCity] = useState(currentCity)
  const [phone, setPhone] = useState(currentPhone)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setLoading(true)
    setError(null)
    const result = await updateProfile(userId, {
      display_name: name,
      city: city || undefined,
      phone: phone || undefined,
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
        Profiel bewerken
      </button>
    )
  }

  return (
    <div className="space-y-3 border-t border-warm-100 pt-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-warm-500">Naam</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-warm-200 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-warm-500">Stad</label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-lg border border-warm-200 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-warm-500">Telefoon</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-warm-200 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
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
          onClick={() => setEditing(false)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-warm-500 hover:bg-warm-50"
        >
          Annuleren
        </button>
      </div>
    </div>
  )
}
