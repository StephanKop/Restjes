function ReservationSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <div className="h-5 w-40 animate-pulse rounded bg-warm-100" />
            <div className="h-5 w-20 animate-pulse rounded-xl bg-warm-100" />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <div className="h-4 w-28 animate-pulse rounded bg-warm-50" />
            <div className="h-4 w-16 animate-pulse rounded bg-warm-50" />
            <div className="h-4 w-20 animate-pulse rounded bg-warm-50" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-9 w-24 animate-pulse rounded-xl bg-warm-100" />
        <div className="h-9 w-24 animate-pulse rounded-xl bg-warm-100" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-9 w-52 animate-pulse rounded-lg bg-warm-100" />
      </div>

      {/* Tab filters */}
      <div className="mb-6 flex gap-2">
        <div className="h-9 w-16 animate-pulse rounded-xl bg-warm-100" />
        <div className="h-9 w-20 animate-pulse rounded-xl bg-warm-50" />
        <div className="h-9 w-24 animate-pulse rounded-xl bg-warm-50" />
        <div className="h-9 w-24 animate-pulse rounded-xl bg-warm-50" />
      </div>

      <div className="grid gap-4">
        <ReservationSkeleton />
        <ReservationSkeleton />
        <ReservationSkeleton />
        <ReservationSkeleton />
      </div>
    </div>
  )
}
