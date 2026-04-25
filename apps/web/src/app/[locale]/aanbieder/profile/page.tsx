import type { Metadata } from 'next'
import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { ProfileForm } from '@/app/[locale]/(consumer)/profile/ProfileForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('aanbieder.web')
  return { title: t('profileMetadataTitle') }
}

interface AanbiederProfilePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AanbiederProfilePage({ searchParams }: AanbiederProfilePageProps) {
  const params = await searchParams
  const isSetup = params.setup === 'aanbieder'
  const t = await getTranslations('aanbieder.web')
  const locale = await getLocale()

  const user = await getUser()

  if (!user) {
    redirect('/login', locale)
  }

  const supabase = await createServerComponentClient()

  const [{ data: profile }, { data: merchant }] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, avatar_url, city, phone')
      .eq('id', user.id)
      .single(),
    supabase
      .from('merchants')
      .select(
        'id, profile_id, description, address_line1, address_line2, postal_code, logo_url',
      )
      .eq('profile_id', user.id)
      .single(),
  ])

  return (
    <div className="mx-auto max-w-2xl">
      {isSetup && !merchant && (
        <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <h2 className="mb-1 text-base font-bold text-brand-800">
            {t('setupMerchantTitle')}
          </h2>
          <p className="text-sm text-brand-700">
            {t('setupMerchantBody')}
          </p>
        </div>
      )}

      <h1 className="mb-2 text-3xl font-extrabold text-warm-900">{t('profileHeading')}</h1>
      <p className="mb-8 text-warm-500">{t('profileSubheading')}</p>

      <ProfileForm
        userId={user.id}
        email={user.email ?? ''}
        profile={{
          display_name: profile?.display_name ?? '',
          avatar_url: profile?.avatar_url ?? null,
          city: profile?.city ?? '',
          phone: profile?.phone ?? '',
        }}
        merchant={merchant}
      />
    </div>
  )
}
