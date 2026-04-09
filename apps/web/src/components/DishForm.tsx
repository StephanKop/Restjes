'use client'

import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const ALLERGEN_LABELS: Record<string, string> = {
  gluten: 'Gluten',
  crustaceans: 'Schaaldieren',
  eggs: 'Eieren',
  fish: 'Vis',
  peanuts: "Pinda's",
  soybeans: 'Soja',
  milk: 'Melk',
  nuts: 'Noten',
  celery: 'Selderij',
  mustard: 'Mosterd',
  sesame: 'Sesam',
  sulphites: 'Sulfieten',
  lupin: 'Lupine',
  molluscs: 'Weekdieren',
}

const ALL_ALLERGENS = Object.keys(ALLERGEN_LABELS)

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [quantity, setQuantity] = useState(initialData?.quantity_available ?? 1)
  const [pickupStart, setPickupStart] = useState(toLocalDatetimeString(initialData?.pickup_start ?? null))
  const [pickupEnd, setPickupEnd] = useState(toLocalDatetimeString(initialData?.pickup_end ?? null))
  const [bringOwnContainer, setBringOwnContainer] = useState(initialData?.bring_own_container ?? false)
  const [isVegetarian, setIsVegetarian] = useState(initialData?.is_vegetarian ?? false)
  const [isVegan, setIsVegan] = useState(initialData?.is_vegan ?? false)
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients ?? [])
  const [ingredientInput, setIngredientInput] = useState('')
  const [allergens, setAllergens] = useState<string[]>(initialData?.allergens ?? [])

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url ?? null)

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
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

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Titel is verplicht'
    if (quantity < 1) errs.quantity = 'Minimaal 1'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      let imageUrl = initialData?.image_url ?? null

      // Determine dish ID for storage path
      const dishId = initialData?.id ?? crypto.randomUUID()

      // Upload image if a new file was selected
      if (imageFile) {
        const timestamp = Date.now()
        const filePath = `${merchantId}/${dishId}-${timestamp}.webp`

        // Remove old image if replacing
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
        ...(initialData ? {} : { status: 'available' as const }),
      }

      const { error: dishError } = await supabase
        .from('dishes')
        .upsert(dishRecord, { onConflict: 'id' })

      if (dishError) throw dishError

      // Delete existing ingredients and allergens, then re-insert
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
      setErrors({ submit: 'Er ging iets mis bij het opslaan. Probeer het opnieuw.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic info */}
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold text-warm-900">Basisgegevens</h2>
        <div className="space-y-4">
          <Input
            label="Titel"
            placeholder="Bijv. Pasta bolognese"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            required
          />

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-warm-800">
              Beschrijving
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschrijf je gerecht..."
              rows={3}
              className="w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-warm-800 placeholder:text-warm-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-warm-800">Foto</label>
            <div className="flex items-start gap-4">
              {imagePreview && (
                <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-warm-200">
                  <Image
                    src={imagePreview}
                    alt="Voorbeeld"
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm"
                >
                  {imagePreview ? 'Foto wijzigen' : 'Foto uploaden'}
                </Button>
                <p className="mt-1 text-xs text-warm-400">JPG, PNG of WebP</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pickup & quantity */}
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold text-warm-900">Ophalen &amp; beschikbaarheid</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Aantal beschikbaar"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            error={errors.quantity}
          />
          <div /> {/* spacer */}
          <Input
            label="Ophalen vanaf"
            type="datetime-local"
            value={pickupStart}
            onChange={(e) => setPickupStart(e.target.value)}
          />
          <Input
            label="Ophalen tot"
            type="datetime-local"
            value={pickupEnd}
            onChange={(e) => setPickupEnd(e.target.value)}
          />
        </div>
      </div>

      {/* Dietary & container */}
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold text-warm-900">Dieet &amp; verpakking</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-sm text-warm-800">
            <input
              type="checkbox"
              checked={bringOwnContainer}
              onChange={(e) => setBringOwnContainer(e.target.checked)}
              className="h-5 w-5 rounded-lg border-warm-300 text-brand-500 focus:ring-brand-400"
            />
            <span className="font-medium">Eigen bakje meenemen</span>
          </label>
          <label className="flex items-center gap-3 text-sm text-warm-800">
            <input
              type="checkbox"
              checked={isVegetarian}
              onChange={(e) => setIsVegetarian(e.target.checked)}
              className="h-5 w-5 rounded-lg border-warm-300 text-brand-500 focus:ring-brand-400"
            />
            <span className="font-medium">Vegetarisch</span>
          </label>
          <label className="flex items-center gap-3 text-sm text-warm-800">
            <input
              type="checkbox"
              checked={isVegan}
              onChange={(e) => setIsVegan(e.target.checked)}
              className="h-5 w-5 rounded-lg border-warm-300 text-brand-500 focus:ring-brand-400"
            />
            <span className="font-medium">Veganistisch</span>
          </label>
        </div>
      </div>

      {/* Ingredients */}
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold text-warm-900">Ingrediënten</h2>
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
                aria-label={`Verwijder ${ing}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <Input
          placeholder="Typ een ingrediënt en druk op Enter"
          value={ingredientInput}
          onChange={(e) => setIngredientInput(e.target.value)}
          onKeyDown={addIngredient}
        />
      </div>

      {/* Allergens */}
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold text-warm-900">Allergenen</h2>
        <p className="mb-3 text-sm text-warm-500">Selecteer de aanwezige allergenen (EU-14).</p>
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
              {ALLERGEN_LABELS[key]}
            </label>
          ))}
        </div>
      </div>

      {errors.submit && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {errors.submit}
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="submit" variant="primary" loading={loading}>
          {initialData ? 'Opslaan' : 'Gerecht plaatsen'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/aanbieder/dishes')}
          disabled={loading}
        >
          Annuleren
        </Button>
      </div>
    </form>
  )
}
