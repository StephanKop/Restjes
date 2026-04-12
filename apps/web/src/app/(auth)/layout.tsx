import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-offwhite px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex justify-center">
            <Image src="/logo.png" alt="Kliekjesclub" width={200} height={200} className="h-20 w-auto" priority />
          </Link>
        </div>
        <div className="rounded-2xl bg-cream p-8 shadow-card">
          {children}
        </div>
      </div>
    </div>
  )
}
