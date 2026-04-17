import { Alert } from 'react-native'

let ImagePicker: typeof import('expo-image-picker') | null = null
try {
  ImagePicker = require('expo-image-picker')
} catch {
  // Native module not available
}

export type ImagePickerAsset = {
  uri: string
  mimeType?: string
}

const UNAVAILABLE_MSG =
  'De fotobibliotheek is niet beschikbaar op dit apparaat.'

export async function requestMediaLibraryPermission(): Promise<boolean> {
  if (!ImagePicker) {
    Alert.alert('Niet beschikbaar', UNAVAILABLE_MSG)
    return false
  }
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (status !== 'granted') {
    Alert.alert(
      'Toestemming nodig',
      "We hebben toegang tot je foto's nodig om een afbeelding te kiezen."
    )
    return false
  }
  return true
}

export async function requestCameraPermission(): Promise<boolean> {
  if (!ImagePicker) {
    Alert.alert('Niet beschikbaar', UNAVAILABLE_MSG)
    return false
  }
  const { status } = await ImagePicker.requestCameraPermissionsAsync()
  if (status !== 'granted') {
    Alert.alert(
      'Toestemming nodig',
      'We hebben toegang tot je camera nodig om een foto te maken.'
    )
    return false
  }
  return true
}

export async function pickImage(): Promise<ImagePickerAsset | null> {
  if (!ImagePicker) {
    Alert.alert('Niet beschikbaar', UNAVAILABLE_MSG)
    return null
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  })
  if (!result.canceled && result.assets[0]) {
    return result.assets[0]
  }
  return null
}

export async function takePhoto(): Promise<ImagePickerAsset | null> {
  if (!ImagePicker) {
    Alert.alert('Niet beschikbaar', UNAVAILABLE_MSG)
    return null
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  })
  if (!result.canceled && result.assets[0]) {
    return result.assets[0]
  }
  return null
}
