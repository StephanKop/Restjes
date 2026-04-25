import type { Article } from './types'
import { P, H2, UL, LI, Strong, A, Callout } from './_components'

export const article: Article = {
  slug: 'voedselbank-vs-kliekjesclub',
  title: 'Voedselbank vs Kliekjesclub: wat is het verschil?',
  description:
    'Beide gaan ze tegen voedselverspilling — maar werken heel anders. Een eerlijke vergelijking van Voedselbank, Too Good To Go en Kliekjesclub.',
  publishedAt: '2026-04-23',
  category: 'voedselverspilling',
  readingMinutes: 5,
  Body,
}

function Body() {
  return (
    <>
      <P>
        In Nederland zijn er meerdere initiatieven die op verschillende manieren tegen
        voedselverspilling werken. Voedselbank, Too Good To Go, Kliekjesclub — ze klinken alle
        drie alsof ze hetzelfde doen, maar het verschil zit in <em>wie</em> het eten krijgt en
        <em> hoe</em> het gedeeld wordt. In dit artikel zetten we ze naast elkaar.
      </P>

      <H2 id="voedselbank">Voedselbank: voor mensen die het hard nodig hebben</H2>

      <P>
        De Voedselbank is een Nederlands netwerk van vrijwilligers dat al sinds 2002 bestaat. Het
        principe: supermarkten, bakkerijen en producenten doneren voedsel dat anders zou worden
        weggegooid; vrijwilligers verzamelen, sorteren en verdelen het naar mensen onder de
        armoedegrens.
      </P>

      <UL>
        <LI><Strong>Doel:</Strong> armoedebestrijding én voedselverspilling tegengaan.</LI>
        <LI><Strong>Doelgroep:</Strong> alleen mensen met een inkomen onder de Voedselbank-norm. Je krijgt eerst een intake en moet aan voorwaarden voldoen.</LI>
        <LI><Strong>Hoe:</Strong> één keer per week een pakket op een uitdeelpunt.</LI>
        <LI><Strong>Wie geeft:</Strong> grote bedrijven en supermarktketens.</LI>
        <LI><Strong>Kosten:</Strong> volledig gratis voor de ontvanger.</LI>
      </UL>

      <P>
        Voedselbanken Nederland is een geweldige organisatie maar bewust selectief — ze willen
        de hulp gericht houden op mensen die het écht nodig hebben.
      </P>

      <H2 id="too-good-to-go">Too Good To Go: betaalbaar restjes-pakket</H2>

      <P>
        Too Good To Go is een commerciële app waarop horeca en supermarkten een{' '}
        <em>magic bag</em> verkopen: een verrassingspakket met overschot van die dag, voor zo&apos;n
        een derde van de oorspronkelijke prijs. Pak je TGTG-zak op aan het eind van de dag.
      </P>

      <UL>
        <LI><Strong>Doel:</Strong> commerciële markt voor verspilling-overschot.</LI>
        <LI><Strong>Doelgroep:</Strong> iedereen.</LI>
        <LI><Strong>Hoe:</Strong> je betaalt €3 tot €6 voor een verrassingspakket, ophalen op een vast tijdstip.</LI>
        <LI><Strong>Wie geeft:</Strong> horeca, bakkerijen, supermarkten.</LI>
        <LI><Strong>Kosten:</Strong> betaalt platform een commissie, gebruiker betaalt voor de tas.</LI>
      </UL>

      <P>
        Voor de horeca is het een handige manier om verspilling om te zetten in nog wat omzet.
        Voor consumenten is het goedkoop, maar je weet pas bij ophalen wat erin zit.
      </P>

      <H2 id="kliekjesclub">Kliekjesclub: gratis delen tussen buren en lokale aanbieders</H2>

      <P>
        Kliekjesclub is een platform waarop iedereen — particulieren, bakkerijen, restaurants —
        hun overgebleven eten gratis kan aanbieden. Mensen in de buurt zien wat er beschikbaar
        is, reserveren wat ze willen en spreken een ophaalmoment af.
      </P>

      <UL>
        <LI><Strong>Doel:</Strong> voedselverspilling tegengaan via lokaal delen — laagdrempelig, voor iedereen.</LI>
        <LI><Strong>Doelgroep:</Strong> iedereen, geen inkomenstoets, geen voorwaarden.</LI>
        <LI><Strong>Hoe:</Strong> bekijk het aanbod online, reserveer een gerecht, spreek af waar/wanneer je het ophaalt.</LI>
        <LI><Strong>Wie geeft:</Strong> particulieren, bakkerijen, lunchrooms, restaurants — iedereen die te veel heeft gemaakt of overhoudt.</LI>
        <LI><Strong>Kosten:</Strong> volledig gratis, geen commissie, geen abonnement.</LI>
      </UL>

      <H2 id="naast-elkaar">Naast elkaar bekeken</H2>

      <div className="mb-6 overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-warm-100 bg-warm-50">
              <th className="px-4 py-3 font-bold text-warm-900"></th>
              <th className="px-4 py-3 font-bold text-warm-900">Voedselbank</th>
              <th className="px-4 py-3 font-bold text-warm-900">Too Good To Go</th>
              <th className="px-4 py-3 font-bold text-warm-900">Kliekjesclub</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-100">
            <tr><td className="px-4 py-3 font-semibold">Voor wie?</td><td className="px-4 py-3">Inkomen-getoetst</td><td className="px-4 py-3">Iedereen</td><td className="px-4 py-3">Iedereen</td></tr>
            <tr><td className="px-4 py-3 font-semibold">Kosten</td><td className="px-4 py-3">Gratis</td><td className="px-4 py-3">€3-€6 per zak</td><td className="px-4 py-3">Gratis</td></tr>
            <tr><td className="px-4 py-3 font-semibold">Aanbieders</td><td className="px-4 py-3">Bedrijven</td><td className="px-4 py-3">Horeca + retail</td><td className="px-4 py-3">Iedereen</td></tr>
            <tr><td className="px-4 py-3 font-semibold">Vooraf weten</td><td className="px-4 py-3">Pakket-mix</td><td className="px-4 py-3">Verrassing</td><td className="px-4 py-3">Specifiek gerecht</td></tr>
            <tr><td className="px-4 py-3 font-semibold">Particulieren?</td><td className="px-4 py-3">Nee</td><td className="px-4 py-3">Nee</td><td className="px-4 py-3">Ja</td></tr>
          </tbody>
        </table>
      </div>

      <H2 id="welke">Welke past bij jou?</H2>

      <UL>
        <LI><Strong>Voedselbank:</Strong> als je rond moet komen en aan de voorwaarden voldoet, biedt de Voedselbank consistente wekelijkse ondersteuning.</LI>
        <LI><Strong>Too Good To Go:</Strong> als je &apos;s avonds graag een goedkope verrassings-maaltijd ophaalt bij horeca.</LI>
        <LI><Strong>Kliekjesclub:</Strong> als je gratis eten wilt redden van mensen in je buurt, of zelf je restjes wilt delen — ongeacht inkomen.</LI>
      </UL>

      <P>
        Ze zijn complementair, niet concurrerend. De Voedselbank pakt het systemische probleem
        van armoede, Too Good To Go zet horeca-overschot om in betaalbare maaltijden, en
        Kliekjesclub maakt buurtniveau delen makkelijk voor iedereen — particulieren én
        professionals.
      </P>

      <Callout>
        <Strong>Zelf bijdragen?</Strong> Heb je restjes over die je wilt delen?{' '}
        <A href="/aanbieder/dishes/new">Plaats ze in een paar tikken op Kliekjesclub</A> en
        iemand in je buurt komt ze ophalen.
      </Callout>
    </>
  )
}
