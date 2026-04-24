import { useRef, useState } from 'react'
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
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { allergenLabel } from '../../lib/format'
import { useTranslation } from '../../lib/i18n'
import {
  pickImage as pickImageFromLib,
  takePhoto as takePhotoFromLib,
  type ImagePickerAsset,
} from '../../lib/image-picker'
import { DishStepper } from '../../components/DishStepper'
import { DateTimePickerField } from '../../components/DateTimePickerField'

function parseTime(hhmm: string): Date {
  const d = new Date()
  const [h, m] = hhmm.split(':').map(Number)
  if (!Number.isNaN(h) && !Number.isNaN(m)) d.setHours(h, m, 0, 0)
  return d
}

function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function TimePickerField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (next: string) => void
  placeholder: string
}) {
  const date = value ? parseTime(value) : new Date()

  if (Platform.OS === 'ios') {
    return (
      <View className="bg-white border border-warm-200 rounded-xl px-3 py-2 mb-4 flex-row items-center justify-between">
        <Text className="text-[16px] text-warm-500">{placeholder}</Text>
        <DateTimePicker
          value={date}
          mode="time"
          display="compact"
          onChange={(_, d) => d && onChange(formatTime(d))}
        />
      </View>
    )
  }

  const openAndroidPicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      mode: 'time',
      is24Hour: true,
      onChange: (_e: DateTimePickerEvent, d?: Date) => {
        if (d) onChange(formatTime(d))
      },
    })
  }

  return (
    <Pressable
      className="bg-white border border-warm-200 rounded-xl px-4 py-3 mb-4"
      onPress={openAndroidPicker}
    >
      <Text className={`text-[16px] ${value ? 'text-warm-800' : 'text-warm-400'}`}>
        {value || placeholder}
      </Text>
    </Pressable>
  )
}

const ALL_ALLERGENS = [
  'gluten', 'crustaceans', 'eggs', 'fish', 'peanuts', 'soybeans',
  'milk', 'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs',
] as const

