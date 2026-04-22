'use client'

import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const ALL_ALLERGENS = [
  'gluten', 'crustaceans', 'eggs', 'fish', 'peanuts', 'soybeans',
  'milk', 'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs',
] as const

const CHECKBOX = "h-5 w-5 flex-shrink-0 cursor-pointer appearance-none rounded-lg border-2 border-warm-300 bg-white transition-colors checked:border-brand-500 checked:bg-brand-500 checked:bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22white%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M12.207%204.793a1%201%200%20010%201.414l-5%205a1%201%200%2001-1.414%200l-2.5-2.5a1%201%200%20011.414-1.414L6.5%209.086l4.293-4.293a1%201%200%20011.414%200z%22%2F%3E%3C%2Fsvg%3E')] checked:bg-center checked:bg-no-repeat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"

const STEP_KEYS = ['dish', 'pickup', 'details'] as const

interface DishData {
  id: string
  title: string
  description: string | null
  image_url: string | null
  quantity_available: number
  status: string
  pickup_start: string | null
  pickup_end: string | null
  bring_own_container: boolean
  is_vegetarian: boolean
  is_vegan: boolean
  is_frozen: boolean
  expires_at: string | null
  ingredients: string[]
  allergens: string[]
}

interface DishFormProps {
  initialData?: DishData
  merchantId: string
  onSuccess?: () => void
}

