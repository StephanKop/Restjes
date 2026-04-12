import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-admin'
import { formatDate, formatDateTime } from '@/lib/format'
import { StatusBadge } from '@/components/StatusBadge'
import { EditProfileForm } from './EditProfileForm'
import { DeleteUserButton } from './DeleteUserButton'

export const metadata: Metadata = {
  title: 'Gebruiker details',
}

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  const [
    { data: profile },
    { data: authData },
    { data: merchant },
    { data: reservations },
    { data: reviews },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.auth.admin.getUserById(id),
    supabase.from('merchants').select('id, business_name').eq('profile_id', id).maybeSingle(),
    supabase
      .from('reservations')
      .select('id, status, created_at, quantity, dish:dishes!inner(title)')
      .eq('consumer_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, merchant:merchants!inner(business_name)')
      .eq('consumer_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  if (!profile) notFound()

  const user = authData?.user

  return (
    <div>
      <div className="mb-6">
        <Link href="/users" className="text-sm text-warm-500 hover:text-warm-700">
          &larr; Terug naar gebruikers
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
            {(profile.display_name ?? '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-warm-900">{profile.display_name}</h1>
            <p className="text-sm text-warm-500">{user?.email ?? 'Geen e-mail'}</p>
            {merchant && (
              <Link href={`/merchants/${merchant.id}`} className="text-sm text-brand-600 hover:text-brand-700">
                Aanbieder: {merchant.business_name}
              </Link>
            )}
          </div>
        </div>
        <DeleteUserButton userId={id} userName={profile.display_name} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile info & edit */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-white p-5 shadow-card">
            <h2 className="mb-4 font-bold text-warm-900">Profielgegevens</h2>
            <dl className="mb-6 space-y-3 text-sm">
              <div>
                <dt className="text-warm-500">Stad</dt>
                <dd className="font-medium text-warm-800">{profile.city ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-warm-500">Telefoon</dt>
                <dd className="font-medium text-warm-800">{profile.phone ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-warm-500">Aangemeld</dt>
                <dd className="font-medium text-warm-800">{formatDateTime(profile.created_at)}</dd>
              </div>
              <div>
                <dt className="text-warm-500">Laatst bijgewerkt</dt>
                <dd className="font-medium text-warm-800">{formatDateTime(profile.updated_at)}</dd>
              </div>
              <div>
                <dt className="text-warm-500">Auth provider</dt>
                <dd className="font-medium text-warm-800">{user?.app_metadata?.provider ?? 'email'}</dd>
              </div>
            </dl>

            <EditProfileForm
              userId={id}
              currentName={profile.display_name}
              currentCity={profile.city ?? ''}
              currentPhone={profile.phone ?? ''}
            />
          </div>
        </div>

        {/* Reservations */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white shadow-card">
            <div className="border-b border-warm-100 px-5 py-4">
              <h2 className="font-bold text-warm-900">Reserveringen ({reservations?.length ?? 0})</h2>
            </div>
            <div className="divide-y divide-warm-50">
              {(reservations ?? []).map((res) => {
                const dish = res.dish as unknown as { title: string }
                return (
                  <Link
                    key={res.id}
                    href={`/reservations/${res.id}`}
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-warm-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-warm-800">{dish.title}</p>
                      <p className="text-xs text-warm-500">{res.quantity}x · {formatDate(res.created_at)}</p>
                    </div>
                    <StatusBadge status={res.status} type="reservation" />
                  </Link>
                )
              })}
              {(!reservations || reservations.length === 0) && (
                <p className="px-5 py-4 text-sm text-warm-400">Geen reserveringen</p>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-6 rounded-xl bg-white shadow-card">
            <div className="border-b border-warm-100 px-5 py-4">
              <h2 className="font-bold text-warm-900">Beoordelingen ({reviews?.length ?? 0})</h2>
            </div>
            <div className="divide-y divide-warm-50">
              {(reviews ?? []).map((review) => {
                const merchant = review.merchant as unknown as { business_name: string }
                return (
                  <div key={review.id} className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-warm-200'}`}
                          >
                            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-warm-500">{merchant.business_name}</span>
                      <span className="text-xs text-warm-400">{formatDate(review.created_at)}</span>
                    </div>
                    {review.comment && (
                      <p className="mt-1 text-sm text-warm-600">{review.comment}</p>
                    )}
                  </div>
                )
              })}
              {(!reviews || reviews.length === 0) && (
                <p className="px-5 py-4 text-sm text-warm-400">Geen beoordelingen</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
