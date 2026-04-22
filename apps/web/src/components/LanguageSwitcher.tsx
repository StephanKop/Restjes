'use client'

import { useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { locales, localeMeta, type Locale } from '@kliekjesclub/i18n'
import { setLocaleAction } from '@/i18n/actions'

export function LanguageSwitcher({ className }: { className?: string }) {
  const current = useLocale() as Locale
  const t = useTranslations('common.language')
  const [isPending, startTransition] = useTransition()

  return (
    <label className={className ?? 'inline-flex items-center gap-2 text-sm text-warm-600'}>
      <span className="sr-only">{t('selectLanguage')}</span>
      <select
        aria-label={t('selectLanguage')}
        disabled={isPending}
        value={current}
        onChange={(e) => {
          const next = e.target.value
          startTransition(() => {
            setLocaleAction(next)
          })
        }}
        className="rounded-lg border border-warm-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-warm-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-60"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeMeta[loc].flag} {localeMeta[loc].name}
          </option>
        ))}
      </select>
    </label>
  )
}
