import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-offwhite px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-3xl font-bold text-brand-500">
            Restjes
          </Link>
        </div>
        <div className="rounded-2xl bg-cream p-8 shadow-card">
          {children}
        </div>
      </div>
    </div>
  )
}
