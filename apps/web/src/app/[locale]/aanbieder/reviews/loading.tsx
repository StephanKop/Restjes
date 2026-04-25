function ReviewSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-warm-100" />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <div className="h-4 w-28 animate-pulse rounded bg-warm-100" />
            <div className="h-4 w-16 animate-pulse rounded bg-warm-50" />
          </div>
          <div className="mb-2 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-4 animate-pulse rounded bg-warm-100" />
            ))}
          </div>
          <div className="h-4 w-full animate-pulse rounded bg-warm-50" />
          <div className="mt-1 h-4 w-2/3 animate-pulse rounded bg-warm-50" />
        </div>
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="h-9 w-52 animate-pulse rounded-lg bg-warm-100" />
      </div>

      {/* Rating overview skeleton */}
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-card sm:flex sm:items-center sm:gap-10">
        <div className="mb-6 text-center sm:mb-0 sm:min-w-[140px]">
          <div className="mx-auto h-12 w-16 animate-pulse rounded bg-warm-100" />
          <div className="mx-auto mt-2 flex justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 w-5 animate-pulse rounded bg-warm-100" />
            ))}
          </div>
          <div className="mx-auto mt-2 h-4 w-24 animate-pulse rounded bg-warm-50" />
        </div>
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3">
              <div className="h-4 w-12 animate-pulse rounded bg-warm-50" />
              <div className="h-2.5 flex-1 animate-pulse rounded-full bg-warm-100" />
              <div className="h-4 w-8 animate-pulse rounded bg-warm-50" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <ReviewSkeleton />
        <ReviewSkeleton />
        <ReviewSkeleton />
      </div>
    </div>
  )
}
