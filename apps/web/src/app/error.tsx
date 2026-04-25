'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6">
      <div className="mx-auto max-w-md text-center">
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-600">Oeps</p>
        <h1 className="mb-3 text-3xl font-extrabold text-warm-900">Er ging iets mis</h1>
        <p className="mb-8 text-warm-500">
          Onze excuses — er is een onverwachte fout opgetreden. Probeer het opnieuw.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center rounded-xl bg-brand-500 px-5 py-3 font-bold text-white transition-colors hover:bg-brand-600"
          >
            Probeer opnieuw
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-warm-200 bg-white px-5 py-3 font-bold text-warm-800 transition-colors hover:border-warm-300"
          >
            Naar de homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
