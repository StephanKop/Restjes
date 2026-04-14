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
  const user = await getUser()

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

  const { data: dishes } = await supabase
    .from('dishes')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <RealtimeRefresh table="dishes" filter={`merchant_id=eq.${merchant.id}`} />
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-warm-900">Mijn gerechten</h1>
        <Link
          href="/aanbieder/dishes/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 p-2.5 text-sm font-bold text-white shadow-button transition-all duration-150 hover:bg-brand-600 active:scale-[0.97] sm:px-5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 sm:h-4 sm:w-4">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          <span className="hidden sm:inline">Nieuw gerecht</span>
        </Link>
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
            const badge = statusConfig[status] ?? statusConfig.available

            return (
              <div
                key={dish.id}
                data-reveal="scale"
                className="overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-lg"
              >
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

                <div className="p-5">
                  <h3 className="mb-1 text-lg font-bold text-warm-900 line-clamp-1">
                    {dish.title}
                  </h3>
                  {dish.description && (
                    <p className="mb-3 text-sm text-warm-500 line-clamp-2">{dish.description}</p>
                  )}

                  <div className="mb-4 flex flex-wrap gap-2 text-xs text-warm-600">
                    <span className="rounded-lg bg-warm-50 px-2 py-1">
                      Aantal: {dish.quantity_available}
                    </span>
                    <span className="rounded-lg bg-warm-50 px-2 py-1">
                      {formatPickupTime(dish.pickup_start, dish.pickup_end)}
                    </span>
                  </div>

                  <div className="flex gap-2">
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
