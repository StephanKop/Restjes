'use client'

import { useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { locales, localeMeta, type Locale } from '@kliekjesclub/i18n'
import { setLocaleAction } from '@/i18n/actions'
import { FlagIcon } from './FlagIcon'

export function LanguageSwitcher({ className }: { className?: string }) {
  const current = useLocale() as Locale
  const t = useTranslations('common.language')
  const router = useRouter()
  const pathname = usePathname() ?? '/'
  const [isPending, startTransition] = useTransition()

  return (
    <label className={className ?? 'inline-flex items-center gap-2 text-sm text-warm-600'}>
      <span className="sr-only">{t('selectLanguage')}</span>
      <span className="inline-flex items-center gap-2 rounded-lg border border-warm-200 bg-white px-2.5 py-1.5 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
        <FlagIcon locale={current} className="h-3.5 w-5 rounded-[2px]" />
        <select
          aria-label={t('selectLanguage')}
          disabled={isPending}
          value={current}
          onChange={(e) => {
            const next = e.target.value as Locale
            if (next === current) return
            startTransition(() => {
              // Persist preference (cookie + DB profile) for cross-device consistency.
              setLocaleAction(next)
              // Navigate to the same path under the new locale prefix.
              router.replace(pathname, { locale: next })
            })
          }}
          className="appearance-none bg-transparent text-sm font-semibold text-warm-700 focus:outline-none disabled:opacity-60"
        >
          {locales.map((loc) => (
            <option key={loc} value={loc}>
              {localeMeta[loc].name}
            </option>
          ))}
        </select>
      </span>
    </label>
  )
}
