export default function BrowseLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="mb-2 h-9 w-48 animate-pulse rounded-lg bg-warm-100" />
        <div className="h-5 w-72 animate-pulse rounded-lg bg-warm-100" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar skeleton — lg+ only */}
        <div className="hidden w-64 flex-shrink-0 lg:block">
          <div className="rounded-2xl bg-white p-5 shadow-card">
            <div className="space-y-6">
              <div>
                <div className="mb-2 h-4 w-16 animate-pulse rounded bg-warm-100" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-warm-100" />
              </div>
              <div>
                <div className="mb-2 h-4 w-12 animate-pulse rounded bg-warm-100" />
                <div className="space-y-2">
                  <div className="h-8 w-full animate-pulse rounded-xl bg-warm-100" />
                  <div className="h-8 w-full animate-pulse rounded-xl bg-warm-100" />
                </div>
              </div>
              <div>
                <div className="mb-2 h-4 w-32 animate-pulse rounded bg-warm-100" />
                <div className="space-y-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-7 w-full animate-pulse rounded-xl bg-warm-100" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="min-w-0 flex-1">
          {/* Toolbar skeleton */}
          <div className="mb-4 flex items-center justify-between">
            <div className="h-4 w-24 animate-pulse rounded bg-warm-100" />
            <div className="h-9 w-20 animate-pulse rounded-xl bg-warm-100" />
          </div>

          {/* Card grid skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-card">
                <div className="aspect-[4/3] animate-pulse bg-warm-100" />
                <div className="p-4">
                  <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-warm-100" />
                  <div className="mb-3 h-4 w-1/2 animate-pulse rounded bg-warm-100" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-warm-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
