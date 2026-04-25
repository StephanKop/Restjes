function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="aspect-[4/3] animate-pulse bg-warm-100" />
      <div className="p-5">
        <div className="mb-1 h-5 w-3/4 animate-pulse rounded bg-warm-100" />
        <div className="mb-3 h-4 w-full animate-pulse rounded bg-warm-100" />
        <div className="mb-4 flex gap-2">
          <div className="h-6 w-20 animate-pulse rounded-lg bg-warm-50" />
          <div className="h-6 w-32 animate-pulse rounded-lg bg-warm-50" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 flex-1 animate-pulse rounded-lg bg-warm-100" />
          <div className="h-9 w-9 animate-pulse rounded-lg bg-warm-100" />
        </div>
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-warm-100" />
        <div className="h-10 w-36 animate-pulse rounded-lg bg-warm-100" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}
