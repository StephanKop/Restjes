function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-3">
      <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-warm-100" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 h-4 w-28 animate-pulse rounded bg-warm-100" />
        <div className="h-3 w-40 animate-pulse rounded bg-warm-50" />
      </div>
      <div className="h-3 w-10 animate-pulse rounded bg-warm-50" />
    </div>
  )
}

export default function Loading() {
  return (
    <div
      className="overflow-hidden rounded-2xl bg-white shadow-card"
      style={{ height: 'calc(100vh - 7rem)' }}
    >
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="flex h-full w-full flex-shrink-0 flex-col overflow-y-auto border-r border-warm-100 p-3 lg:w-80">
          <div className="mb-3 px-2">
            <div className="h-6 w-24 animate-pulse rounded bg-warm-100" />
          </div>
          <div className="space-y-1">
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
          </div>
        </div>

        {/* Chat pane placeholder */}
        <div className="hidden h-full min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="h-5 w-64 animate-pulse rounded bg-warm-50" />
        </div>
      </div>
    </div>
  )
}
