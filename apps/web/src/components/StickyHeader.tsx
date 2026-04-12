'use client'

import { useEffect, useState } from 'react'

interface StickyHeaderProps {
  children: React.ReactNode
  transparent?: boolean
}

export function StickyHeader({ children, transparent = false }: StickyHeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!transparent) return
    const handleScroll = () => setScrolled(window.scrollY > 10)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [transparent])

  const isTransparent = transparent && !scrolled

  return (
    <header
      data-scrolled={isTransparent ? undefined : ''}
      className={`group/header sticky top-0 z-50 transition-all duration-300 ${
        isTransparent
          ? 'border-b border-transparent bg-transparent text-white'
          : 'border-b border-warm-100 bg-white/80 backdrop-blur-sm text-warm-600'
      }`}
    >
      {children}
    </header>
  )
}
