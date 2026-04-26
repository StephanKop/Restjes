import Svg, { Rect, Path } from 'react-native-svg'
import type { Locale } from '@kliekjesclub/i18n'

type Props = {
  locale: Locale
  width?: number
  height?: number
}

export function FlagIcon({ locale, width = 24, height = 16 }: Props) {
  if (locale === 'nl') {
    return (
      <Svg width={width} height={height} viewBox="0 0 9 6">
        <Rect width="9" height="2" fill="#AE1C28" />
        <Rect y="2" width="9" height="2" fill="#FFFFFF" />
        <Rect y="4" width="9" height="2" fill="#21468B" />
      </Svg>
    )
  }

  // en — Union Jack (simplified, symmetric)
  return (
    <Svg width={width} height={height} viewBox="0 0 60 40">
      <Rect width="60" height="40" fill="#012169" />
      <Path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" />
      <Path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="3" />
      <Path d="M30,0 V40 M0,20 H60" stroke="#FFFFFF" strokeWidth="12" />
      <Path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="6" />
    </Svg>
  )
}
