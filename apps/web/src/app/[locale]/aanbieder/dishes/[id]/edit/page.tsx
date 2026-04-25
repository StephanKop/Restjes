import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { DishForm } from '@/components/DishForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('aanbieder.web')
  return { title: t('editDishMetadataTitle') }
}

interface EditDishPageProps {
  params: Promise<{ id: string }>
}

export default async function EditDishPage({ params }: EditDishPageProps) {
  const { id } = await params
  const t = await getTranslations('aanbieder.web')
  const locale = await getLocale()
  const user = await getUser()

  if (!user) {
    redirect('/login', locale)
  }

  const supabase = await createServerComponentClient()
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!merchant) {
    redirect('/aanbieder/profile?setup=aanbieder', locale)
  }

  // Fetch dish and verify ownership
  const { data: dish } = await supabase
    .from('dishes')
    .select('*')
    .eq('id', id)
    .eq('merchant_id', merchant.id)
    .single()

  if (!dish) {
    notFound()
  }

  // Fetch ingredients
  const { data: ingredientRows } = await supabase
    .from('dish_ingredients')
    .select('name')
    .eq('dish_id', id)

  // Fetch allergens
  const { data: allergenRows } = await supabase
    .from('dish_allergies')
    .select('allergen')
    .eq('dish_id', id)

  const initialData = {
    id: dish.id as string,
    title: dish.title as string,
    description: dish.description as string | null,
    image_url: dish.image_url as string | null,
    quantity_available: dish.quantity_available as number,
    status: dish.status as string,
    pickup_start: dish.pickup_start as string | null,
    pickup_end: dish.pickup_end as string | null,
    bring_own_container: dish.bring_own_container as boolean,
    is_vegetarian: dish.is_vegetarian as boolean,
    is_vegan: dish.is_vegan as boolean,
    is_frozen: dish.is_frozen as boolean,
    expires_at: dish.expires_at as string | null,
    ingredients: (ingredientRows ?? []).map((r) => r.name as string),
    allergens: (allergenRows ?? []).map((r) => r.allergen as string),
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-extrabold text-warm-900">{t('editDishHeading')}</h1>
      <DishForm initialData={initialData} merchantId={merchant.id} />
    </div>
  )
}