function toLocalDatetimeString(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function DishForm({ initialData, merchantId, onSuccess }: DishFormProps) {
  const router = useRouter()
  const t = useTranslations('dishForm')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [quantity, setQuantity] = useState(initialData?.quantity_available ?? 1)
  const [pickupStart, setPickupStart] = useState(toLocalDatetimeString(initialData?.pickup_start ?? null))
  const [pickupEnd, setPickupEnd] = useState(toLocalDatetimeString(initialData?.pickup_end ?? null))
  const [bringOwnContainer, setBringOwnContainer] = useState(initialData?.bring_own_container ?? false)
  const [isVegetarian, setIsVegetarian] = useState(initialData?.is_vegetarian ?? false)
  const [isVegan, setIsVegan] = useState(initialData?.is_vegan ?? false)
  const [isFrozen, setIsFrozen] = useState(initialData?.is_frozen ?? false)
  const [expiresAt, setExpiresAt] = useState(toLocalDatetimeString(initialData?.expires_at ?? null))
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients ?? [])
  const [ingredientInput, setIngredientInput] = useState('')
  const [allergens, setAllergens] = useState<string[]>(initialData?.allergens ?? [])

  const [autoExpire, setAutoExpire] = useState(initialData ? true : false)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url ?? null)
  const [dragging, setDragging] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tried, setTried] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  function processFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function addIngredient(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const value = ingredientInput.trim()
    if (value && !ingredients.includes(value)) {
      setIngredients([...ingredients, value])
    }
    setIngredientInput('')
  }

  function removeIngredient(name: string) {
    setIngredients(ingredients.filter((i) => i !== name))
  }

  function toggleAllergen(allergen: string) {
    setAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen],
    )
  }

  const hasImage = !!(imagePreview || imageFile)
  const step0Complete = !!title.trim() && hasImage

  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {}

    if (s === 0) {
      if (!title.trim()) errs.title = t('web.titleRequired')
      if (!hasImage) errs.image = t('web.photoRequired')
    }

    if (s === 1) {
      if (quantity < 1) errs.quantity = t('web.quantityMin')
      if (!pickupStart) errs.pickupStart = t('web.pickupFromRequired')
      if (!isFrozen && !expiresAt) errs.expiresAt = t('web.expiresRequired')
    }

    if (s === 2) {
      if (!autoExpire) errs.autoExpire = t('web.autoExpireRequired')
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function goNext() {
    setTried(true)
    if (!validateStep(step)) return
    setTried(false)
    setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goBack() {
    setTried(false)
    setErrors({})
    setStep((s) => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validateStep(step)) return

    setLoading(true)

    try {
      let imageUrl = initialData?.image_url ?? null

      const dishId = initialData?.id ?? crypto.randomUUID()

      if (imageFile) {
        const timestamp = Date.now()
        const filePath = `${merchantId}/${dishId}-${timestamp}.webp`

        if (initialData?.image_url) {
          const oldUrl = new URL(initialData.image_url)
          const oldPathParts = oldUrl.pathname.split('/dish-images/')
          if (oldPathParts[1]) {
            await supabase.storage.from('dish-images').remove([oldPathParts[1]])
          }
        }

        const { error: uploadError } = await supabase.storage
          .from('dish-images')
          .upload(filePath, imageFile, { contentType: imageFile.type, upsert: true })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('dish-images').getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      const dishRecord = {
        id: dishId,
        merchant_id: merchantId,
        title: title.trim(),
        description: description.trim() || null,
        image_url: imageUrl,
        quantity_available: quantity,
        pickup_start: pickupStart ? new Date(pickupStart).toISOString() : null,
        pickup_end: pickupEnd ? new Date(pickupEnd).toISOString() : null,
        bring_own_container: bringOwnContainer,
        is_vegetarian: isVegetarian,
        is_vegan: isVegan,
        is_frozen: isFrozen,
        expires_at: !isFrozen && expiresAt ? new Date(expiresAt).toISOString() : null,
        ...(initialData ? {} : { status: 'available' as const }),
      }

      const { error: dishError } = await supabase
        .from('dishes')
        .upsert(dishRecord, { onConflict: 'id' })

      if (dishError) throw dishError

      await supabase.from('dish_ingredients').delete().eq('dish_id', dishId)
      await supabase.from('dish_allergies').delete().eq('dish_id', dishId)

      if (ingredients.length > 0) {
        const { error: ingError } = await supabase
          .from('dish_ingredients')
          .insert(ingredients.map((name) => ({ dish_id: dishId, name })))
        if (ingError) throw ingError
      }

      if (allergens.length > 0) {
        const { error: allError } = await supabase
          .from('dish_allergies')
          .insert(allergens.map((allergen) => ({ dish_id: dishId, allergen })))
        if (allError) throw allError
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/aanbieder/dishes')
        router.refresh()
      }
    } catch (err) {
      console.error('Dish save error:', err)
      setErrors({ submit: t('web.submitError') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          {STEP_KEYS.map((key, i) => (
            <div key={key} className={`flex items-center ${i < STEP_KEYS.length - 1 ? 'flex-1' : ''}`}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    i < step
                      ? 'bg-brand-500 text-white'
                      : i === step
                        ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                        : 'bg-warm-100 text-warm-400'
                  }`}
                >
                  {i < step ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`mt-1.5 text-xs font-semibold ${
                    i <= step ? 'text-brand-700' : 'text-warm-400'
                  }`}
                >
                  {t(`steps.${key}`)}
                </span>
              </div>
              {i < STEP_KEYS.length - 1 && (
                <div className="mx-3 mb-5 h-0.5 flex-1">
                  <div
                    className={`h-full rounded-full transition-colors ${
                      i < step ? 'bg-brand-500' : 'bg-warm-100'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Basic info */}
      {step === 0 && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h2 className="mb-1 text-lg font-bold text-warm-900">{t('web.step0Title')}</h2>
            <p className="mb-5 text-sm text-warm-500">{t('web.step0Subtitle')}</p>
            <div className="space-y-4">
              <Input
                label={<>{t('fields.titleLabel').replace(' *', '')} <span className="text-red-500">*</span></>}
                placeholder={t('fields.titlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={tried && !title.trim() ? t('web.titleRequired') : undefined}
                required
              />

              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-warm-800">
                  {t('fields.descriptionLabel')}
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('fields.descriptionPlaceholder')}
                  rows={3}
                  className="w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-base sm:text-sm text-warm-800 placeholder:text-warm-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-warm-800">
                  {t('web.photoLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 ${
                    tried && !hasImage
                      ? 'border-red-300 bg-red-50/50'
                      : dragging
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-warm-200 bg-warm-50/50 hover:border-warm-300 hover:bg-warm-50'
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={imagePreview}
                        alt={title || t('fields.titleLabel').replace(' *', '')}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 500px"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-warm-900/0 transition-colors hover:bg-warm-900/40">
                        <span className="rounded-lg bg-white/90 px-3 py-1.5 text-sm font-semibold text-warm-700 opacity-0 shadow transition-opacity hover:opacity-100 [div:hover>&]:opacity-100">
                          {t('web.photoChange')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center px-6 py-10">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`mb-3 h-10 w-10 ${tried && !hasImage ? 'text-red-300' : 'text-warm-300'}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21ZM16.5 7.5a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0Z" />
                      </svg>
                      <p className="text-sm font-semibold text-warm-600">
                        {t('web.photoDrop')} <span className="text-brand-600">{t('web.photoClick')}</span>
                      </p>
                      <p className="mt-1 text-xs text-warm-400">{t('web.photoTypes')}</p>
                    </div>
                  )}
                </div>
                {tried && !hasImage && (
                  <p className="mt-2 text-sm text-red-600">{t('web.photoRequired')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Pickup & availability */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h2 className="mb-1 text-lg font-bold text-warm-900">{t('web.step1Title')}</h2>
            <p className="mb-5 text-sm text-warm-500">{t('web.step1Subtitle')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('web.quantityLabel')}
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                error={errors.quantity}
              />
              <div className="hidden sm:block" />
              <Input
                label={<>{t('fields.pickupStartLabel').replace(' *', '')} <span className="text-red-500">*</span></>}
                type="datetime-local"
                value={pickupStart}
                onChange={(e) => {
                  const val = e.target.value
                  setPickupStart(val)
                  if (val && !pickupEnd) {
                    const d = new Date(val)
                    d.setHours(d.getHours() + 1)
                    setPickupEnd(toLocalDatetimeString(d.toISOString()))
                  }
                }}
                error={errors.pickupStart}
                required
              />
              <Input
                label={t('web.pickupUntilLabel')}
                type="datetime-local"
                value={pickupEnd}
                onChange={(e) => setPickupEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-bold text-warm-900">{t('web.storageLabel')}</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsFrozen(false)}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-colors ${
                  !isFrozen
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-warm-200 text-warm-500 hover:border-warm-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto mb-1 h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
                {t('fields.fresh')}
              </button>
              <button
                type="button"
                onClick={() => setIsFrozen(true)}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-colors ${
                  isFrozen
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-warm-200 text-warm-500 hover:border-warm-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto mb-1 h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M12 6l-3-3m3 3 3-3M12 18l-3 3m3-3 3 3M2 12h20M6 12l-3-3m3 3-3 3M18 12l3-3m-3 3 3 3M7.05 4.93l9.9 9.9M7.05 4.93 5.64 7.76m1.41-2.83 2.83 1.42M16.95 19.07l-2.83-1.42m2.83 1.42 1.41-2.83M16.95 4.93l-9.9 9.9M16.95 4.93l1.41 2.83m-1.41-2.83-2.83 1.42M7.05 19.07l2.83-1.42m-2.83 1.42L5.64 16.24" />
                </svg>
                {t('fields.frozen')}
              </button>
            </div>
            {!isFrozen && (
              <div className="mt-4">
                <Input
                  label={t('fields.expiresLabel').replace(' *', '')}
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  error={errors.expiresAt}
                />
                <p className="mt-1 text-xs text-warm-400">{t('web.expiresHint')}</p>
              </div>
            )}
            {isFrozen && (
              <p className="mt-3 text-sm text-warm-500">
                {t('web.frozenNote')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h2 className="mb-1 text-lg font-bold text-warm-900">{t('web.step2Title')}</h2>
            <p className="mb-4 text-sm text-warm-500">{t('web.step2Subtitle')}</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm text-warm-800">
                <input
                  type="checkbox"
                  checked={bringOwnContainer}
                  onChange={(e) => setBringOwnContainer(e.target.checked)}
                  className={CHECKBOX}
                />
                <span className="font-medium">{t('fields.bringOwnContainer')}</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-warm-800">
                <input
                  type="checkbox"
                  checked={isVegetarian}
                  onChange={(e) => setIsVegetarian(e.target.checked)}
                  className={CHECKBOX}
                />
                <span className="font-medium">{t('fields.vegetarian')}</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-warm-800">
                <input
                  type="checkbox"
                  checked={isVegan}
                  onChange={(e) => setIsVegan(e.target.checked)}
                  className={CHECKBOX}
                />
                <span className="font-medium">{t('fields.vegan')}</span>
              </label>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h2 className="mb-1 text-lg font-bold text-warm-900">{t('web.ingredientsTitle')}</h2>
            <p className="mb-4 text-sm text-warm-500">{t('web.ingredientsSubtitle')}</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {ingredients.map((ing) => (
                <span
                  key={ing}
                  className="inline-flex items-center gap-1 rounded-xl bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-800"
                >
                  {ing}
                  <button
                    type="button"
                    onClick={() => removeIngredient(ing)}
                    className="ml-1 text-brand-400 hover:text-brand-700"
                    aria-label={t('web.removeIngredient', { name: ing })}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <Input
              placeholder={t('web.ingredientPlaceholder')}
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyDown={addIngredient}
            />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h2 className="mb-1 text-lg font-bold text-warm-900">{t('web.allergensTitle')}</h2>
            <p className="mb-3 text-sm text-warm-500">{t('web.allergensSubtitle')}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {ALL_ALLERGENS.map((key) => (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                    allergens.includes(key)
                      ? 'border-brand-400 bg-brand-50 text-brand-800'
                      : 'border-warm-200 bg-white text-warm-600 hover:border-warm-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={allergens.includes(key)}
                    onChange={() => toggleAllergen(key)}
                    className="sr-only"
                  />
                  {t(`web.allergens.${key}`)}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-card">
            <label className="flex items-start gap-3 text-sm text-warm-800">
              <input
                type="checkbox"
                checked={autoExpire}
                onChange={(e) => setAutoExpire(e.target.checked)}
                className={`mt-0.5 ${CHECKBOX}`}
              />
              <span className="font-medium">
                {t('web.autoExpireLabel')}
              </span>
            </label>
            {errors.autoExpire && (
              <p className="mt-2 text-sm text-red-600">{errors.autoExpire}</p>
            )}
          </div>
        </div>
      )}

      {errors.submit && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {errors.submit}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-8 flex items-center gap-3">
        {step === 0 && (
          <button
            type="button"
            onClick={() => router.push('/aanbieder/dishes')}
            className="text-sm font-semibold text-warm-500 transition-colors hover:text-warm-700"
          >
            {t('actions.cancel')}
          </button>
        )}
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={loading}
          >
            {t('web.previous')}
          </Button>
        )}
        <div className="flex-1" />
        {step < STEP_KEYS.length - 1 ? (
          <Button
            type="button"
            variant="primary"
            onClick={goNext}
            className={step === 0 && !step0Complete ? 'opacity-50' : ''}
          >
            {t('web.next')}
          </Button>
        ) : (
          <Button type="submit" variant="primary" loading={loading}>
            {initialData ? t('web.saveEdit') : t('web.submitCreate')}
          </Button>
        )}
      </div>
    </form>
  )
}
