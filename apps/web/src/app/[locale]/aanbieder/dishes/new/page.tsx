import type { Metadata } from 'next'
import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { DishForm } from '@/components/DishForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('aanbieder.web')
  return { title: t('newDishMetadataTitle') }
}

export default async function NewDishPage() {
  const user = await getUser()
  const t = await getTranslations('aanbieder.web')
  const locale = await getLocale()

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

  return (
    <div>
      <h1 className="mb-8 text-3xl font-extrabold text-warm-900">{t('newDishHeading')}</h1>
      <DishForm merchantId={merchant.id} />
    </div>
  )
}
