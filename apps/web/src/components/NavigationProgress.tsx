'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function NavigationProgress() {
  const pathname = usePathname() ?? ''
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    cleanup()
    setVisible(true)
    setProgress(0)

    let p = 0
    const tick = () => {
      p += (90 - p) * 0.08
      setProgress(p)
      intervalRef.current = setTimeout(tick, 150)
    }
    intervalRef.current = setTimeout(tick, 50)
  }, [cleanup])

  const done = useCallback(() => {
    cleanup()
    setProgress(100)
    const hide = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 250)
    return () => clearTimeout(hide)
  }, [cleanup])

  // Route change completed → finish the bar
  useEffect(() => {
    const cleanupDone = done()
    return cleanupDone
  }, [pathname, searchParams, done])

  // Intercept link clicks to start the bar immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href || !href.startsWith('/')) return
      if (anchor.target === '_blank') return

      // Don't trigger for the current page
      const url = new URL(href, window.location.origin)
      if (url.pathname === pathname && url.search === window.location.search) return

      start()
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [pathname, start])

  if (!visible) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
    >
      <div
        className="h-full bg-brand-500 transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
