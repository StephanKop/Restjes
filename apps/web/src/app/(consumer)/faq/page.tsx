import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Veelgestelde vragen',
  description: 'Antwoorden op veelgestelde vragen over Kliekjesclub.',
}

const FAQ_SECTIONS = [
  {
    title: 'Algemeen',
    items: [
      {
        question: 'Wat is Kliekjesclub?',
        answer: 'Kliekjesclub is een platform waar je overgebleven maaltijden kunt delen met mensen in de buurt. Of je nu een restaurant bent, een thuiskok of gewoon iemand die te veel eten heeft gemaakt — iedereen kan meedoen.',
      },
      {
        question: 'Is Kliekjesclub gratis?',
        answer: 'Ja, Kliekjesclub is volledig gratis te gebruiken. Zowel het aanbieden als het reserveren van gerechten kost niets.',
      },
      {
        question: 'In welke steden is Kliekjesclub actief?',
        answer: 'Kliekjesclub is beschikbaar in heel Nederland. Of je nu in een grote stad of een klein dorp woont, je kunt gerechten aanbieden en ontdekken bij jou in de buurt.',
      },
    ],
  },
  {
    title: 'Eten ophalen',
    items: [
      {
        question: 'Hoe reserveer ik een gerecht?',
        answer: 'Zoek een gerecht via de Ontdekken-pagina, kies het gewenste aantal porties en klik op "Reserveren". De aanbieder krijgt je reservering te zien en kan deze bevestigen.',
      },
      {
        question: 'Kan ik een reservering annuleren?',
        answer: 'Ja, zolang je reservering nog niet is opgehaald kun je deze annuleren via de Reserveringen-pagina. De aanbieder wordt hiervan automatisch op de hoogte gesteld.',
      },
      {
        question: 'Hoe weet ik wanneer ik het eten kan ophalen?',
        answer: 'Bij elk gerecht staat een ophaaltijdvenster vermeld. Neem via de chat contact op met de aanbieder als je specifieke afspraken wilt maken.',
      },
      {
        question: 'Kan ik filteren op allergenen?',
        answer: 'Ja, aanbieders vermelden allergenen conform de EU-14 standaard. Je kunt filteren op dieetvoorkeuren (vegetarisch/veganistisch) en allergenen uitsluiten.',
      },
    ],
  },
  {
    title: 'Eten aanbieden',
    items: [
      {
        question: 'Hoe bied ik een gerecht aan?',
        answer: 'Ga naar "Mijn aanbod" en klik op "Nieuw gerecht". Voeg een foto toe, beschrijf je gerecht, stel een ophaaltijd in en publiceer. Zo simpel is het!',
      },
      {
        question: 'Moet ik een bedrijf hebben om eten aan te bieden?',
        answer: 'Nee, iedereen kan eten aanbieden via Kliekjesclub. Of je nu een restaurant hebt of gewoon thuis te veel hebt gekookt — je bent welkom.',
      },
      {
        question: 'Hoe weet ik of iemand mijn gerecht wil ophalen?',
        answer: 'Wanneer iemand een reservering plaatst, ontvang je een melding. Je kunt de reservering bevestigen of afwijzen via het Reserveringen-overzicht.',
      },
      {
        question: 'Kan ik met de ophaler chatten?',
        answer: 'Ja, zodra iemand interesse toont in je gerecht kunnen jullie via de ingebouwde chat afspraken maken over het ophaalmoment.',
      },
    ],
  },
  {
    title: 'Beoordelingen',
    items: [
      {
        question: 'Hoe werken beoordelingen?',
        answer: 'Na het ophalen van een gerecht kun je een beoordeling achterlaten met 1 tot 5 sterren en een optionele toelichting. Aanbieders kunnen reageren op beoordelingen.',
      },
      {
        question: 'Kan ik een beoordeling aanpassen?',
        answer: 'Op dit moment kun je een beoordeling niet achteraf wijzigen. Neem contact met ons op als je een fout hebt gemaakt.',
      },
    ],
  },
  {
    title: 'Account & privacy',
    items: [
      {
        question: 'Hoe maak ik een account aan?',
        answer: 'Klik op "Aanmelden" en vul je gegevens in. Je kunt ook inloggen met je Google-account voor een snelle registratie.',
      },
      {
        question: 'Hoe verwijder ik mijn account?',
        answer: 'Neem contact met ons op via info@kliekjesclub.nl en we verwijderen je account en alle bijbehorende gegevens.',
      },
      {
        question: 'Hoe gaat Kliekjesclub om met mijn gegevens?',
        answer: 'We bewaren alleen de gegevens die nodig zijn voor het functioneren van het platform. Lees ons privacybeleid voor meer informatie.',
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-extrabold text-warm-900">Veelgestelde vragen</h1>
      <p className="mb-10 text-lg text-warm-500">Alles wat je wilt weten over Kliekjesclub.</p>

      <div className="space-y-8">
        {FAQ_SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="mb-4 text-lg font-bold text-warm-800">{section.title}</h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl bg-white shadow-card"
                >
                  <summary className="flex items-center justify-between px-6 py-4 font-semibold text-warm-800 [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 flex-shrink-0 text-warm-400 transition-transform group-open:rotate-180"
                    >
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </summary>
                  <div className="border-t border-warm-100 px-6 py-4">
                    <p className="text-sm leading-relaxed text-warm-600">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-10 rounded-2xl bg-brand-50 p-8 text-center">
        <h2 className="mb-2 text-xl font-bold text-warm-900">Staat je vraag er niet bij?</h2>
        <p className="mb-4 text-warm-500">
          Neem gerust contact met ons op. We helpen je graag!
        </p>
        <a
          href="mailto:info@kliekjesclub.nl"
          className="inline-block rounded-xl bg-brand-500 px-6 py-3 font-bold text-white transition-colors hover:bg-brand-600"
        >
          Stuur ons een e-mail
        </a>
      </div>
    </div>
  )
}
