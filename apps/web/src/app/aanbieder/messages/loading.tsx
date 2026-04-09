export default function MerchantMessagesLoading() {
  return (
    <div>
      <div className="mb-6 h-8 w-36 animate-pulse rounded-lg bg-warm-100" />
      <div className="divide-y divide-warm-100 overflow-hidden rounded-2xl bg-white shadow-card">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-warm-100" />
            <div className="flex-1">
              <div className="mb-2 h-4 w-40 animate-pulse rounded bg-warm-100" />
              <div className="h-3 w-64 animate-pulse rounded bg-warm-100" />
            </div>
            <div className="h-3 w-12 animate-pulse rounded bg-warm-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
