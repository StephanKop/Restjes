'use client'

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// Wrapper adds a Suspense boundary required by Next.js because
// useSearchParams() inside the inner component triggers CSR bailout
// during static prerender (e.g. on the 404 page).
export function ScrollReveal() {
  return (
    <Suspense fallback={null}>
      <ScrollRevealInner />
    </Suspense>
  )
}

function ScrollRevealInner() {
  const pathname = usePathname() ?? ''
  // usePathname alone ignores query strings — include the search params so
  // tab-style navigation (same pathname, different ?tab=) also re-observes.
  const search = (useSearchParams() ?? new URLSearchParams()).toString()

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' },
    )

    function observe() {
      const elements = document.querySelectorAll('[data-reveal]:not(.revealed)')
      for (const el of elements) {
        io.observe(el)
      }
    }

    // Observe on initial render.
    observe()

    // Re-observe anything streamed in after initial paint. Keep this running
    // for the full lifetime of the route — disconnecting it early meant late
    // route transitions on the same pathname left new cards stuck at opacity 0.
    const mo = new MutationObserver(() => observe())
    mo.observe(document.body, { childList: true, subtree: true })

    // Failsafe: if anything is still un-revealed 1500ms after mount (e.g. the
    // IntersectionObserver missed it because the element entered and exited
    // viewport during a streamed render), force-reveal it. Content must never
    // remain invisible.
    const failsafe = setTimeout(() => {
      document
        .querySelectorAll('[data-reveal]:not(.revealed)')
        .forEach((el) => el.classList.add('revealed'))
    }, 1500)

    return () => {
      clearTimeout(failsafe)
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname, search])

  return null
}
