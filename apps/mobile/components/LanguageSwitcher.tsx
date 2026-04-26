import { View, Text, Pressable } from 'react-native'
import { localeMeta, type Locale } from '@kliekjesclub/i18n'
import { useLocale } from '../lib/i18n'
import { FlagIcon } from './FlagIcon'

export function LanguageSwitcher() {
  const { locale, setLocale, availableLocales, t } = useLocale()
  return (
    <View className="bg-white rounded-2xl p-4 mb-4">
      <Text className="text-xs font-bold uppercase tracking-wide text-warm-500 mb-2">
        {t('common.language.label')}
      </Text>
      <View className="flex-row gap-2">
        {availableLocales.map((loc: Locale) => {
          const active = loc === locale
          return (
            <Pressable
              key={loc}
              onPress={() => setLocale(loc)}
              className={`flex-1 rounded-xl border py-2.5 flex-row items-center justify-center gap-2 ${
                active ? 'bg-brand-100 border-brand-300' : 'bg-white border-warm-200'
              }`}
            >
              <FlagIcon locale={loc} width={20} height={14} />
              <Text className={`text-sm font-bold ${active ? 'text-brand-700' : 'text-warm-700'}`}>
                {localeMeta[loc].name}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
