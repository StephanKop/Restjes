export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-2 h-9 w-40 animate-pulse rounded-lg bg-warm-100" />
      <div className="mb-8 h-5 w-60 animate-pulse rounded bg-warm-50" />

      <div className="rounded-2xl bg-white p-8 shadow-card">
        {/* Avatar + name */}
        <div className="mb-6 flex items-center gap-5">
          <div className="h-20 w-20 animate-pulse rounded-full bg-warm-100" />
          <div>
            <div className="mb-1 h-5 w-32 animate-pulse rounded bg-warm-100" />
            <div className="h-4 w-44 animate-pulse rounded bg-warm-50" />
          </div>
        </div>

        <div className="space-y-4">
          {/* Name field */}
          <div>
            <div className="mb-1.5 h-4 w-12 animate-pulse rounded bg-warm-50" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-warm-100" />
          </div>
          {/* Email field */}
          <div>
            <div className="mb-1.5 h-4 w-24 animate-pulse rounded bg-warm-50" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-warm-50" />
          </div>
          {/* Phone + City */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 h-4 w-28 animate-pulse rounded bg-warm-50" />
              <div className="h-11 w-full animate-pulse rounded-xl bg-warm-100" />
            </div>
            <div>
              <div className="mb-1.5 h-4 w-10 animate-pulse rounded bg-warm-50" />
              <div className="h-11 w-full animate-pulse rounded-xl bg-warm-100" />
            </div>
          </div>
          {/* Description */}
          <div>
            <div className="mb-1.5 h-4 w-24 animate-pulse rounded bg-warm-50" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-warm-100" />
          </div>
          {/* Address fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 h-4 w-24 animate-pulse rounded bg-warm-50" />
              <div className="h-11 w-full animate-pulse rounded-xl bg-warm-100" />
            </div>
            <div>
              <div className="mb-1.5 h-4 w-24 animate-pulse rounded bg-warm-50" />
              <div className="h-11 w-full animate-pulse rounded-xl bg-warm-100" />
            </div>
          </div>
          {/* Postal code */}
          <div>
            <div className="mb-1.5 h-4 w-16 animate-pulse rounded bg-warm-50" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-warm-100" />
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="mt-8 h-11 w-full animate-pulse rounded-xl bg-warm-100" />
    </div>
  )
}