export default function CreateDishScreen() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const scrollRef = useRef<ScrollView>(null)

  const STEP_LABELS = [t('dishForm.steps.dish'), t('dishForm.steps.pickup'), t('dishForm.steps.details')]

  // Step state
  const [step, setStep] = useState(0)

  // Step 1: Dish basics
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<ImagePickerAsset | null>(null)

  // Step 2: Pickup & availability
  const [quantity, setQuantity] = useState('1')
  const [pickupStart, setPickupStart] = useState('')
  const [pickupEnd, setPickupEnd] = useState('')
  const [isFrozen, setIsFrozen] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')

  // Step 3: Details
  const [bringOwnContainer, setBringOwnContainer] = useState(false)
  const [isVegetarian, setIsVegetarian] = useState(false)
  const [isVegan, setIsVegan] = useState(false)
  const [ingredientInput, setIngredientInput] = useState('')
  const [ingredients, setIngredients] = useState<string[]>([])
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])
  const [autoExpire, setAutoExpire] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  // Validation
  const step0Valid = !!title.trim() && !!image
  const step1Valid =
    (parseInt(quantity, 10) || 0) >= 1 &&
    !!pickupStart.trim() &&
    (isFrozen || !!expiresAt.trim())
  const step2Valid = autoExpire

  const validateAndNext = () => {
    if (step === 0) {
      if (!title.trim()) {
        Alert.alert(t('dishForm.validation.requiredFieldTitle'), t('dishForm.validation.titleRequired'))
        return
      }
      if (!image) {
        Alert.alert(t('dishForm.validation.requiredFieldTitle'), t('dishForm.validation.imageRequired'))
        return
      }
    }
    if (step === 1) {
      if ((parseInt(quantity, 10) || 0) < 1) {
        Alert.alert(t('dishForm.validation.requiredFieldTitle'), t('dishForm.validation.quantityMin'))
        return
      }
      if (!pickupStart.trim()) {
        Alert.alert(t('dishForm.validation.requiredFieldTitle'), t('dishForm.validation.pickupStartRequired'))
        return
      }
      if (!isFrozen && !expiresAt.trim()) {
        Alert.alert(t('dishForm.validation.requiredFieldTitle'), t('dishForm.validation.expiresRequired'))
        return
      }
    }
    setStep((s) => s + 1)
    scrollRef.current?.scrollTo({ y: 0, animated: true })
  }

  const goBack = () => {
    setStep((s) => s - 1)
    scrollRef.current?.scrollTo({ y: 0, animated: true })
  }

  // Image helpers
  const pickImage = async () => {
    const asset = await pickImageFromLib()
    if (asset) setImage(asset)
  }

  const takePhoto = async () => {
    const asset = await takePhotoFromLib()
    if (asset) setImage(asset)
  }

  const showImageOptions = () => {
    Alert.alert(t('dishForm.image.dialogTitle'), t('dishForm.image.dialogMessage'), [
      { text: t('dishForm.image.camera'), onPress: takePhoto },
      { text: t('dishForm.image.library'), onPress: pickImage },
      { text: t('dishForm.image.cancel'), style: 'cancel' },
    ])
  }

  // Ingredient helpers
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
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    )
  }

  // Upload
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
    const { data: urlData } = supabase.storage.from('dish-images').getPublicUrl(fileName)
    return urlData.publicUrl
  }

  // Submit
  const handleSubmit = async () => {
    if (!autoExpire) {
      Alert.alert(t('dishForm.autoExpire.requiredTitle'), t('dishForm.autoExpire.requiredBody'))
      return
    }
    if (!user) return

    setSubmitting(true)
    try {
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
          user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? t('dishForm.submit.defaultKitchenName')
        const { data: profile } = await supabase
          .from('profiles')
          .select('city')
          .eq('id', user.id)
          .single()
        const { data: created, error: createError } = await supabase
          .from('merchants')
          .insert({ profile_id: user.id, business_name: displayName, city: profile?.city ?? null })
          .select('id')
          .single()
        if (createError || !created) {
          Alert.alert(t('dishForm.submit.errorTitle'), createError?.message ?? t('dishForm.submit.errorCreateMerchant'))
          setSubmitting(false)
          return
        }
        merchantId = created.id
      }

      let imageUrl: string | null = null
      if (image) {
        try {
          imageUrl = await uploadImage(merchantId)
        } catch {
          // Continue without image
        }
      }

      let pickupStartDate: string | null = null
      let pickupEndDate: string | null = null
      if (pickupStart) {
        const start = new Date(pickupStart)
        if (!isNaN(start.getTime())) {
          pickupStartDate = start.toISOString()
          if (pickupEnd) {
            const end = new Date(pickupEnd)
            if (!isNaN(end.getTime())) pickupEndDate = end.toISOString()
          } else {
            const end = new Date(start.getTime() + 3600000)
            pickupEndDate = end.toISOString()
          }
        }
      }

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
          is_frozen: isFrozen,
          expires_at:
            !isFrozen && expiresAt
              ? new Date(`${new Date().toISOString().split('T')[0]}T${expiresAt}`).toISOString()
              : null,
          bring_own_container: bringOwnContainer,
          status: 'available',
        })
        .select('id')
        .single()

      if (dishError || !dish) {
        Alert.alert(t('dishForm.submit.errorTitle'), dishError?.message ?? t('dishForm.submit.errorCreateDish'))
        setSubmitting(false)
        return
      }

      if (ingredients.length > 0) {
        await supabase
          .from('dish_ingredients')
          .insert(ingredients.map((name) => ({ dish_id: dish.id, name })))
      }
      if (selectedAllergens.length > 0) {
        await supabase
          .from('dish_allergies')
          .insert(selectedAllergens.map((allergen) => ({ dish_id: dish.id, allergen })))
      }

      Alert.alert(t('dishForm.submit.successTitle'), t('dishForm.submit.successBody'), [
        { text: t('dishForm.actions.view'), onPress: () => router.replace(`/dish/${dish.id}`) },
        { text: t('dishForm.actions.ok'), onPress: () => router.back() },
      ])
    } catch {
      Alert.alert(t('dishForm.submit.errorTitle'), t('dishForm.submit.errorGeneric'))
    } finally {
      setSubmitting(false)
    }
  }

  // ---- Step indicator ----
  const renderStepIndicator = () => <DishStepper labels={STEP_LABELS} step={step} />

  // ---- Step 1: Gerecht ----
  const renderStep0 = () => (
    <View>
      {/* Image picker */}
      <Pressable onPress={showImageOptions} className="active:opacity-80">
        {image ? (
          <View>
            <Image source={{ uri: image.uri }} className="w-full h-56" resizeMode="cover" />
            <View className="absolute bottom-3 right-3 bg-black/50 rounded-lg px-3 py-1.5 flex-row items-center">
              <Ionicons name="camera-outline" size={16} color="#fff" />
              <Text className="text-white text-xs font-bold ml-1">{t('dishForm.image.changeShort')}</Text>
            </View>
          </View>
        ) : (
          <View className="w-full h-56 bg-warm-100 items-center justify-center">
            <Ionicons name="camera-outline" size={48} color="#b0a89e" />
            <Text className="text-warm-500 text-sm mt-2">{t('dishForm.image.placeholder')}</Text>
          </View>
        )}
      </Pressable>

      <View className="px-5 pt-5">
        <Text className="text-sm font-bold text-warm-600 mb-1.5">{t('dishForm.fields.titleLabel')}</Text>
        <TextInput
          className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-[16px] text-warm-800 mb-4"
          placeholder={t('dishForm.fields.titlePlaceholder')}
          placeholderTextColor="#b0a89e"
          value={title}
          onChangeText={setTitle}
        />

        <Text className="text-sm font-bold text-warm-600 mb-1.5">{t('dishForm.fields.descriptionLabel')}</Text>
        <TextInput
          className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-[16px] text-warm-800"
          placeholder={t('dishForm.fields.descriptionPlaceholder')}
          placeholderTextColor="#b0a89e"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />
      </View>
    </View>
  )

  // ---- Step 2: Ophalen ----
  const renderStep1 = () => (
    <View className="px-5 pt-4">
      <Text className="text-sm font-bold text-warm-600 mb-1.5">{t('dishForm.fields.quantityLabel')}</Text>
      <View className="flex-row items-center mb-5">
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

      <Text className="text-sm font-bold text-warm-600 mb-1.5">{t('dishForm.fields.pickupStartLabel')}</Text>
      <DateTimePickerField
        value={pickupStart}
        placeholder={t('dishForm.fields.pickupDateTimePlaceholder')}
        minimumDate={new Date()}
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
        minimumDate={pickupStart ? new Date(pickupStart) : new Date()}
        onChange={setPickupEnd}
      />

      <Text className="text-sm font-bold text-warm-600 mb-2">{t('dishForm.fields.storageLabel')}</Text>
      <View className="flex-row gap-3 mb-3">
        <Pressable
          className={`flex-1 rounded-xl px-4 py-4 border-2 items-center ${
            !isFrozen ? 'bg-brand-100 border-brand-300' : 'bg-white border-warm-200'
          }`}
          onPress={() => setIsFrozen(false)}
        >
          <Ionicons name="sunny-outline" size={28} color={!isFrozen ? '#15803d' : '#b0a89e'} />
          <Text className={`text-sm font-bold mt-1 ${!isFrozen ? 'text-brand-700' : 'text-warm-500'}`}>
            {t('dishForm.fields.fresh')}
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 rounded-xl px-4 py-4 border-2 items-center ${
            isFrozen ? 'bg-blue-50 border-blue-300' : 'bg-white border-warm-200'
          }`}
          onPress={() => setIsFrozen(true)}
        >
          <Ionicons name="snow-outline" size={28} color={isFrozen ? '#1d4ed8' : '#b0a89e'} />
          <Text className={`text-sm font-bold mt-1 ${isFrozen ? 'text-blue-700' : 'text-warm-500'}`}>
            {t('dishForm.fields.frozen')}
          </Text>
        </Pressable>
      </View>

      {!isFrozen && (
        <View className="mb-2">
          <Text className="text-sm font-bold text-warm-600 mb-1.5">{t('dishForm.fields.expiresLabel')}</Text>
          <TimePickerField
            value={expiresAt}
            placeholder={t('dishForm.fields.pickupTimePlaceholder')}
            onChange={setExpiresAt}
          />
          <Text className="text-xs text-warm-400 mt-1">
            {t('dishForm.fields.expiresHint')}
          </Text>
        </View>
      )}
      {isFrozen && (
        <Text className="text-sm text-warm-500 mb-2">
          {t('dishForm.fields.frozenNote')}
        </Text>
      )}
    </View>
  )

  // ---- Step 3: Details ----
  const renderStep2 = () => (
    <View className="px-5 pt-4">
      {/* Toggle options */}
      <Text className="text-sm font-bold text-warm-600 mb-2">{t('dishForm.fields.optionsLabel')}</Text>
      <View className="gap-2 mb-5">
        <Pressable
          className={`flex-row items-center rounded-xl px-4 py-3.5 border ${
            isVegetarian ? 'bg-brand-100 border-brand-300' : 'bg-white border-warm-200'
          }`}
          onPress={() => setIsVegetarian((v) => !v)}
        >
          <Ionicons name="leaf-outline" size={20} color={isVegetarian ? '#15803d' : '#b0a89e'} />
          <Text className={`text-base ml-3 flex-1 ${isVegetarian ? 'text-brand-700 font-bold' : 'text-warm-600'}`}>
            {t('dishForm.fields.vegetarian')}
          </Text>
          {isVegetarian && <Ionicons name="checkmark-circle" size={22} color="#22c55e" />}
        </Pressable>
        <Pressable
          className={`flex-row items-center rounded-xl px-4 py-3.5 border ${
            isVegan ? 'bg-brand-100 border-brand-300' : 'bg-white border-warm-200'
          }`}
          onPress={() => setIsVegan((v) => !v)}
        >
          <Ionicons name="leaf-outline" size={20} color={isVegan ? '#15803d' : '#b0a89e'} />
          <Text className={`text-base ml-3 flex-1 ${isVegan ? 'text-brand-700 font-bold' : 'text-warm-600'}`}>
            {t('dishForm.fields.vegan')}
          </Text>
          {isVegan && <Ionicons name="checkmark-circle" size={22} color="#22c55e" />}
        </Pressable>
        <Pressable
          className={`flex-row items-center rounded-xl px-4 py-3.5 border ${
            bringOwnContainer ? 'bg-amber-50 border-amber-300' : 'bg-white border-warm-200'
          }`}
          onPress={() => setBringOwnContainer((v) => !v)}
        >
          <Ionicons name="cube-outline" size={20} color={bringOwnContainer ? '#d97706' : '#b0a89e'} />
          <Text className={`text-base ml-3 flex-1 ${bringOwnContainer ? 'text-amber-700 font-bold' : 'text-warm-600'}`}>
            {t('dishForm.fields.bringOwnContainer')}
          </Text>
          {bringOwnContainer && <Ionicons name="checkmark-circle" size={22} color="#d97706" />}
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
        <View className="flex-row flex-wrap gap-2 mb-5">
          {ingredients.map((name) => (
            <Pressable
              key={name}
              className="flex-row items-center bg-white border border-warm-200 rounded-xl px-3 py-2"
              onPress={() => removeIngredient(name)}
            >
              <Text className="text-sm text-warm-700 mr-1">{name}</Text>
              <Ionicons name="close-circle" size={16} color="#b0a89e" />
            </Pressable>
          ))}
        </View>
      )}
      {ingredients.length === 0 && <View className="mb-5" />}

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

      {/* Auto-expire agreement */}
      <Pressable
        className={`flex-row items-start rounded-xl px-4 py-3.5 border mb-2 ${
          autoExpire ? 'bg-brand-50 border-brand-300' : 'bg-white border-warm-200'
        }`}
        onPress={() => setAutoExpire((v) => !v)}
      >
        <Ionicons
          name={autoExpire ? 'checkbox' : 'square-outline'}
          size={22}
          color={autoExpire ? '#22c55e' : '#b0a89e'}
          style={{ marginTop: 1 }}
        />
        <Text className={`text-sm ml-3 flex-1 leading-5 ${autoExpire ? 'text-brand-700' : 'text-warm-600'}`}>
          {t('dishForm.autoExpire.label')}
        </Text>
      </Pressable>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-offwhite" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {renderStepIndicator()}

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {step === 0 && renderStep0()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </ScrollView>

        {/* Bottom navigation */}
        <View className="px-5 pt-3 pb-4 border-t border-warm-200 bg-offwhite">
          <View className="flex-row gap-3">
            {step > 0 ? (
              <Pressable
                className="flex-1 border border-warm-300 rounded-xl py-3.5 items-center active:bg-warm-50"
                onPress={goBack}
              >
                <Text className="text-warm-700 font-bold text-base">{t('dishForm.actions.previous')}</Text>
              </Pressable>
            ) : (
              <Pressable
                className="flex-1 border border-warm-300 rounded-xl py-3.5 items-center active:bg-warm-50"
                onPress={() => router.back()}
              >
                <Text className="text-warm-700 font-bold text-base">{t('dishForm.actions.cancel')}</Text>
              </Pressable>
            )}

            {step < 2 ? (
              <Pressable
                className={`flex-1 rounded-xl py-3.5 items-center ${
                  (step === 0 && step0Valid) || (step === 1 && step1Valid)
                    ? 'bg-brand-500 active:bg-brand-600'
                    : 'bg-brand-300'
                }`}
                onPress={validateAndNext}
              >
                <Text className="text-white font-bold text-base">{t('dishForm.actions.next')}</Text>
              </Pressable>
            ) : (
              <Pressable
                className={`flex-1 rounded-xl py-3.5 items-center ${
                  step2Valid && !submitting ? 'bg-brand-500 active:bg-brand-600' : 'bg-brand-300'
                }`}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-base">{t('dishForm.actions.submit')}</Text>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
