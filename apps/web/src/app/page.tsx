import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-warm-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-extrabold text-brand-600">
            Restjes
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-xl px-5 py-2.5 font-bold text-warm-700 transition-colors hover:bg-warm-100"
            >
              Inloggen
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-brand-500 px-5 py-2.5 font-bold text-white shadow-button transition-colors hover:bg-brand-600"
            >
              Aanmelden
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="mb-6 max-w-3xl text-5xl font-extrabold leading-tight text-warm-900">
          Deel je restjes,
          <br />
          <span className="text-brand-500">maak iemand blij</span>
        </h1>
        <p className="mb-10 max-w-xl text-lg text-warm-500">
          Heb je eten over? Zonde om weg te gooien! Via Restjes deel je jouw overgebleven gerechten
          met mensen in de buurt. Samen maken we voedselverspilling een stuk leuker.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/browse"
            className="rounded-xl bg-brand-500 px-8 py-4 text-lg font-bold text-white shadow-button transition-colors hover:bg-brand-600"
          >
            Bekijk beschikbare gerechten
          </Link>
          <Link
            href="/aanbieder/dishes"
            className="rounded-xl border-2 border-brand-500 px-8 py-4 text-lg font-bold text-brand-700 transition-colors hover:bg-brand-50"
          >
            Zelf restjes aanbieden
          </Link>
        </div>
      </main>

      {/* How it works */}
      <section className="bg-cream px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-12 text-3xl font-extrabold text-warm-900">Hoe werkt het?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Restje plaatsen',
                description: 'Heb je eten over? Plaats het met een foto en beschrijving.',
              },
              {
                step: '2',
                title: 'Reserveren',
                description: 'Iemand in de buurt ziet jouw restje en reserveert het.',
              },
              {
                step: '3',
                title: 'Ophalen & genieten',
                description: 'Even langs om de hoek en je hebt een heerlijke maaltijd!',
              },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl bg-white p-8 shadow-card">
                <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-xl font-extrabold text-brand-600">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-bold text-warm-900">{item.title}</h3>
                <p className="text-warm-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-warm-100 bg-white px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-warm-500">
          <p>&copy; {new Date().getFullYear()} Restjes. Samen tegen voedselverspilling.</p>
        </div>
      </footer>
    </div>
  )
}
