'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { DishCardData } from '@/components/DishCard'
import { formatPickupTime } from '@/lib/format'

interface DishMapProps {
  dishes: DishCardData[]
}

const MAPS_SCRIPT_ID = 'google-maps-script'
const DEFAULT_CENTER = { lat: 52.37, lng: 4.9 } // Amsterdam
const DEFAULT_ZOOM = 12

function loadGoogleMaps(): Promise<void> {
  if (window.google?.maps) return Promise.resolve()
  if (document.getElementById(MAPS_SCRIPT_ID)) {
    return new Promise((resolve) => {
      const check = () => {
        if (window.google?.maps) resolve()
        else setTimeout(check, 100)
      }
      check()
    })
  }

  return new Promise((resolve, reject) => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!key) {
      reject(new Error('Google Maps API key not configured'))
      return
    }
    const script = document.createElement('script')
    script.id = MAPS_SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
}

export function DishMap({ dishes }: DishMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const mappableDishes = dishes.filter(
    (d) => d.merchant.latitude != null && d.merchant.longitude != null,
  )

  const initMap = useCallback(async () => {
    if (!mapRef.current) return

    try {
      await loadGoogleMaps()

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
        })
        infoWindowRef.current = new google.maps.InfoWindow()
      }

      const map = mapInstanceRef.current
      const infoWindow = infoWindowRef.current!

      // Clear old markers
      for (const m of markersRef.current) m.setMap(null)
      markersRef.current = []

      if (mappableDishes.length === 0) {
        setLoading(false)
        return
      }

      const bounds = new google.maps.LatLngBounds()

      for (const dish of mappableDishes) {
        const position = {
          lat: dish.merchant.latitude!,
          lng: dish.merchant.longitude!,
        }

        const marker = new google.maps.Marker({
          map,
          position,
          title: dish.title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#16a34a',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        })

        marker.addListener('click', () => {
          const pickup = formatPickupTime(dish.pickup_start, dish.pickup_end)
          infoWindow.setContent(`
            <div style="font-family: inherit; max-width: 220px;">
              <a href="/gerecht/${dish.id}" style="text-decoration: none; color: inherit;">
                <p style="margin: 0 0 4px; font-weight: 700; font-size: 14px; color: #1c1917;">
                  ${dish.title}
                </p>
                <p style="margin: 0 0 4px; font-size: 12px; color: #78716c;">
                  ${dish.merchant.business_name} &middot; ${dish.merchant.city}
                </p>
                <p style="margin: 0 0 6px; font-size: 12px; color: #57534e;">
                  ${pickup}
                </p>
                <p style="margin: 0; font-size: 12px; font-weight: 600; color: #16a34a;">
                  Nog ${dish.quantity_available} beschikbaar &rarr;
                </p>
              </a>
            </div>
          `)
          infoWindow.open({ anchor: marker, map })
        })

        markersRef.current.push(marker)
        bounds.extend(position)
      }

      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 })

      // Don't zoom in too far for a single marker
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom()! > 15) map.setZoom(15)
        google.maps.event.removeListener(listener)
      })

      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaart kon niet geladen worden')
      setLoading(false)
    }
  }, [mappableDishes])

  useEffect(() => {
    initMap()
  }, [initMap])

  if (error) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-2xl bg-warm-50 text-sm text-warm-500">
        {error}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-card">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      )}
      <div ref={mapRef} className="h-[500px] w-full" />
      {!loading && mappableDishes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-warm-500">
          Geen gerechten met locatie gevonden
        </div>
      )}
    </div>
  )
}
