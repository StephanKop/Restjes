'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { ALL_ALLERGENS, allergenLabel } from '@/lib/format'

const RADIUS_OPTIONS = [1, 2, 5, 10, 25, 50]

interface BrowseFiltersProps {
  userCity?: string
}

export function BrowseFilters({ userCity }: BrowseFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const vegetarian = searchParams.get('vegetarian') === '1'
  const vegan = searchParams.get('vegan') === '1'
  const excludedAllergens = searchParams.get('allergens')?.split(',').filter(Boolean) ?? []
  const hasLocation = searchParams.has('lat') && searchParams.has('lng')
  const currentRadius = searchParams.get('radius') ?? '5'

  const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '')
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParamsRef.current.toString())
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
    [pathname, router],
  )

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateParams({ q: searchValue || null })
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // Only re-run when the user types, not when URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationError('Locatie wordt niet ondersteund door je browser.')
      return
    }

    setLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        updateParams({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          radius: currentRadius,
          // Clear city filter when using location
          city: 'alle',
        })
      },
      (err) => {
        setLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Locatietoegang geweigerd. Sta dit toe in je browser.')
        } else {
          setLocationError('Kon je locatie niet bepalen.')
        }
      },
      { enableHighAccuracy: false, timeout: 10000 },
    )
  }

  function clearLocation() {
    updateParams({ lat: null, lng: null, radius: null })
  }

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
    <aside className="space-y-6">
      {/* Search */}
      <div>
        <label htmlFor="browse-search" className="mb-2 block text-sm font-semibold text-warm-700">
          Zoeken
        </label>
        <input
          id="browse-search"
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Gerecht of aanbieder..."
          className="w-full rounded-xl border border-warm-200 bg-white px-4 py-2.5 text-sm text-warm-800 placeholder:text-warm-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {/* Location / Distance */}
      <div>
        <p className="mb-2 text-sm font-semibold text-warm-700">Afstand</p>
        {hasLocation ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2.5">
              <span className="text-sm font-medium text-brand-700">📍 Mijn locatie</span>
              <button
                type="button"
                onClick={clearLocation}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Wissen
              </button>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="radius-slider" className="text-xs text-warm-500">Straal</label>
                <span className="text-xs font-semibold text-warm-700">{currentRadius} km</span>
              </div>
              <input
                id="radius-slider"
                type="range"
                min={0}
                max={RADIUS_OPTIONS.length - 1}
                step={1}
                value={RADIUS_OPTIONS.indexOf(Number(currentRadius))}
                onChange={(e) => {
                  const km = RADIUS_OPTIONS[Number(e.target.value)]
                  updateParams({ radius: String(km) })
                }}
                className="w-full accent-brand-500"
              />
              <div className="mt-1 flex justify-between text-[10px] text-warm-400">
                {RADIUS_OPTIONS.map((km) => (
                  <span key={km}>{km}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={requestLocation}
              disabled={locating}
              className="w-full rounded-xl border border-warm-200 px-3 py-2.5 text-sm font-medium text-warm-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
            >
              {locating ? 'Locatie ophalen...' : '📍 Gebruik mijn locatie'}
            </button>
            {locationError && (
              <p className="mt-2 text-xs text-red-600">{locationError}</p>
            )}
          </div>
        )}
      </div>

      {/* City (only if not using geolocation) */}
      {!hasLocation && userCity && (
        <div>
          <p className="mb-2 text-sm font-semibold text-warm-700">Stad</p>
          <div className="flex items-center justify-between rounded-xl bg-warm-50 px-3 py-2.5">
            <span className="text-sm text-warm-600">📍 {userCity}</span>
            <button
              type="button"
              onClick={() => updateParams({ city: 'alle' })}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Wissen
            </button>
          </div>
        </div>
      )}

      {/* Diet */}
      <div>
        <p className="mb-2 text-sm font-semibold text-warm-700">Dieet</p>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-warm-50">
            <input
              type="checkbox"
              checked={vegetarian}
              onChange={() => updateParams({ vegetarian: vegetarian ? null : '1' })}
              className="h-4 w-4 rounded border-warm-300 text-brand-500 focus:ring-brand-400"
            />
            <span className={vegetarian ? 'font-semibold text-warm-800' : 'text-warm-600'}>
              Vegetarisch
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-warm-50">
            <input
              type="checkbox"
              checked={vegan}
              onChange={() => updateParams({ vegan: vegan ? null : '1' })}
              className="h-4 w-4 rounded border-warm-300 text-brand-500 focus:ring-brand-400"
            />
            <span className={vegan ? 'font-semibold text-warm-800' : 'text-warm-600'}>
              Veganistisch
            </span>
          </label>
        </div>
      </div>

      {/* Allergens */}
      <div>
        <p className="mb-2 text-sm font-semibold text-warm-700">
          Allergenen uitsluiten
          {excludedAllergens.length > 0 && (
            <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 text-[10px] font-bold text-red-700">
              {excludedAllergens.length}
            </span>
          )}
        </p>
        <div className="space-y-1">
          {ALL_ALLERGENS.map((allergen) => {
            const checked = excludedAllergens.includes(allergen)
            return (
              <label
                key={allergen}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-1.5 text-sm transition-colors ${
                  checked ? 'bg-red-50 text-red-700' : 'hover:bg-warm-50 text-warm-600'
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
    </aside>
  )
}
