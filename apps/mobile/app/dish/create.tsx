import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { allergenLabel } from '../../lib/format'

const ALL_ALLERGENS = [
  'gluten',
  'crustaceans',
  'eggs',
  'fish',
  'peanuts',
  'soybeans',
  'milk',
  'nuts',
  'celery',
  'mustard',
  'sesame',
  'sulphites',
  'lupin',
  'molluscs',
] as const

export default function CreateDishScreen() {
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [pickupStart, setPickupStart] = useState('')
  const [pickupEnd, setPickupEnd] = useState('')
  const [isVegetarian, setIsVegetarian] = useState(false)
  const [isVegan, setIsVegan] = useState(false)
  const [bringOwnContainer, setBringOwnContainer] = useState(false)
  const [ingredientInput, setIngredientInput] = useState('')
  const [ingredients, setIngredients] = useState<string[]>([])
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Toestemming nodig', 'We hebben toegang tot je foto\'s nodig om een afbeelding te kiezen.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0])
    }
  }

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Toestemming nodig', 'We hebben toegang tot je camera nodig om een foto te maken.')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0])
    }
  }

  const showImageOptions = () => {
    Alert.alert('Foto toevoegen', 'Kies een optie', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Fotobibliotheek', onPress: pickImage },
      { text: 'Annuleren', style: 'cancel' },
    ])
  }

  const addIngredient = () => {
    const trimmed = ingredientInput.trim()
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients((prev) => [...prev, trimmed])
      setIngredientInput('')
    }
  }

  const removeIngredient = (name: string) => {
    setIngredients((prev) => prev.filter((i) => i !== name))
  }

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    )
  }

  const uploadImage = async (merchantId: string): Promise<string | null> => {
    if (!image || !user) return null

    const ext = image.uri.split('.').pop() ?? 'jpg'
    const fileName = `${user.id}/${Date.now()}.${ext}`

    const response = await fetch(image.uri)
    const blob = await response.blob()
    const arrayBuffer = await new Response(blob).arrayBuffer()

    const { error } = await supabase.storage
      .from('dish-images')
      .upload(fileName, arrayBuffer, {
        contentType: image.mimeType ?? `image/${ext}`,
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    const { data: urlData } = supabase.storage
      .from('dish-images')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Verplicht veld', 'Vul een titel in voor je gerecht.')
      return
    }
    if (!user) return

    setSubmitting(true)

    try {
      // Find or create merchant profile for the current user
      const { data: merchants } = await supabase
        .from('merchants')
        .select('id')
        .eq('profile_id', user.id)
        .limit(1)

      let merchantId: string

      if (merchants && merchants.length > 0) {
        merchantId = merchants[0].id
      } else {
        const displayName =
          user.user_metadata?.display_name ??
          user.email?.split('@')[0] ??
          'Mijn keuken'

        // Get city from user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('city')
          .eq('id', user.id)
          .single()

        const { data: created, error: createError } = await supabase
          .from('merchants')
          .insert({
            profile_id: user.id,
            business_name: displayName,
            city: profile?.city ?? null,
          })
          .select('id')
          .single()

        if (createError || !created) {
          Alert.alert('Fout', createError?.message ?? 'Kon je aanbiedersprofiel niet aanmaken.')
          setSubmitting(false)
          return
        }
        merchantId = created.id
      }

      // Upload image if selected
      let imageUrl: string | null = null
      if (image) {
        try {
          imageUrl = await uploadImage(merchantId)
        } catch {
          // Continue without image
        }
      }

      // Build pickup times — only include if both are filled in
      let pickupStartDate: string | null = null
      let pickupEndDate: string | null = null
      if (pickupStart && pickupEnd) {
        const today = new Date().toISOString().split('T')[0]
        const start = new Date(`${today}T${pickupStart}`)
        const end = new Date(`${today}T${pickupEnd}`)
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          pickupStartDate = start.toISOString()
          pickupEndDate = end.toISOString()
        }
      }

      // Insert the dish
      const { data: dish, error: dishError } = await supabase
        .from('dishes')
        .insert({
          merchant_id: merchantId,
          title: title.trim(),
          description: description.trim() || null,
          image_url: imageUrl,
          quantity_available: parseInt(quantity, 10) || 1,
          pickup_start: pickupStartDate,
          pickup_end: pickupEndDate,
          is_vegetarian: isVegetarian || isVegan,
          is_vegan: isVegan,
          bring_own_container: bringOwnContainer,
          status: 'available',
        })
        .select('id')
        .single()

      if (dishError || !dish) {
        Alert.alert('Fout', dishError?.message ?? 'Kon het gerecht niet aanmaken.')
        setSubmitting(false)
        return
      }

      // Insert ingredients
      if (ingredients.length > 0) {
        await supabase.from('dish_ingredients').insert(
          ingredients.map((name) => ({ dish_id: dish.id, name }))
        )
      }

      // Insert allergens
      if (selectedAllergens.length > 0) {
        await supabase.from('dish_allergies').insert(
          selectedAllergens.map((allergen) => ({ dish_id: dish.id, allergen }))
        )
      }

      Alert.alert('Gelukt!', 'Je gerecht is aangemaakt.', [
        { text: 'Bekijken', onPress: () => router.replace(`/dish/${dish.id}`) },
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (err) {
      Alert.alert('Fout', 'Er is iets misgegaan. Probeer het opnieuw.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-offwhite" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image picker */}
          <Pressable onPress={showImageOptions} className="active:opacity-80">
            {image ? (
              <Image
                source={{ uri: image.uri }}
                className="w-full h-56"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-56 bg-warm-100 items-center justify-center">
                <Ionicons name="camera-outline" size={48} color="#9e9589" />
                <Text className="text-warm-500 text-sm mt-2">Voeg een foto toe</Text>
              </View>
            )}
          </Pressable>

          <View className="px-5 pt-5 pb-8">
            {/* Title */}
            <Text className="text-sm font-bold text-warm-600 mb-1.5">
              Titel *
            </Text>
            <TextInput
              className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-base text-warm-800 mb-4"
              placeholder="Bijv. Pasta bolognese"
              placeholderTextColor="#9e9589"
              value={title}
              onChangeText={setTitle}
            />

            {/* Description */}
            <Text className="text-sm font-bold text-warm-600 mb-1.5">
              Beschrijving
            </Text>
            <TextInput
              className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-base text-warm-800 mb-4"
              placeholder="Omschrijf je gerecht..."
              placeholderTextColor="#9e9589"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />

            {/* Quantity */}
            <Text className="text-sm font-bold text-warm-600 mb-1.5">
              Aantal porties
            </Text>
            <View className="flex-row items-center mb-4">
              <Pressable
                className="w-10 h-10 rounded-xl bg-warm-100 items-center justify-center"
                onPress={() =>
                  setQuantity((q) => String(Math.max(1, parseInt(q, 10) - 1)))
                }
              >
                <Ionicons name="remove" size={20} color="#302b26" />
              </Pressable>
              <TextInput
                className="bg-white border border-warm-200 rounded-xl px-4 py-2.5 text-base text-warm-800 text-center mx-3 w-16"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
              />
              <Pressable
                className="w-10 h-10 rounded-xl bg-warm-100 items-center justify-center"
                onPress={() =>
                  setQuantity((q) => String(parseInt(q, 10) + 1))
                }
              >
                <Ionicons name="add" size={20} color="#302b26" />
              </Pressable>
            </View>

            {/* Pickup times */}
            <Text className="text-sm font-bold text-warm-600 mb-1.5">
              Ophaaltijd
            </Text>
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <TextInput
                  className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-base text-warm-800"
                  placeholder="Van (bijv. 18:00)"
                  placeholderTextColor="#9e9589"
                  value={pickupStart}
                  onChangeText={setPickupStart}
                />
              </View>
              <View className="flex-1">
                <TextInput
                  className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-base text-warm-800"
                  placeholder="Tot (bijv. 19:00)"
                  placeholderTextColor="#9e9589"
                  value={pickupEnd}
                  onChangeText={setPickupEnd}
                />
              </View>
            </View>

            {/* Toggle options */}
            <Text className="text-sm font-bold text-warm-600 mb-2">
              Opties
            </Text>
            <View className="gap-2 mb-4">
              <Pressable
                className={`flex-row items-center rounded-xl px-4 py-3 border ${
                  isVegetarian
                    ? 'bg-brand-100 border-brand-300'
                    : 'bg-white border-warm-200'
                }`}
                onPress={() => setIsVegetarian((v) => !v)}
              >
                <Ionicons
                  name="leaf-outline"
                  size={18}
                  color={isVegetarian ? '#15803d' : '#9e9589'}
                />
                <Text
                  className={`text-sm font-bold ml-2 ${
                    isVegetarian ? 'text-brand-700' : 'text-warm-600'
                  }`}
                >
                  Vegetarisch
                </Text>
              </Pressable>
              <Pressable
                className={`flex-row items-center rounded-xl px-4 py-3 border ${
                  isVegan
                    ? 'bg-brand-100 border-brand-300'
                    : 'bg-white border-warm-200'
                }`}
                onPress={() => setIsVegan((v) => !v)}
              >
                <Ionicons
                  name="leaf-outline"
                  size={18}
                  color={isVegan ? '#15803d' : '#9e9589'}
                />
                <Text
                  className={`text-sm font-bold ml-2 ${
                    isVegan ? 'text-brand-700' : 'text-warm-600'
                  }`}
                >
                  Veganistisch
                </Text>
              </Pressable>
              <Pressable
                className={`flex-row items-center rounded-xl px-4 py-3 border ${
                  bringOwnContainer
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-white border-warm-200'
                }`}
                onPress={() => setBringOwnContainer((v) => !v)}
              >
                <Ionicons
                  name="cube-outline"
                  size={18}
                  color={bringOwnContainer ? '#d97706' : '#9e9589'}
                />
                <Text
                  className={`text-sm font-bold ml-2 ${
                    bringOwnContainer ? 'text-amber-700' : 'text-warm-600'
                  }`}
                >
                  Eigen bakje meenemen
                </Text>
              </Pressable>
            </View>

            {/* Ingredients */}
            <Text className="text-sm font-bold text-warm-600 mb-1.5">
              Ingrediënten
            </Text>
            <View className="flex-row items-center mb-2">
              <TextInput
                className="flex-1 bg-white border border-warm-200 rounded-xl px-4 py-3 text-base text-warm-800"
                placeholder="Voeg ingrediënt toe..."
                placeholderTextColor="#9e9589"
                value={ingredientInput}
                onChangeText={setIngredientInput}
                onSubmitEditing={addIngredient}
                returnKeyType="done"
              />
              <Pressable
                className="ml-2 bg-brand-500 rounded-xl px-4 py-3"
                onPress={addIngredient}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
              </Pressable>
            </View>
            {ingredients.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-4">
                {ingredients.map((name) => (
                  <Pressable
                    key={name}
                    className="flex-row items-center bg-white border border-warm-200 rounded-xl px-3 py-2"
                    onPress={() => removeIngredient(name)}
                  >
                    <Text className="text-sm text-warm-700 mr-1">{name}</Text>
                    <Ionicons name="close-circle" size={16} color="#9e9589" />
                  </Pressable>
                ))}
              </View>
            )}
            {ingredients.length === 0 && <View className="mb-4" />}

            {/* Allergens */}
            <Text className="text-sm font-bold text-warm-600 mb-2">
              Allergenen
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {ALL_ALLERGENS.map((allergen) => {
                const active = selectedAllergens.includes(allergen)
                return (
                  <Pressable
                    key={allergen}
                    className={`rounded-xl px-3.5 py-2 border ${
                      active
                        ? 'bg-red-50 border-red-300'
                        : 'bg-white border-warm-200'
                    }`}
                    onPress={() => toggleAllergen(allergen)}
                  >
                    <Text
                      className={`text-sm font-bold ${
                        active ? 'text-red-700' : 'text-warm-600'
                      }`}
                    >
                      {allergenLabel(allergen)}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            {/* Submit */}
            <Pressable
              className={`rounded-xl py-4 items-center ${
                submitting ? 'bg-brand-300' : 'bg-brand-500 active:bg-brand-600'
              }`}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Gerecht plaatsen
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
