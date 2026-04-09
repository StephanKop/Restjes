export default function ReservationsLoading() {
  return (
    <div>
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-warm-100" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 rounded-2xl bg-white p-4 shadow-card">
            <div className="h-20 w-20 shrink-0 animate-pulse rounded-xl bg-warm-100" />
            <div className="flex-1">
              <div className="mb-2 h-5 w-48 animate-pulse rounded bg-warm-100" />
              <div className="mb-2 h-4 w-32 animate-pulse rounded bg-warm-100" />
              <div className="h-4 w-24 animate-pulse rounded bg-warm-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
