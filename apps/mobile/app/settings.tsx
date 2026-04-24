import { View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-offwhite" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-8">
          <LanguageSwitcher />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
