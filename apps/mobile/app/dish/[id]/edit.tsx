import { useCallback, useEffect, useState } from 'react'
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
import { useLocalSearchParams, router } from 'expo-router'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'
import { allergenLabel } from '../../../lib/format'
import { pickImage as pickImageFromLib, takePhoto as takePhotoFromLib, type ImagePickerAsset } from '../../../lib/image-picker'
import { useTranslation } from '../../../lib/i18n'
import { DateTimePickerField } from '../../../components/DateTimePickerField'

const ALL_ALLERGENS = [
  'gluten', 'crustaceans', 'eggs', 'fish', 'peanuts', 'soybeans',
  'milk', 'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs',
] as const

export default function EditDishScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [newImage, setNewImage] = useState<ImagePickerAsset | null>(null)
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
  const [merchantId, setMerchantId] = useState<string | null>(null)

  const fetchDish = useCallback(async () => {
    const [dishRes, ingredientsRes, allergensRes] = await Promise.all([
      supabase.from('dishes').select('*').eq('id', id).single(),
      supabase.from('dish_ingredients').select('name').eq('dish_id', id),
      supabase.from('dish_allergies').select('allergen').eq('dish_id', id),
    ])

    if (dishRes.data) {
      const d = dishRes.data
      setTitle(d.title)
      setDescription(d.description ?? '')
      setExistingImageUrl(d.image_url)
      setQuantity(String(d.quantity_available))
      setIsVegetarian(d.is_vegetarian)
      setIsVegan(d.is_vegan)
      setBringOwnContainer(d.bring_own_container)
      setMerchantId(d.merchant_id)

      if (d.pickup_start) {
        const s = new Date(d.pickup_start)
        if (!isNaN(s.getTime())) setPickupStart(s.toISOString())
      }
      if (d.pickup_end) {
        const e = new Date(d.pickup_end)
        if (!isNaN(e.getTime())) setPickupEnd(e.toISOString())
      }
    }

    if (ingredientsRes.data) {
      setIngredients(ingredientsRes.data.map((i) => i.name))
    }
    if (allergensRes.data) {
      setSelectedAllergens(allergensRes.data.map((a) => a.allergen))
    }
  }, [id])

  useEffect(() => {
    fetchDish().finally(() => setLoading(false))
  }, [fetchDish])

  const pickImage = async () => {
    const asset = await pickImageFromLib()
    if (asset) setNewImage(asset)
  }

  const takePhoto = async () => {
    const asset = await takePhotoFromLib()
    if (asset) setNewImage(asset)
  }

  const showImageOptions = () => {
    Alert.alert(t('dishForm.image.dialogTitleEdit'), t('dishForm.image.dialogMessage'), [
      { text: t('dishForm.image.camera'), onPress: takePhoto },
      { text: t('dishForm.image.library'), onPress: pickImage },
      { text: t('dishForm.image.cancel'), style: 'cancel' },
    ])
  }

  const addIngredient = () => {
    const trimmed = ingredientInput.trim()
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients((prev) => [...prev, trimmed])
      setIngredientInput('')
    }
  }

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    )
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!newImage || !user) return null

    const ext = newImage.uri.split('.').pop() ?? 'jpg'
    const fileName = `${user.id}/${Date.now()}.${ext}`

    const response = await fetch(newImage.uri)
    const blob = await response.blob()
    const arrayBuffer = await new Response(blob).arrayBuffer()

    const { error } = await supabase.storage
      .from('dish-images')
      .upload(fileName, arrayBuffer, {
        contentType: newImage.mimeType ?? `image/${ext}`,
        upsert: false,
      })

    if (error) return null

    const { data: urlData } = supabase.storage.from('dish-images').getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(t('dishForm.validation.requiredFieldTitle'), t('dishForm.validation.titleRequired'))
      return
    }
    if (!user) return

    setSubmitting(true)

    try {
      // Upload new image if selected
      let imageUrl = existingImageUrl
      if (newImage) {
        const uploaded = await uploadImage()
        if (uploaded) {
          // Delete old image
          if (existingImageUrl) {
            const oldPath = existingImageUrl.split('/dish-images/')[1]
            if (oldPath) await supabase.storage.from('dish-images').remove([oldPath])
          }
          imageUrl = uploaded
        }
      }

      // Build pickup times
      let pickupStartDate: string | null = null
      let pickupEndDate: string | null = null
      if (pickupStart && pickupEnd) {
        const start = new Date(pickupStart)
        const end = new Date(pickupEnd)
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          pickupStartDate = start.toISOString()
          pickupEndDate = end.toISOString()
        }
      }

      // Update dish
      const { error: dishError } = await supabase
        .from('dishes')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          image_url: imageUrl,
          quantity_available: parseInt(quantity, 10) || 1,
          pickup_start: pickupStartDate,
          pickup_end: pickupEndDate,
          is_vegetarian: isVegetarian || isVegan,
          is_vegan: isVegan,
          bring_own_container: bringOwnContainer,
        })
        .eq('id', id)

      if (dishError) {
        Alert.alert(t('dishForm.submit.errorTitle'), dishError.message)
        setSubmitting(false)
        return
      }

      // Replace ingredients
      await supabase.from('dish_ingredients').delete().eq('dish_id', id)
      if (ingredients.length > 0) {
        await supabase.from('dish_ingredients').insert(
          ingredients.map((name) => ({ dish_id: id, name }))
        )
      }

      // Replace allergens
      await supabase.from('dish_allergies').delete().eq('dish_id', id)
      if (selectedAllergens.length > 0) {
        await supabase.from('dish_allergies').insert(
          selectedAllergens.map((allergen) => ({ dish_id: id, allergen }))
        )
      }

      Alert.alert(t('dishForm.edit.savedTitle'), t('dishForm.edit.savedBody'), [
        { text: t('dishForm.actions.ok'), onPress: () => router.back() },
      ])
    } catch {
      Alert.alert(t('dishForm.submit.errorTitle'), t('dishForm.submit.errorGeneric'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-offwhite items-center justify-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    )
  }

  const displayImage = newImage?.uri ?? existingImageUrl

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
          {/* Image */}
          <Pressable onPress={showImageOptions} className="active:opacity-80">
            {displayImage ? (
              <Image source={{ uri: displayImage }} className="w-full h-56" resizeMode="cover" />
            ) : (
              <View className="w-full h-56 bg-warm-100 items-center justify-center">
                <Ionicons name="camera-outline" size={48} color="#b0a89e" />
                <Text className="text-warm-500 text-sm mt-2">{t('dishForm.image.placeholderEdit')}</Text>
              </View>
            )}
          </Pressable>

          <View className="px-5 pt-5 pb-8">
            {/* Title */}
            <Text className="text-sm font-bold text-warm-600 mb-1.5">{t('dishForm.fields.titleLabel')}</Text>
            <TextInput
              className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-[16px] text-warm-800 mb-4"
              placeholder={t('dishForm.fields.titlePlaceholder')}
              placeholderTextColor="#b0a89e"
              value={title}
              onChangeText={setTitle}
            />

            {/* Description */}
            <Text className="text-sm font-bold text-warm-600 mb-1.5">{t('dishForm.fields.descriptionLabel')}</Text>
            <TextInput
              className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-[16px] text-warm-800 mb-4"
              placeholder={t('dishForm.fields.descriptionPlaceholder')}
              placeholderTextColor="#b0a89e"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />

            {/* Quantity */}
            <Text className="text-sm font-bold text-warm-600 mb-1.5">{t('dishForm.fields.quantityLabel')}</Text>
            <View className="flex-row items-center mb-4">
              <Pressable
                className="w-10 h-10 rounded-xl bg-warm-100 items-center justify-center"
                onPress={() => setQuantity((q) => String(Math.max(1, parseInt(q, 10) - 1)))}
              >
                <Ionicons name="remove" size={20} color="#3d3833" />
              </Pressable>
              <TextInput
                className="bg-white border border-warm-200 rounded-xl px-4 py-2.5 text-[16px] text-warm-800 text-center mx-3 w-16"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
              />
              <Pressable
                className="w-10 h-10 rounded-xl bg-warm-100 items-center justify-center"
                onPress={() => setQuantity((q) => String(parseInt(q, 10) + 1))}
              >
                <Ionicons name="add" size={20} color="#3d3833" />
              </Pressable>
            </View>

            {/* Pickup times */}
            <Text className="text-sm font-bold text-warm-600 mb-1.5">{t('dishForm.fields.pickupStartLabel')}</Text>
            <DateTimePickerField
              value={pickupStart}
              placeholder={t('dishForm.fields.pickupDateTimePlaceholder')}
              onChange={(iso) => {
                setPickupStart(iso)
                if (!pickupEnd) {
                  const end = new Date(new Date(iso).getTime() + 3600000)
                  setPickupEnd(end.toISOString())
                }
              }}
            />

            <Text className="text-sm font-bold text-warm-600 mb-1.5">{t('dishForm.fields.pickupEndLabel')}</Text>
            <DateTimePickerField
              value={pickupEnd}
              placeholder={t('dishForm.fields.pickupDateTimePlaceholder')}
              minimumDate={pickupStart ? new Date(pickupStart) : undefined}
              onChange={setPickupEnd}
            />

            {/* Toggle options */}
            <Text className="text-sm font-bold text-warm-600 mb-2">{t('dishForm.fields.optionsLabel')}</Text>
            <View className="gap-2 mb-4">
              <Pressable
                className={`flex-row items-center rounded-xl px-4 py-3 border ${
                  isVegetarian ? 'bg-brand-100 border-brand-300' : 'bg-white border-warm-200'
                }`}
                onPress={() => setIsVegetarian((v) => !v)}
              >
                <Ionicons name="leaf-outline" size={18} color={isVegetarian ? '#15803d' : '#b0a89e'} />
                <Text className={`text-sm font-bold ml-2 ${isVegetarian ? 'text-brand-700' : 'text-warm-600'}`}>
                  {t('dishForm.fields.vegetarian')}
                </Text>
              </Pressable>
              <Pressable
                className={`flex-row items-center rounded-xl px-4 py-3 border ${
                  isVegan ? 'bg-brand-100 border-brand-300' : 'bg-white border-warm-200'
                }`}
                onPress={() => setIsVegan((v) => !v)}
              >
                <Ionicons name="leaf-outline" size={18} color={isVegan ? '#15803d' : '#b0a89e'} />
                <Text className={`text-sm font-bold ml-2 ${isVegan ? 'text-brand-700' : 'text-warm-600'}`}>
                  {t('dishForm.fields.vegan')}
                </Text>
              </Pressable>
              <Pressable
                className={`flex-row items-center rounded-xl px-4 py-3 border ${
                  bringOwnContainer ? 'bg-amber-50 border-amber-300' : 'bg-white border-warm-200'
                }`}
                onPress={() => setBringOwnContainer((v) => !v)}
              >
                <Ionicons name="cube-outline" size={18} color={bringOwnContainer ? '#d97706' : '#b0a89e'} />
                <Text className={`text-sm font-bold ml-2 ${bringOwnContainer ? 'text-amber-700' : 'text-warm-600'}`}>
                  {t('dishForm.fields.bringOwnContainer')}
                </Text>
              </Pressable>
            </View>

            {/* Ingredients */}
            <Text className="text-sm font-bold text-warm-600 mb-1.5">{t('dishForm.fields.ingredientsLabel')}</Text>
            <View className="flex-row items-center mb-2">
              <TextInput
                className="flex-1 bg-white border border-warm-200 rounded-xl px-4 py-3 text-[16px] text-warm-800"
                placeholder={t('dishForm.fields.ingredientsPlaceholder')}
                placeholderTextColor="#b0a89e"
                value={ingredientInput}
                onChangeText={setIngredientInput}
                onSubmitEditing={addIngredient}
                returnKeyType="done"
              />
              <Pressable className="ml-2 bg-brand-500 rounded-xl px-4 py-3" onPress={addIngredient}>
                <Ionicons name="add" size={20} color="#ffffff" />
              </Pressable>
            </View>
            {ingredients.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-4">
                {ingredients.map((name) => (
                  <Pressable
                    key={name}
                    className="flex-row items-center bg-white border border-warm-200 rounded-xl px-3 py-2"
                    onPress={() => setIngredients((prev) => prev.filter((i) => i !== name))}
                  >
                    <Text className="text-sm text-warm-700 mr-1">{name}</Text>
                    <Ionicons name="close-circle" size={16} color="#b0a89e" />
                  </Pressable>
                ))}
              </View>
            )}
            {ingredients.length === 0 && <View className="mb-4" />}

            {/* Allergens */}
            <Text className="text-sm font-bold text-warm-600 mb-2">{t('dishForm.fields.allergensLabel')}</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {ALL_ALLERGENS.map((allergen) => {
                const active = selectedAllergens.includes(allergen)
                return (
                  <Pressable
                    key={allergen}
                    className={`rounded-xl px-3.5 py-2 border ${
                      active ? 'bg-red-50 border-red-300' : 'bg-white border-warm-200'
                    }`}
                    onPress={() => toggleAllergen(allergen)}
                  >
                    <Text className={`text-sm font-bold ${active ? 'text-red-700' : 'text-warm-600'}`}>
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
                <Text className="text-white font-bold text-base">{t('dishForm.edit.saveButton')}</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
