'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  to: number
  /** Total animation duration in ms. */
  duration?: number
  /** Decimal places to render. */
  decimals?: number
  /** Locale used for number formatting. Defaults to nl-NL. */
  locale?: string
  prefix?: string
  suffix?: string
}

/**
 * Animates a number from 0 to `to` once it scrolls into view, then stops.
 * Respects `prefers-reduced-motion` (renders the final number immediately).
 */
export function CountUp({
  to,
  duration = 1600,
  decimals = 0,
  locale = 'nl-NL',
  prefix = '',
  suffix = '',
}: CountUpProps) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting || startedRef.current) return
        startedRef.current = true
        io.disconnect()
        if (reduced) {
          setValue(to)
          return
        }
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          // ease-out cubic
          const eased = 1 - Math.pow(1 - t, 3)
          setValue(to * eased)
          if (t < 1) requestAnimationFrame(tick)
          else setValue(to)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )

    io.observe(node)
    return () => io.disconnect()
  }, [to, duration])

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)

  return (
    <span ref={ref}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
