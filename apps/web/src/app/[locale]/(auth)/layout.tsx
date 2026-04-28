import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Inloggen',
  robots: {
    index: false,
    follow: true,
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-offwhite lg:grid lg:grid-cols-2">
      {/* Left column — video panel. Desktop only; the video is decorative and
          omitted on mobile to keep the form above the fold. */}
      <div className="relative hidden overflow-hidden lg:block">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/hero-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        >
          <source src="/auth-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-offwhite/30" />
        <Link
          href="/"
          className="absolute inset-0 flex items-center justify-center"
          aria-label="Kliekjesclub"
        >
          <Image
            src="/logo.png"
            alt="Kliekjesclub"
            width={200}
            height={200}
            className="h-28 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Right column — content card. On mobile this is the whole screen with
          a small logo above the card so the brand is still visible. */}
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <Link
          href="/"
          className="mb-6 lg:hidden"
          aria-label="Kliekjesclub"
        >
          <Image
            src="/logo.png"
            alt="Kliekjesclub"
            width={200}
            height={200}
            className="h-16 w-auto"
            priority
          />
        </Link>

        <div className="w-full max-w-md" data-reveal>
          <div className="rounded-2xl bg-cream p-8 shadow-card">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
