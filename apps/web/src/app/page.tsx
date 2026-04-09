import Link from 'next/link'
import { MainNav } from '@/components/MainNav'
import { HowItWorks } from '@/components/HowItWorks'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />

      {/* Hero */}
      <main className="relative flex min-h-[70dvh] flex-col items-center justify-center px-6 py-20 text-center md:min-h-[60dvh]">
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        {/* Overlay */}
        <div className="absolute inset-0 bg-warm-900/60" />

        {/* Content */}
        <div className="relative z-10">
          <h1 className="mb-6 max-w-3xl text-5xl font-extrabold leading-tight text-white">
            Deel je restjes,
            <br />
            <span className="text-brand-300">maak iemand blij</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-warm-200">
            Heb je eten over? Zonde om weg te gooien! Via Restjes deel je jouw overgebleven gerechten
            met mensen in de buurt. Samen maken we voedselverspilling een stuk leuker.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/browse"
              className="rounded-xl bg-brand-500 px-8 py-4 text-lg font-bold text-white shadow-button transition-all duration-150 hover:bg-brand-600 active:scale-[0.97] active:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              Bekijk beschikbare gerechten
            </Link>
            <Link
              href="/aanbieder/dishes"
              className="rounded-xl border-2 border-white/80 px-8 py-4 text-lg font-bold text-white transition-all duration-150 hover:bg-white/10 active:scale-[0.97] active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              Zelf restjes aanbieden
            </Link>
          </div>
        </div>
      </main>

      <HowItWorks />

      {/* Footer */}
      <footer className="border-t border-warm-100 bg-white px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-warm-500">
          <p>&copy; {new Date().getFullYear()} Restjes. Samen tegen voedselverspilling.</p>
        </div>
      </footer>
    </div>
  )
}
