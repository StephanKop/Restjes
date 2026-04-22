import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { DishForm } from '@/components/DishForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('aanbieder.web')
  return { title: t('newDishMetadataTitle') }
}

export default async function NewDishPage() {
  const user = await getUser()
  const t = await getTranslations('aanbieder.web')

  if (!user) {
    redirect('/login')
  }

  const supabase = await createServerComponentClient()
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!merchant) {
    redirect('/aanbieder/profile?setup=aanbieder')
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-extrabold text-warm-900">{t('newDishHeading')}</h1>
      <DishForm merchantId={merchant.id} />
    </div>
  )
}
