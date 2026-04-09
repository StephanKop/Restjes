import Link from 'next/link'
import Image from 'next/image'
import { formatPickupTime } from '@/lib/format'

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
  }
  allergen_count?: number
}

interface DishCardProps {
  dish: DishCardData
}

export function DishCard({ dish }: DishCardProps) {
  const pickupLabel = formatPickupTime(dish.pickup_start, dish.pickup_end)

  return (
    <Link
      href={`/dish/${dish.id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-card-hover"
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
            <span className="text-5xl" role="img" aria-label="Gerecht">
              🍽️
            </span>
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
        <p className="mb-3 text-sm font-medium text-warm-700">
          <span className="mr-1.5" role="img" aria-label="Klok">🕐</span>
          {pickupLabel}
        </p>

        {/* Badges */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {dish.is_vegan && (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
              Veganistisch
            </span>
          )}
          {dish.is_vegetarian && !dish.is_vegan && (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
              Vegetarisch
            </span>
          )}
          {dish.bring_own_container && (
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
              Eigen bakje
            </span>
          )}
          {dish.allergen_count !== undefined && dish.allergen_count > 0 && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
              {dish.allergen_count} allergeen{dish.allergen_count !== 1 ? 'en' : ''}
            </span>
          )}
        </div>

        {/* Availability */}
        <p className="text-sm font-semibold text-brand-600">
          Nog {dish.quantity_available} beschikbaar
        </p>
      </div>
    </Link>
  )
}
