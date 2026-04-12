'use client'

import { useState } from 'react'
import { toggleMerchantVerification } from '@/actions/merchants'

interface VerifyToggleProps {
  merchantId: string
  isVerified: boolean
}

export function VerifyToggle({ merchantId, isVerified }: VerifyToggleProps) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    await toggleMerchantVerification(merchantId, !isVerified)
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
        isVerified
          ? 'border border-warm-200 text-warm-600 hover:bg-warm-50'
          : 'bg-brand-500 text-white hover:bg-brand-600'
      }`}
    >
      {loading
        ? 'Bezig...'
        : isVerified
          ? 'Verificatie intrekken'
          : 'Verifieer aanbieder'}
    </button>
  )
}
