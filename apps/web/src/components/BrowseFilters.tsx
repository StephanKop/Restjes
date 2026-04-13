'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { ALL_ALLERGENS, allergenLabel } from '@/lib/format'
import { MapPinIcon } from '@/components/icons'


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
  const frozen = searchParams.get('frozen') === '1'
  const fresh = searchParams.get('fresh') === '1'
  const excludedAllergens = searchParams.get('allergens')?.split(',').filter(Boolean) ?? []
  const hasLocation = searchParams.has('lat') && searchParams.has('lng')
  const currentRadius = searchParams.get('radius') ?? '5'

  const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '')
  const [sliderValue, setSliderValue] = useState(Number(currentRadius))
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
              <span className="flex items-center gap-1.5 text-sm font-medium text-brand-700"><MapPinIcon className="h-4 w-4" /> Mijn locatie</span>
              <button
                type="button"
                onClick={clearLocation}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Wissen
              </button>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-warm-500">Straal</span>
                <span className="rounded-lg bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">{sliderValue} km</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={sliderValue}
                onChange={(e) => {
                  const km = Number(e.target.value)
                  setSliderValue(km)
                  updateParams({ radius: String(km) })
                }}
                className="radius-slider w-full"
              />
              <div className="mt-1.5 flex justify-between px-0.5 text-[10px] text-warm-400">
                <span>1 km</span>
                <span>50 km</span>
              </div>
              <style>{`
                .radius-slider {
                  -webkit-appearance: none;
                  appearance: none;
                  height: 6px;
                  border-radius: 999px;
                  background: linear-gradient(
                    to right,
                    var(--color-brand-500) 0%,
                    var(--color-brand-500) ${((sliderValue - 1) / 49) * 100}%,
                    var(--color-warm-200) ${((sliderValue - 1) / 49) * 100}%,
                    var(--color-warm-200) 100%
                  );
                  cursor: pointer;
                }
                .radius-slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: white;
                  border: 3px solid var(--color-brand-500);
                  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
                  transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .radius-slider::-webkit-slider-thumb:hover {
                  transform: scale(1.15);
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                }
                .radius-slider::-webkit-slider-thumb:active {
                  transform: scale(1.05);
                  background: var(--color-brand-50);
                }
                .radius-slider::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: white;
                  border: 3px solid var(--color-brand-500);
                  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
                  cursor: pointer;
                }
                .radius-slider::-moz-range-track {
                  height: 6px;
                  border-radius: 999px;
                  background: var(--color-warm-200);
                }
                .radius-slider::-moz-range-progress {
                  height: 6px;
                  border-radius: 999px;
                  background: var(--color-brand-500);
                }
                .radius-slider:focus-visible {
                  outline: 2px solid var(--color-brand-300);
                  outline-offset: 4px;
                  border-radius: 999px;
                }
              `}</style>
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
              {locating ? 'Locatie ophalen...' : <><MapPinIcon className="inline h-4 w-4" /> Gebruik mijn locatie</>}
            </button>
            {locationError && (
              <p className="mt-2 text-xs text-red-600">{locationError}</p>
            )}
          </div>
        )}
      </div>

      {/* City search */}
      {!hasLocation && (
        <CitySearch
          currentCity={searchParams.get('city') ?? userCity ?? null}
          onSelect={(city) => updateParams({ city: city || null })}
          onClear={() => updateParams({ city: 'alle' })}
        />
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

      {/* Frozen / Fresh */}
      <div>
        <p className="mb-2 text-sm font-semibold text-warm-700">Bewaring</p>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-warm-50">
            <input
              type="checkbox"
              checked={fresh}
              onChange={() => updateParams({ fresh: fresh ? null : '1' })}
              className="h-4 w-4 rounded border-warm-300 text-brand-500 focus:ring-brand-400"
            />
            <span className={fresh ? 'font-semibold text-warm-800' : 'text-warm-600'}>
              Vers
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-warm-50">
            <input
              type="checkbox"
              checked={frozen}
              onChange={() => updateParams({ frozen: frozen ? null : '1' })}
              className="h-4 w-4 rounded border-warm-300 text-brand-500 focus:ring-brand-400"
            />
            <span className={frozen ? 'font-semibold text-warm-800' : 'text-warm-600'}>
              Ingevroren
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

function CitySearch({
  currentCity,
  onSelect,
  onClear,
}: {
  currentCity: string | null
  onSelect: (city: string) => void
  onClear: () => void
}) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{ description: string; place_id: string }[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleInputChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/places-autocomplete?input=${encodeURIComponent(value.trim())}`,
        )
        if (!res.ok) return
        const data = await res.json()
        setSuggestions(data.predictions ?? [])
        setOpen(true)
      } catch {
        // Ignore
      }
    }, 300)
  }

  function handleSelect(suggestion: { description: string }) {
    // Extract city name (first part before comma)
    const city = suggestion.description.split(',')[0].trim()
    setQuery('')
    setSuggestions([])
    setOpen(false)
    onSelect(city)
  }

  const showingCity = currentCity && currentCity !== 'alle'

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-warm-700">Stad</p>

      {showingCity && (
        <div className="mb-2 flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2.5">
          <span className="flex items-center gap-1.5 text-sm font-medium text-brand-700">
            <MapPinIcon className="h-4 w-4" /> {currentCity}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Wissen
          </button>
        </div>
      )}

      <div ref={containerRef} className="relative">
        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={showingCity ? 'Andere stad zoeken...' : 'Zoek op stad...'}
            className="w-full rounded-xl border border-warm-200 bg-white py-2.5 pl-9 pr-4 text-sm text-warm-800 placeholder:text-warm-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {open && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-warm-100 bg-white shadow-lg">
            {suggestions.map((s) => (
              <button
                key={s.place_id}
                type="button"
                onClick={() => handleSelect(s)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-warm-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                <MapPinIcon className="h-4 w-4 flex-shrink-0 text-warm-400" />
                {s.description}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
