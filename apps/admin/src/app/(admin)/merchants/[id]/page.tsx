import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-admin'
import { formatDate, formatDateTime } from '@/lib/format'
import { StatusBadge } from '@/components/StatusBadge'
import { VerifyToggle } from './VerifyToggle'
import { EditMerchantForm } from './EditMerchantForm'

export const metadata: Metadata = {
  title: 'Aanbieder details',
}

interface MerchantDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function MerchantDetailPage({ params }: MerchantDetailPageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  const [
    { data: merchant },
    { data: dishes },
    { data: reservations },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from('merchants')
      .select('*, profile:profiles!merchants_profile_id_fkey(id, display_name, city, phone)')
      .eq('id', id)
      .single(),
    supabase
      .from('dishes')
      .select('id, title, status, quantity_available, created_at, image_url')
      .eq('merchant_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('reservations')
      .select('id, status, quantity, created_at, consumer:profiles!reservations_consumer_id_fkey(display_name), dish:dishes!inner(title)')
      .eq('merchant_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, consumer:profiles!reviews_consumer_id_fkey(display_name)')
      .eq('merchant_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  if (!merchant) notFound()

  const profile = merchant.profile as unknown as { id: string; display_name: string; city: string | null; phone: string | null } | null

  return (
    <div>
      <div className="mb-6">
        <Link href="/merchants" className="text-sm text-warm-500 hover:text-warm-700">
          &larr; Terug naar aanbieders
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          {merchant.logo_url ? (
            <Image src={merchant.logo_url} alt={merchant.business_name} width={56} height={56} className="h-14 w-14 rounded-xl object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100 text-xl font-bold text-brand-700">
              {merchant.business_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-warm-900">{merchant.business_name}</h1>
              {merchant.is_verified ? (
                <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Geverifieerd</span>
              ) : (
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Niet geverifieerd</span>
              )}
            </div>
            {profile && (
              <Link href={`/users/${profile.id}`} className="text-sm text-warm-500 hover:text-brand-600">
                Eigenaar: {profile.display_name}
              </Link>
            )}
          </div>
        </div>
        <VerifyToggle merchantId={id} isVerified={merchant.is_verified} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Merchant info */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl bg-white p-5 shadow-card">
            <h2 className="mb-4 font-bold text-warm-900">Bedrijfsgegevens</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-warm-500">Adres</dt>
                <dd className="font-medium text-warm-800">
                  {[merchant.address_line1, merchant.address_line2, merchant.postal_code, merchant.city].filter(Boolean).join(', ') || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-warm-500">Telefoon</dt>
                <dd className="font-medium text-warm-800">{merchant.phone ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-warm-500">Website</dt>
                <dd className="font-medium text-warm-800">{merchant.website ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-warm-500">KvK-nummer</dt>
                <dd className="font-medium text-warm-800">{merchant.kvk_number ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-warm-500">Beoordeling</dt>
                <dd className="font-medium text-warm-800">
                  {merchant.review_count > 0
                    ? `${Number(merchant.avg_rating).toFixed(1)} (${merchant.review_count} beoordelingen)`
                    : 'Geen beoordelingen'}
                </dd>
              </div>
              <div>
                <dt className="text-warm-500">Coordinaten</dt>
                <dd className="font-medium text-warm-800">
                  {merchant.latitude && merchant.longitude
                    ? `${merchant.latitude.toFixed(4)}, ${merchant.longitude.toFixed(4)}`
                    : 'Niet ingesteld'}
                </dd>
              </div>
              <div>
                <dt className="text-warm-500">Aangemeld</dt>
                <dd className="font-medium text-warm-800">{formatDateTime(merchant.created_at)}</dd>
              </div>
            </dl>

            <div className="mt-5">
              <EditMerchantForm
                merchantId={id}
                currentData={{
                  business_name: merchant.business_name,
                  description: merchant.description ?? '',
                  city: merchant.city ?? '',
                  phone: merchant.phone ?? '',
                  website: merchant.website ?? '',
                  address_line1: merchant.address_line1 ?? '',
                  postal_code: merchant.postal_code ?? '',
                }}
              />
            </div>
          </div>

          {merchant.description && (
            <div className="rounded-xl bg-white p-5 shadow-card">
              <h2 className="mb-2 font-bold text-warm-900">Beschrijving</h2>
              <p className="text-sm text-warm-600">{merchant.description}</p>
            </div>
          )}
        </div>

        {/* Dishes & Reservations */}
        <div className="space-y-6 lg:col-span-2">
          {/* Dishes */}
          <div className="rounded-xl bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-warm-100 px-5 py-4">
              <h2 className="font-bold text-warm-900">Gerechten ({dishes?.length ?? 0})</h2>
            </div>
            <div className="divide-y divide-warm-50">
              {(dishes ?? []).map((dish) => (
                <Link
                  key={dish.id}
                  href={`/dishes/${dish.id}`}
                  className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-warm-50"
                >
                  <div className="flex items-center gap-3">
                    {dish.image_url ? (
                      <Image src={dish.image_url} alt={dish.title} width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-100 text-warm-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 3h18M3 3v18m0-18 3.75 3.75M21 3v18m0-18-3.75 3.75M3 21h18" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-warm-800">{dish.title}</p>
                      <p className="text-xs text-warm-500">Aantal: {dish.quantity_available} · {formatDate(dish.created_at)}</p>
                    </div>
                  </div>
                  <StatusBadge status={dish.status} type="dish" />
                </Link>
              ))}
              {(!dishes || dishes.length === 0) && (
                <p className="px-5 py-4 text-sm text-warm-400">Geen gerechten</p>
              )}
            </div>
          </div>

          {/* Reservations */}
          <div className="rounded-xl bg-white shadow-card">
            <div className="border-b border-warm-100 px-5 py-4">
              <h2 className="font-bold text-warm-900">Reserveringen ({reservations?.length ?? 0})</h2>
            </div>
            <div className="divide-y divide-warm-50">
              {(reservations ?? []).map((res) => {
                const consumer = res.consumer as unknown as { display_name: string | null } | null
                const dish = res.dish as unknown as { title: string }
                return (
                  <Link
                    key={res.id}
                    href={`/reservations/${res.id}`}
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-warm-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-warm-800">{dish.title}</p>
                      <p className="text-xs text-warm-500">
                        {consumer?.display_name ?? 'Onbekend'} · {res.quantity}x · {formatDate(res.created_at)}
                      </p>
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
          <div className="rounded-xl bg-white shadow-card">
            <div className="border-b border-warm-100 px-5 py-4">
              <h2 className="font-bold text-warm-900">Beoordelingen ({reviews?.length ?? 0})</h2>
            </div>
            <div className="divide-y divide-warm-50">
              {(reviews ?? []).map((review) => {
                const consumer = review.consumer as unknown as { display_name: string | null } | null
                return (
                  <div key={review.id} className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-warm-200'}`}>
                            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-warm-500">{consumer?.display_name ?? 'Onbekend'}</span>
                      <span className="text-xs text-warm-400">{formatDate(review.created_at)}</span>
                    </div>
                    {review.comment && <p className="mt-1 text-sm text-warm-600">{review.comment}</p>}
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
