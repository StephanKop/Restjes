'use client'

import { useState } from 'react'
import { updateDish } from '@/actions/dishes'

interface EditDishFormProps {
  dishId: string
  currentData: {
    title: string
    description: string
    quantity_available: number
    is_vegetarian: boolean
    is_vegan: boolean
    bring_own_container: boolean
  }
}

export function EditDishForm({ dishId, currentData }: EditDishFormProps) {
  const [editing, setEditing] = useState(false)
  const [data, setData] = useState(currentData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setLoading(true)
    setError(null)
    const result = await updateDish(dishId, {
      title: data.title,
      description: data.description || undefined,
      quantity_available: data.quantity_available,
      is_vegetarian: data.is_vegetarian,
      is_vegan: data.is_vegan,
      bring_own_container: data.bring_own_container,
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
        Gerecht bewerken
      </button>
    )
  }

  return (
    <div className="space-y-3 border-t border-warm-100 pt-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-warm-500">Titel</label>
        <input
          value={data.title}
          onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))}
          className="w-full rounded-lg border border-warm-200 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-warm-500">Beschrijving</label>
        <textarea
          value={data.description}
          onChange={(e) => setData((d) => ({ ...d, description: e.target.value }))}
          rows={3}
          className="w-full rounded-lg border border-warm-200 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-warm-500">Aantal beschikbaar</label>
        <input
          type="number"
          min={0}
          value={data.quantity_available}
          onChange={(e) => setData((d) => ({ ...d, quantity_available: parseInt(e.target.value, 10) || 0 }))}
          className="w-full rounded-lg border border-warm-200 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-warm-700">
          <input
            type="checkbox"
            checked={data.is_vegetarian}
            onChange={(e) => setData((d) => ({ ...d, is_vegetarian: e.target.checked }))}
            className="rounded"
          />
          Vegetarisch
        </label>
        <label className="flex items-center gap-2 text-sm text-warm-700">
          <input
            type="checkbox"
            checked={data.is_vegan}
            onChange={(e) => setData((d) => ({ ...d, is_vegan: e.target.checked }))}
            className="rounded"
          />
          Vegan
        </label>
        <label className="flex items-center gap-2 text-sm text-warm-700">
          <input
            type="checkbox"
            checked={data.bring_own_container}
            onChange={(e) => setData((d) => ({ ...d, bring_own_container: e.target.checked }))}
            className="rounded"
          />
          Eigen container meenemen
        </label>
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
          onClick={() => { setEditing(false); setData(currentData) }}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-warm-500 hover:bg-warm-50"
        >
          Annuleren
        </button>
      </div>
    </div>
  )
}
