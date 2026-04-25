import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { formatPickupTime } from '@/lib/format'
import { DishIcon, ClockIcon } from '@/components/icons'
import { dishPath } from '@/lib/slug'

export interface DishCardData {
  id: string
  title: string
  description: string | null
  image_url: string | null
  quantity_available: number
  pickup_start: string
  pickup_end: string
  bring_own_container: boolean
  is_vegetarian: boolean
  is_vegan: boolean
  merchant: {
    business_name: string
    city: string
    latitude?: number | null
    longitude?: number | null
  }
  allergen_count?: number
}

interface DishCardProps {
  dish: DishCardData
}

export function DishCard({ dish }: DishCardProps) {
  const t = useTranslations('dish')
  const pickupLabel = formatPickupTime(dish.pickup_start, dish.pickup_end)

  return (
    <Link
      href={dishPath({ id: dish.id, title: dish.title })}
      className="group block overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-150 hover:shadow-card-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {dish.image_url ? (
          <Image
            src={dish.image_url}
            alt={dish.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600">
            <DishIcon className="h-12 w-12 text-white/80" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-1 text-lg font-bold text-warm-900 group-hover:text-brand-600 transition-colors">
          {dish.title}
        </h3>
        <p className="mb-2 text-sm text-warm-500">
          {dish.merchant.business_name} &middot; {dish.merchant.city}
        </p>

        {/* Pickup time */}
        <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-warm-700">
          <ClockIcon className="h-4 w-4 text-warm-400" />
          {pickupLabel}
        </p>

        {/* Badges */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {dish.is_vegan && (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
              {t('badges.vegan')}
            </span>
          )}
          {dish.is_vegetarian && !dish.is_vegan && (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
              {t('badges.vegetarian')}
            </span>
          )}
          {dish.bring_own_container && (
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
              {t('badges.bringOwnContainer')}
            </span>
          )}
          {dish.allergen_count !== undefined && dish.allergen_count > 0 && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
              {t(dish.allergen_count === 1 ? 'badges.allergensCountSingular' : 'badges.allergensCount', { count: dish.allergen_count })}
            </span>
          )}
        </div>

        {/* Availability */}
        <p className="text-sm font-semibold text-brand-600">
          {t('card.availability', { count: dish.quantity_available })}
        </p>
      </div>
    </Link>
  )
}
