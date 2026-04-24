import { View, Text, Pressable, Platform } from 'react-native'
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker'
import { useTranslation } from '../lib/i18n'

function formatDisplay(iso: string, locale: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const bcp = locale === 'nl' ? 'nl-NL' : 'en-GB'
  return d.toLocaleString(bcp, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DateTimePickerField({
  value,
  onChange,
  placeholder,
  minimumDate,
}: {
  value: string
  onChange: (iso: string) => void
  placeholder: string
  minimumDate?: Date
}) {
  const { locale } = useTranslation()
  const current = value ? new Date(value) : new Date()
  const displayText = value ? formatDisplay(value, locale) : ''

  if (Platform.OS === 'ios') {
    return (
      <View className="bg-white border border-warm-200 rounded-xl px-3 py-2 mb-4 flex-row items-center justify-between">
        <Text className="text-[16px] text-warm-500">{placeholder}</Text>
        <DateTimePicker
          value={current}
          mode="datetime"
          display="compact"
          minimumDate={minimumDate}
          onChange={(_, d) => d && onChange(d.toISOString())}
        />
      </View>
    )
  }

  const openAndroidPicker = () => {
    DateTimePickerAndroid.open({
      value: current,
      mode: 'date',
      minimumDate,
      onChange: (_e: DateTimePickerEvent, picked?: Date) => {
        if (!picked) return
        DateTimePickerAndroid.open({
          value: picked,
          mode: 'time',
          is24Hour: true,
          onChange: (_e2: DateTimePickerEvent, withTime?: Date) => {
            if (withTime) onChange(withTime.toISOString())
          },
        })
      },
    })
  }

  return (
    <Pressable
      className="bg-white border border-warm-200 rounded-xl px-4 py-3 mb-4"
      onPress={openAndroidPicker}
    >
      <Text className={`text-[16px] ${displayText ? 'text-warm-800' : 'text-warm-400'}`}>
        {displayText || placeholder}
      </Text>
    </Pressable>
  )
}
