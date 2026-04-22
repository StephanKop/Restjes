import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { ReviewPageForm } from '@/components/ReviewPageForm'
import { StarRating } from '@/components/StarRating'
import { CookingPotIcon, StorefrontIcon, CheckBadgeIcon } from '@/components/icons'
import { formatRelativeDate } from '@/lib/format'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('reviews.webPage')
  return { title: t('metadataTitle') }
}

interface ReviewPageProps {
  params: Promise<{ reservationId: string }>
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { reservationId } = await params
  const t = await getTranslations('reviews.webPage')
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createServerComponentClient()

  // Fetch reservation with dish and merchant
  const { data: reservation, error } = await supabase
    .from('reservations')
    .select(`
      id,
      status,
      quantity,
      created_at,
      dish:dishes!inner (
        id,
        title,
        description,
        image_url
      ),
      merchant:merchants!inner (
        id,
        business_name,
        city,
        logo_url,
        is_verified
      )
    `)
    .eq('id', reservationId)
    .eq('consumer_id', user.id)
    .single()

  if (error || !reservation) {
    notFound()
  }

  if (reservation.status !== 'collected') {
    redirect('/reservations')
  }

  const dish = reservation.dish as unknown as {
    id: string
    title: string
    description: string | null
    image_url: string | null
  }
  const merchant = reservation.merchant as unknown as {
    id: string
    business_name: string
    city: string
    logo_url: string | null
    is_verified: boolean
  }

  // Check for existing review
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at')
    .eq('consumer_id', user.id)
    .eq('reservation_id', reservationId)
    .single()

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back link */}
      <Link
        href="/reservations"
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <span aria-hidden="true">&larr;</span> {t('backLink')}
      </Link>

      {/* Dish context card */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-card">
        {/* Dish hero */}
        <div className="relative aspect-[3/1] bg-warm-100">
          {dish.image_url ? (
            <Image
              src={dish.image_url}
              alt={dish.title}
              fill
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600">
              <CookingPotIcon className="h-16 w-16 text-white/60" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5">
            <h1 className="text-2xl font-extrabold text-white drop-shadow-sm">
              {dish.title}
            </h1>
          </div>
        </div>

        {/* Merchant row */}
        <div className="flex items-center gap-3 border-b border-warm-100 px-5 py-4">
          {merchant.logo_url ? (
            <Image
              src={merchant.logo_url}
              alt={merchant.business_name}
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100">
              <StorefrontIcon className="h-4 w-4 text-brand-600" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-warm-900">{merchant.business_name}</span>
              {merchant.is_verified && (
                <CheckBadgeIcon className="h-4 w-4 text-brand-500" />
              )}
            </div>
            <span className="text-xs text-warm-500">{merchant.city}</span>
          </div>
        </div>

        {/* Review form or existing review */}
        <div className="p-5 sm:p-6">
          {existingReview ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-brand-50 p-5 text-center">
                <p className="mb-1 text-lg font-bold text-brand-700">
                  {t('existingHeader')}
                </p>
                <p className="text-sm text-brand-600">
                  {t('existingSubtext', { date: formatRelativeDate(existingReview.created_at) })}
                </p>
              </div>

              <div className="rounded-xl border border-warm-100 p-4">
                <div className="mb-2">
                  <StarRating rating={existingReview.rating} size="md" />
                </div>
                {existingReview.comment && (
                  <p className="text-warm-600 leading-relaxed">{existingReview.comment}</p>
                )}
              </div>

              <div className="text-center">
                <Link
                  href={`/aanbieder/${merchant.id}`}
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  {t('viewMerchant', { name: merchant.business_name })}
                </Link>
              </div>
            </div>
          ) : (
            <ReviewPageForm
              merchantId={merchant.id}
              reservationId={reservationId}
              dishTitle={dish.title}
              merchantName={merchant.business_name}
            />
          )}
        </div>
      </div>
    </div>
  )
}
