'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'

interface FilterSelectProps {
  paramName: string
  options: { value: string; label: string }[]
  defaultLabel?: string
}

export function FilterSelect({ paramName, options, defaultLabel = 'Alle' }: FilterSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(paramName, value)
    } else {
      params.delete(paramName)
    }
    params.delete('page')
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <select
      value={searchParams.get(paramName) ?? ''}
      onChange={(e) => handleChange(e.target.value)}
      className={`rounded-lg border border-warm-200 bg-white px-3 py-2 text-sm text-warm-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${isPending ? 'opacity-70' : ''}`}
    >
      <option value="">{defaultLabel}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
