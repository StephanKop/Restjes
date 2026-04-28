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
    <div className="flex min-h-screen items-center justify-center bg-offwhite px-4 py-8 lg:p-8">
      {/* Card frame — only shows as a single rounded card on desktop. On
          mobile the form keeps its own cream card and the video is hidden. */}
      <div className="w-full max-w-5xl lg:grid lg:min-h-[640px] lg:grid-cols-2 lg:overflow-hidden lg:rounded-3xl lg:bg-cream lg:shadow-card-hover">
        {/* Left half: video panel — desktop only */}
        <div className="relative hidden lg:block">
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

        {/* Right half: form. On desktop it sits flush inside the card (no
            inner shadow); on mobile it's its own cream-coloured card. */}
        <div className="flex flex-col items-center justify-center p-0 lg:p-12">
          <Link href="/" className="mb-6 lg:hidden" aria-label="Kliekjesclub">
            <Image
              src="/logo.png"
              alt="Kliekjesclub"
              width={200}
              height={200}
              className="h-16 w-auto"
              priority
            />
          </Link>

          <div
            className="w-full max-w-md rounded-2xl bg-cream p-8 shadow-card lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none"
            data-reveal
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
