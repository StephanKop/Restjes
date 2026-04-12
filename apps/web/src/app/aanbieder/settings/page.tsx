import { redirect } from 'next/navigation'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { MerchantSettingsForm } from './MerchantSettingsForm'

export const metadata = {
  title: 'Instellingen - Kliekjesclub Aanbieder',
}

export default async function MerchantSettingsPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createServerComponentClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const { data: merchant } = await supabase
    .from('merchants')
    .select(
      'id, profile_id, description, address_line1, address_line2, city, postal_code, phone, website, logo_url',
    )
    .eq('profile_id', user.id)
    .single()

  const isOnboarding = !merchant

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-3xl font-extrabold text-warm-900">
        {isOnboarding ? 'Stel je aanbiedersprofiel in' : 'Instellingen'}
      </h1>
      {isOnboarding && (
        <p className="mb-8 text-warm-500">
          Vul je gegevens in zodat anderen weten waar ze je kliekjes kunnen ophalen.
        </p>
      )}

      <div className="rounded-2xl bg-white p-8 shadow-card">
        <MerchantSettingsForm
          merchant={merchant}
          userId={user.id}
          displayName={profile?.display_name ?? ''}
        />
      </div>
    </div>
  )
}
