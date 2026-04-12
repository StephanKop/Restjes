import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Over ons',
  description: 'Leer meer over Kliekjesclub en onze missie om voedselverspilling tegen te gaan.',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-extrabold text-warm-900">Over Kliekjesclub</h1>
      <p className="mb-10 text-lg text-warm-500">Samen maken we voedselverspilling een stuk leuker.</p>

      <div className="space-y-10">
        {/* Mission */}
        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2 className="mb-4 text-xl font-bold text-warm-900">Onze missie</h2>
          <p className="mb-4 leading-relaxed text-warm-600">
            In Nederland gooien we jaarlijks miljoenen kilo&apos;s eten weg. Tegelijkertijd zijn er
            mensen die moeite hebben om aan een goede maaltijd te komen. Kliekjesclub brengt
            hier verandering in door een platform te bieden waar iedereen eenvoudig
            overgebleven maaltijden kan delen met mensen in de buurt.
          </p>
          <p className="leading-relaxed text-warm-600">
            Of je nu een restaurant bent met porties over, een thuiskok die te veel heeft gemaakt,
            of iemand die op zoek is naar een lekkere en betaalbare maaltijd — bij Kliekjesclub
            is iedereen welkom.
          </p>
        </section>

        {/* How it works */}
        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2 className="mb-4 text-xl font-bold text-warm-900">Hoe het werkt</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">1</div>
              <div>
                <h3 className="font-bold text-warm-800">Aanbieden</h3>
                <p className="text-sm text-warm-500">Heb je eten over? Plaats het in een paar seconden op Kliekjesclub met een foto, beschrijving en ophaaltijd.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">2</div>
              <div>
                <h3 className="font-bold text-warm-800">Ontdekken</h3>
                <p className="text-sm text-warm-500">Zoek naar beschikbare gerechten bij jou in de buurt. Filter op dieetvoorkeuren en allergenen.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">3</div>
              <div>
                <h3 className="font-bold text-warm-800">Reserveren</h3>
                <p className="text-sm text-warm-500">Reserveer een gerecht en neem contact op met de aanbieder via chat.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">4</div>
              <div>
                <h3 className="font-bold text-warm-800">Ophalen</h3>
                <p className="text-sm text-warm-500">Haal je gerecht op bij de aanbieder en geniet! Vergeet niet een beoordeling achter te laten.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2 className="mb-4 text-xl font-bold text-warm-900">Onze waarden</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-lg">
                🌍
              </div>
              <h3 className="mb-1 font-bold text-warm-800">Duurzaamheid</h3>
              <p className="text-sm text-warm-500">Elke portie die gedeeld wordt, is een portie minder die verspild wordt.</p>
            </div>
            <div>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-lg">
                🤝
              </div>
              <h3 className="mb-1 font-bold text-warm-800">Gemeenschap</h3>
              <p className="text-sm text-warm-500">Eten verbindt. Via Kliekjesclub leer je je buren kennen.</p>
            </div>
            <div>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-lg">
                💚
              </div>
              <h3 className="mb-1 font-bold text-warm-800">Toegankelijkheid</h3>
              <p className="text-sm text-warm-500">Iedereen verdient een goede maaltijd. Kliekjesclub is gratis te gebruiken.</p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="rounded-2xl bg-brand-50 p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-warm-900">Vragen of suggesties?</h2>
          <p className="mb-4 text-warm-500">
            We horen graag van je! Neem contact met ons op via e-mail.
          </p>
          <a
            href="mailto:info@kliekjesclub.nl"
            className="inline-block rounded-xl bg-brand-500 px-6 py-3 font-bold text-white transition-colors hover:bg-brand-600"
          >
            info@kliekjesclub.nl
          </a>
        </section>
      </div>
    </div>
  )
}
