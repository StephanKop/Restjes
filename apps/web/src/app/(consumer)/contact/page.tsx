import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Neem contact op met het team van Kliekjesclub.',
  alternates: { canonical: '/contact' },
}

const SUPPORT_EMAIL = 'info@kliekjesclub.nl'

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact - Kliekjesclub',
          description: 'Neem contact op met het team van Kliekjesclub.',
          url: 'https://kliekjesclub.nl/contact',
          inLanguage: 'nl',
          isPartOf: {
            '@type': 'WebSite',
            name: 'Kliekjesclub',
            url: 'https://kliekjesclub.nl',
          },
        }}
      />

      <h1 className="mb-2 text-3xl font-extrabold text-warm-900">Contact</h1>
      <p className="mb-8 text-warm-500">
        Vragen, feedback of een idee? We horen graag van je.
      </p>

      <section className="mb-6 rounded-2xl bg-white p-8 shadow-card">
        <h2 className="mb-2 text-xl font-bold text-warm-900">E-mail</h2>
        <p className="mb-4 text-warm-600">
          De snelste manier om ons te bereiken is via e-mail. We proberen binnen twee
          werkdagen te reageren.
        </p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-flex items-center rounded-xl bg-brand-500 px-5 py-3 font-bold text-white transition-colors hover:bg-brand-600"
        >
          {SUPPORT_EMAIL}
        </a>
      </section>

      <section className="mb-6 rounded-2xl bg-white p-8 shadow-card">
        <h2 className="mb-2 text-xl font-bold text-warm-900">Veelgestelde vragen</h2>
        <p className="mb-4 text-warm-600">
          Veel vragen worden al beantwoord in onze FAQ. Check deze eerst &mdash; je
          antwoord staat er misschien tussen.
        </p>
        <Link
          href="/faq"
          className="inline-flex items-center rounded-xl border border-warm-200 bg-white px-5 py-3 font-bold text-warm-800 transition-colors hover:border-warm-300"
        >
          Naar de FAQ
        </Link>
      </section>

      <section className="rounded-2xl bg-white p-8 shadow-card">
        <h2 className="mb-2 text-xl font-bold text-warm-900">Kliekjesclub</h2>
        <p className="text-warm-600">
          We zijn een Nederlands initiatief dat voedselverspilling tegengaat door
          kliekjes uit huiskeukens en bedrijfskeukens beschikbaar te maken voor
          buurtgenoten.
        </p>
      </section>
    </div>
  )
}
