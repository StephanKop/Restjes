import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-offwhite">
      <div className="relative z-10 flex min-h-screen flex-col items-center px-4 pb-12 pt-8" data-reveal-stagger>
        <div className="relative h-[45vh] w-full max-w-4xl overflow-hidden rounded-3xl" data-reveal="scale">
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
            <Image src="/logo.png" alt="Kliekjesclub" width={200} height={200} className="h-24 w-auto" priority />
          </Link>
        </div>

        <div className="relative z-20 -mt-20 w-full max-w-md" data-reveal>
          <div className="rounded-2xl bg-cream p-8 shadow-card">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
