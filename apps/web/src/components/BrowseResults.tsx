'use client'

import { useState, lazy, Suspense } from 'react'
import { DishCard, type DishCardData } from '@/components/DishCard'
import { DishListItem } from '@/components/DishListItem'
import { DishIcon, MapPinIcon } from '@/components/icons'

const DishMap = lazy(() => import('@/components/DishMapLazy'))

type ViewMode = 'grid' | 'list' | 'map'

interface BrowseResultsProps {
  dishes: DishCardData[]
}

export function BrowseResults({ dishes }: BrowseResultsProps) {
  const [view, setView] = useState<ViewMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 'list' : 'grid'
  )

  if (dishes.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-card">
        <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-100 text-warm-400">
          <DishIcon className="h-7 w-7" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-warm-900">
          Geen gerechten gevonden
        </h2>
        <p className="text-warm-500">
          Probeer andere filters of zoekterm.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-warm-500">
          {dishes.length} {dishes.length === 1 ? 'gerecht' : 'gerechten'}
        </p>
        <div className="flex rounded-xl border border-warm-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={`rounded-lg p-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 active:scale-90 ${
              view === 'grid'
                ? 'bg-brand-50 text-brand-600'
                : 'text-warm-400 hover:text-warm-600 hover:bg-warm-50'
            }`}
            aria-label="Rasterweergave"
            title="Rasterweergave"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`rounded-lg p-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 active:scale-90 ${
              view === 'list'
                ? 'bg-brand-50 text-brand-600'
                : 'text-warm-400 hover:text-warm-600 hover:bg-warm-50'
            }`}
            aria-label="Lijstweergave"
            title="Lijstweergave"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M2 3.75A.75.75 0 0 1 2.75 3h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75Zm0 4.167a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Zm0 4.166a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Zm0 4.167a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setView('map')}
            className={`rounded-lg p-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 active:scale-90 ${
              view === 'map'
                ? 'bg-brand-50 text-brand-600'
                : 'text-warm-400 hover:text-warm-600 hover:bg-warm-50'
            }`}
            aria-label="Kaartweergave"
            title="Kaartweergave"
          >
            <MapPinIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results */}
      {view === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
          {dishes.map((dish) => (
            <div key={dish.id} data-reveal="scale">
              <DishCard dish={dish} />
            </div>
          ))}
        </div>
      ) : view === 'list' ? (
        <div className="space-y-3" data-reveal-stagger>
          {dishes.map((dish) => (
            <div key={dish.id} data-reveal>
              <DishListItem dish={dish} />
            </div>
          ))}
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="flex h-[500px] items-center justify-center rounded-2xl bg-white shadow-card">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          }
        >
          <DishMap dishes={dishes} />
        </Suspense>
      )}
    </div>
  )
}
