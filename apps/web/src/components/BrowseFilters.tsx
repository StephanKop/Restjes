'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { ALL_ALLERGENS, allergenLabel } from '@/lib/format'

export function BrowseFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const q = searchParams.get('q') ?? ''
  const vegetarian = searchParams.get('vegetarian') === '1'
  const vegan = searchParams.get('vegan') === '1'
  const excludedAllergens = searchParams.get('allergens')?.split(',').filter(Boolean) ?? []

  const [searchValue, setSearchValue] = useState(q)
  const [showAllergens, setShowAllergens] = useState(excludedAllergens.length > 0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      const qs = params.toString()
      startTransition(() => {
        router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
      })
    },
    [searchParams, pathname, router],
  )

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (searchValue !== q) {
        updateParams({ q: searchValue || null })
      }
    }, 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchValue, q, updateParams])

  function toggleAllergen(allergen: string) {
    const current = new Set(excludedAllergens)
    if (current.has(allergen)) {
      current.delete(allergen)
    } else {
      current.add(allergen)
    }
    const value = Array.from(current).join(',')
    updateParams({ allergens: value || null })
  }

  return (
    <div className="mb-8 space-y-4">
      {/* Search bar */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Zoek op gerecht of aanbieder..."
          className="flex-1 rounded-xl border border-warm-200 bg-white px-4 py-3 text-warm-800 placeholder:text-warm-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {/* Toggle pills */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateParams({ vegetarian: vegetarian ? null : '1' })}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            vegetarian
              ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-300'
              : 'bg-cream text-warm-600 hover:bg-warm-100'
          }`}
        >
          Vegetarisch
        </button>
        <button
          type="button"
          onClick={() => updateParams({ vegan: vegan ? null : '1' })}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            vegan
              ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-300'
              : 'bg-cream text-warm-600 hover:bg-warm-100'
          }`}
        >
          Veganistisch
        </button>
        <button
          type="button"
          onClick={() => setShowAllergens((prev) => !prev)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            excludedAllergens.length > 0
              ? 'bg-red-50 text-red-700 ring-1 ring-red-300'
              : 'bg-cream text-warm-600 hover:bg-warm-100'
          }`}
        >
          Allergenen uitsluiten
          {excludedAllergens.length > 0 && ` (${excludedAllergens.length})`}
        </button>
      </div>

      {/* Allergen checkboxes */}
      {showAllergens && (
        <div className="rounded-2xl border border-warm-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-warm-700">
            Sluit gerechten uit die deze allergenen bevatten:
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {ALL_ALLERGENS.map((allergen) => {
              const checked = excludedAllergens.includes(allergen)
              return (
                <label
                  key={allergen}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                    checked ? 'bg-red-50 text-red-700' : 'hover:bg-warm-50 text-warm-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAllergen(allergen)}
                    className="h-4 w-4 rounded border-warm-300 text-brand-500 focus:ring-brand-400"
                  />
                  {allergenLabel(allergen)}
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
