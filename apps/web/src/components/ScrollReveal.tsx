'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollReveal() {
  const pathname = usePathname()

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

    // Observe on initial render
    observe()

    // Re-observe after Suspense/streaming resolves new content.
    // Use a short-lived MutationObserver instead of a permanent one.
    const mo = new MutationObserver(() => observe())
    mo.observe(document.body, { childList: true, subtree: true })

    // Disconnect the MutationObserver after 3 seconds — by then all
    // streamed content has resolved. The IntersectionObserver keeps running.
    const timer = setTimeout(() => mo.disconnect(), 3000)

    return () => {
      clearTimeout(timer)
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])

  return null
}
