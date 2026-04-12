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

    // Observe on initial render and after DOM updates
    observe()

    // Watch for new elements added to the DOM (e.g. after navigation)
    const mo = new MutationObserver(() => observe())
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])

  return null
}
