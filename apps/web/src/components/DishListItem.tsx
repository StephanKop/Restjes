import Link from 'next/link'
import Image from 'next/image'
import { formatPickupTime } from '@/lib/format'
import type { DishCardData } from '@/components/DishCard'
import { DishIcon, ClockIcon } from '@/components/icons'

interface DishListItemProps {
  dish: DishCardData
}

export function DishListItem({ dish }: DishListItemProps) {
  const pickupLabel = formatPickupTime(dish.pickup_start, dish.pickup_end)

  return (
    <Link
      href={`/dish/${dish.id}`}
      className="group flex gap-4 overflow-hidden rounded-2xl bg-white p-3 shadow-card transition-all duration-150 hover:shadow-card-hover active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 sm:p-4"
    >
      {/* Image */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28">
        {dish.image_url ? (
          <Image
            src={dish.image_url}
            alt={dish.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="112px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600">
            <DishIcon className="h-8 w-8 text-white/80" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="text-base font-bold text-warm-900 group-hover:text-brand-600 transition-colors line-clamp-1">
            {dish.title}
          </h3>
          <p className="text-sm text-warm-500">
            {dish.merchant.business_name} &middot; {dish.merchant.city}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1 text-sm text-warm-600">
            <ClockIcon className="h-3.5 w-3.5 text-warm-400" />
            {pickupLabel}
          </span>

          <span className="text-sm font-semibold text-brand-600">
            Nog {dish.quantity_available}
          </span>

          {/* Badges */}
          <div className="flex gap-1.5">
            {dish.is_vegan && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                Vegan
              </span>
            )}
            {dish.is_vegetarian && !dish.is_vegan && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                Vega
              </span>
            )}
            {dish.bring_own_container && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800">
                Eigen bakje
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
