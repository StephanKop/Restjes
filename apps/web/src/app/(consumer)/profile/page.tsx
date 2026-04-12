import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { ProfileForm } from './ProfileForm'

export const metadata: Metadata = {
  title: 'Mijn profiel',
}

export default async function ProfilePage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createServerComponentClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, city, phone')
    .eq('id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-3xl font-extrabold text-warm-900">Mijn profiel</h1>
      <p className="mb-8 text-warm-500">Beheer je persoonlijke gegevens</p>

      <div className="rounded-2xl bg-white p-8 shadow-card" data-reveal>
        <ProfileForm
          userId={user.id}
          email={user.email ?? ''}
          profile={{
            display_name: profile?.display_name ?? '',
            avatar_url: profile?.avatar_url ?? null,
            city: profile?.city ?? '',
            phone: profile?.phone ?? '',
          }}
        />
      </div>
    </div>
  )
}
