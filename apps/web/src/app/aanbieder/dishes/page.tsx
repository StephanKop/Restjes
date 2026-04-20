import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerComponentClient, getUser } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { RealtimeRefresh } from '@/components/RealtimeRefresh'
import { DeleteDishButton } from '@/components/DeleteDishButton'
import { Button } from '@/components/ui/Button'
import { DishIcon, CookingPotIcon } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Mijn gerechten',
}

type DishStatus = 'available' | 'reserved' | 'collected' | 'expired'

const statusConfig: Record<DishStatus, { label: string; className: string }> = {
  available: { label: 'Beschikbaar', className: 'bg-green-100 text-green-800' },
  reserved: { label: 'Gereserveerd', className: 'bg-amber-100 text-amber-800' },
  collected: { label: 'Opgehaald', className: 'bg-gray-100 text-gray-700' },
  expired: { label: 'Verlopen', className: 'bg-red-100 text-red-800' },
}

function getDishBadge(
  status: DishStatus,
  pickupEnd: string | null,
  expiresAt: string | null,
): { label: string; className: string } {
  // Only override for active statuses
  if (status === 'collected' || status === 'expired') {
    return statusConfig[status]
  }

  const now = new Date()

  if (expiresAt && new Date(expiresAt) < now) {
    return { label: 'Over datum', className: 'bg-red-100 text-red-800' }
  }

  if (pickupEnd && new Date(pickupEnd) < now) {
    return { label: 'Ophaaltijd verstreken', className: 'bg-orange-100 text-orange-800' }
  }

  return statusConfig[status]
}

function formatPickupTime(start: string | null, end: string | null): string {
  if (!start && !end) return 'Geen ophaaltijd'
  const fmt = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return `Vanaf ${fmt(start)}`
  return `Tot ${fmt(end!)}`
}

export default async function DishesPage() {
  const [user, supabase] = await Promise.all([
    getUser(),
    createServerComponentClient(),
  ])

  if (!user) {
    redirect('/login')
  }

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!merchant) {
    redirect('/aanbieder/profile?setup=aanbieder')
  }

  const { data: dishes } = await supabase
    .from('dishes')
    .select('id, title, description, image_url, quantity_available, status, pickup_start, pickup_end, expires_at, created_at')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <RealtimeRefresh table="dishes" filter={`merchant_id=eq.${merchant.id}`} />
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-warm-900">Mijn gerechten</h1>
      </div>

      {!dishes || dishes.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-card">
          <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-100 text-warm-400">
            <DishIcon className="h-7 w-7" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-warm-900">
            Je hebt nog geen gerechten geplaatst
          </h2>
          <p className="mb-6 text-warm-500">
            Plaats je eerste gerecht en help voedselverspilling tegen te gaan.
          </p>
          <Link href="/aanbieder/dishes/new">
            <Button variant="primary">Nieuw gerecht plaatsen</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
          {dishes.map((dish) => {
            const status = dish.status as DishStatus
            const badge = getDishBadge(status, dish.pickup_end, dish.expires_at)

            return (
              <div
                key={dish.id}
                data-reveal="scale"
                className="overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-lg"
              >
                <Link href={`/gerecht/${dish.id}`} className="block">
                  <div className="relative aspect-[4/3] bg-warm-100">
                    {dish.image_url ? (
                      <Image
                        src={dish.image_url}
                        alt={dish.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-warm-300">
                        <CookingPotIcon className="h-10 w-10" />
                      </div>
                    )}
                    <span
                      className={`absolute right-3 top-3 rounded-xl px-3 py-1 text-xs font-bold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="p-5 pb-0">
                    <h3 className="mb-1 text-lg font-bold text-warm-900 line-clamp-1">
                      {dish.title}
                    </h3>
                    {dish.description && (
                      <p className="mb-3 text-sm text-warm-500 line-clamp-2">{dish.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs text-warm-600">
                      <span className="rounded-lg bg-warm-50 px-2 py-1">
                        Aantal: {dish.quantity_available}
                      </span>
                      <span className="rounded-lg bg-warm-50 px-2 py-1">
                        {formatPickupTime(dish.pickup_start, dish.pickup_end)}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="flex gap-2 p-5">
                  <Link href={`/aanbieder/dishes/${dish.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full text-sm">
                      Bewerken
                    </Button>
                  </Link>
                  <DeleteDishButton
                    dishId={dish.id}
                    imageUrl={dish.image_url}
                    merchantId={merchant.id}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
