import type { Locale } from '@kliekjesclub/i18n'

type Props = {
  locale: Locale
  className?: string
  title?: string
}

export function FlagIcon({ locale, className = 'h-4 w-6', title }: Props) {
  if (locale === 'nl') {
    return (
      <svg viewBox="0 0 9 6" className={className} aria-hidden={!title} role={title ? 'img' : undefined}>
        {title && <title>{title}</title>}
        <rect width="9" height="2" fill="#AE1C28" />
        <rect y="2" width="9" height="2" fill="#FFFFFF" />
        <rect y="4" width="9" height="2" fill="#21468B" />
      </svg>
    )
  }

  // en — Union Jack (simplified, symmetric)
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden={!title} role={title ? 'img' : undefined}>
      {title && <title>{title}</title>}
      <rect width="60" height="40" fill="#012169" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="3" />
      <path d="M30,0 V40 M0,20 H60" stroke="#FFFFFF" strokeWidth="12" />
      <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  )
}
