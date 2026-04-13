import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Algemene voorwaarden',
  description: 'Lees de algemene voorwaarden van Kliekjesclub.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-extrabold text-warm-900">Algemene voorwaarden</h1>
      <p className="mb-8 text-sm text-warm-400">Laatst bijgewerkt: 13 april 2026</p>

      <div className="space-y-8 text-warm-700 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-warm-900 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-warm-800 [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:leading-relaxed [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1">

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>Artikel 1 &mdash; Definities</h2>
          <p>In deze algemene voorwaarden wordt verstaan onder:</p>
          <ol>
            <li><strong>Platform:</strong> de website kliekjesclub.nl, de mobiele applicatie &ldquo;Kliekjesclub&rdquo; en alle bijbehorende diensten.</li>
            <li><strong>Kliekjesclub:</strong> de exploitant van het Platform.</li>
            <li><strong>Gebruiker:</strong> iedere natuurlijke persoon die een account aanmaakt op het Platform.</li>
            <li><strong>Aanbieder:</strong> een Gebruiker die gerechten aanbiedt via het Platform.</li>
            <li><strong>Afnemer:</strong> een Gebruiker die gerechten reserveert en ophaalt via het Platform.</li>
            <li><strong>Gerecht:</strong> een voedselproduct dat door een Aanbieder beschikbaar wordt gesteld via het Platform.</li>
            <li><strong>Reservering:</strong> de bevestigde afspraak tussen Aanbieder en Afnemer voor het ophalen van een Gerecht.</li>
            <li><strong>Account:</strong> het persoonlijke account van een Gebruiker op het Platform.</li>
          </ol>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>Artikel 2 &mdash; Toepasselijkheid</h2>
          <ol>
            <li>Deze algemene voorwaarden zijn van toepassing op ieder gebruik van het Platform en op alle overeenkomsten die via het Platform tot stand komen.</li>
            <li>Door het aanmaken van een Account of het gebruiken van het Platform ga je akkoord met deze voorwaarden.</li>
            <li>Kliekjesclub behoudt zich het recht voor deze voorwaarden te wijzigen. Wijzigingen worden via het Platform gecommuniceerd en treden in werking 30 dagen na publicatie.</li>
            <li>Eventuele afwijkende voorwaarden van de Gebruiker zijn niet van toepassing, tenzij uitdrukkelijk schriftelijk overeengekomen.</li>
          </ol>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>Artikel 3 &mdash; Het Platform</h2>
          <ol>
            <li>Kliekjesclub biedt een platform waarop Aanbieders overgebleven maaltijden kunnen aanbieden en Afnemers deze kunnen reserveren en ophalen.</li>
            <li>Kliekjesclub is g&eacute;&eacute;n partij bij de overeenkomst tussen Aanbieder en Afnemer. Kliekjesclub treedt uitsluitend op als tussenpersoon die het contact tussen Aanbieders en Afnemers faciliteert.</li>
            <li>Het gebruik van het Platform is gratis.</li>
            <li>Kliekjesclub garandeert niet dat het Platform te allen tijde beschikbaar is en kan het Platform zonder voorafgaande kennisgeving (tijdelijk) buiten gebruik stellen voor onderhoud of updates.</li>
          </ol>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>Artikel 4 &mdash; Account</h2>
          <ol>
            <li>Om gebruik te maken van het Platform dien je een Account aan te maken. Je garandeert dat de door jou verstrekte gegevens juist en volledig zijn.</li>
            <li>Je bent verantwoordelijk voor het geheimhouden van je inloggegevens. Alle activiteiten die plaatsvinden via jouw Account komen voor jouw rekening.</li>
            <li>Je mag slechts &eacute;&eacute;n Account aanmaken per persoon.</li>
            <li>Kliekjesclub behoudt zich het recht voor om Accounts te schorsen of te verwijderen bij schending van deze voorwaarden.</li>
            <li>Je kunt je Account op elk moment verwijderen door contact op te nemen met info@kliekjesclub.nl. Na verwijdering worden je gegevens verwerkt conform ons privacybeleid.</li>
          </ol>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>Artikel 5 &mdash; Verplichtingen van de Aanbieder</h2>
          <ol>
            <li>De Aanbieder garandeert dat aangeboden Gerechten veilig zijn voor consumptie en voldoen aan de geldende voedselveiligheidsnormen.</li>
            <li>De Aanbieder verstrekt nauwkeurige informatie over het Gerecht, waaronder een correcte beschrijving, ingredi&euml;nten en allergeneninformatie conform de EU-14 allergenenwetgeving.</li>
            <li>De Aanbieder stelt een realistisch ophaaltijdvenster in en is beschikbaar gedurende dit tijdvenster.</li>
            <li>De Aanbieder is volledig verantwoordelijk voor de kwaliteit, veiligheid en hygi&euml;ne van aangeboden Gerechten.</li>
            <li>De Aanbieder handelt in overeenstemming met alle toepasselijke wet- en regelgeving, waaronder de Warenwet en het Warenwetbesluit hygi&euml;ne van levensmiddelen.</li>
            <li>Het is de Aanbieder niet toegestaan om bedorven, verlopen of anderszins onveilige producten aan te bieden.</li>
          </ol>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>Artikel 6 &mdash; Verplichtingen van de Afnemer</h2>
          <ol>
            <li>De Afnemer haalt gereserveerde Gerechten op binnen het afgesproken ophaaltijdvenster.</li>
            <li>De Afnemer controleert zelf of een Gerecht geschikt is gelet op eventuele allergie&euml;n, intoleranties of dieetbeperkingen.</li>
            <li>De Afnemer is zelf verantwoordelijk voor het controleren van de staat van het Gerecht bij ophaling.</li>
            <li>Indien de Afnemer een Reservering niet nakomt (no-show), kan Kliekjesclub maatregelen nemen, waaronder het beperken van de mogelijkheid om toekomstige Reserveringen te plaatsen.</li>
          </ol>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>Artikel 7 &mdash; Reserveringen</h2>
          <ol>
            <li>Een Reservering komt tot stand wanneer de Afnemer een gerecht reserveert via het Platform. De Aanbieder ontvangt hiervan een melding en kan de Reservering bevestigen of afwijzen.</li>
            <li>Een Reservering is pas definitief na bevestiging door de Aanbieder.</li>
            <li>Zowel de Aanbieder als de Afnemer kunnen een Reservering annuleren tot het moment van ophaling. De andere partij wordt hiervan automatisch op de hoogte gesteld.</li>
            <li>Kliekjesclub is niet aansprakelijk voor het niet nakomen van Reserveringen door Aanbieders of Afnemers.</li>
          </ol>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>Artikel 8 &mdash; Berichten en beoordelingen</h2>
          <ol>
            <li>Gebruikers kunnen via het Platform berichten uitwisselen en beoordelingen plaatsen.</li>
            <li>Het is niet toegestaan om via het Platform berichten te sturen die beledigend, discriminerend, bedreigend, misleidend of anderszins onrechtmatig zijn.</li>
            <li>Beoordelingen dienen eerlijk en waarheidsgetrouw te zijn. Het plaatsen van valse beoordelingen is niet toegestaan.</li>
            <li>Aanbieders kunnen reageren op beoordelingen. Reacties dienen respectvol en feitelijk te zijn.</li>
            <li>Kliekjesclub behoudt zich het recht voor om berichten en beoordelingen die in strijd zijn met deze voorwaarden te verwijderen.</li>
          </ol>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>Artikel 9 &mdash; Intellectueel eigendom</h2>
          <ol>
            <li>Alle intellectuele eigendomsrechten op het Platform, waaronder de software, het ontwerp, logo&apos;s en teksten, berusten bij Kliekjesclub.</li>
            <li>Door het plaatsen van content (foto&apos;s, beschrijvingen, beoordelingen) op het Platform verleen je Kliekjesclub een niet-exclusieve, wereldwijde, royaltyvrije licentie om deze content te gebruiken, weer te geven en te verspreiden in het kader van het Platform.</li>
            <li>Je garandeert dat je het recht hebt om de door jou geplaatste content te delen en dat deze geen inbreuk maakt op rechten van derden.</li>
          </ol>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>Artikel 10 &mdash; Aansprakelijkheid</h2>
          <ol>
            <li>Kliekjesclub faciliteert uitsluitend het contact tussen Aanbieders en Afnemers en is niet aansprakelijk voor de kwaliteit, veiligheid of beschikbaarheid van aangeboden Gerechten.</li>
            <li>Kliekjesclub is niet aansprakelijk voor schade die voortvloeit uit het gebruik van het Platform, tenzij sprake is van opzet of grove nalatigheid van Kliekjesclub.</li>
            <li>De aansprakelijkheid van Kliekjesclub is in alle gevallen beperkt tot het bedrag dat door de aansprakelijkheidsverzekering van Kliekjesclub wordt uitgekeerd.</li>
            <li>Kliekjesclub is niet aansprakelijk voor:
              <ul>
                <li>Gezondheidsklachten als gevolg van de consumptie van via het Platform verkregen Gerechten;</li>
                <li>Onjuiste of onvolledige informatie verstrekt door Aanbieders;</li>
                <li>Het niet nakomen van afspraken door Aanbieders of Afnemers;</li>
                <li>Schade als gevolg van onbevoegd gebruik van je Account;</li>
                <li>Tijdelijke onbeschikbaarheid van het Platform.</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>Artikel 11 &mdash; Verboden gebruik</h2>
          <p>Het is niet toegestaan om het Platform te gebruiken voor:</p>
          <ul>
            <li>Het aanbieden van producten die niet voldoen aan voedselveiligheidsnormen;</li>
            <li>Commerci&euml;le doeleinden anders dan het delen van overgebleven maaltijden;</li>
            <li>Het verspreiden van spam, malware of andere schadelijke content;</li>
            <li>Het aanmaken van meerdere Accounts of het zich voordoen als een ander;</li>
            <li>Het schrapen, kopiëren of geautomatiseerd verzamelen van gegevens van het Platform;</li>
            <li>Activiteiten die in strijd zijn met de wet of de rechten van derden.</li>
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>Artikel 12 &mdash; Geschillen en toepasselijk recht</h2>
          <ol>
            <li>Op deze algemene voorwaarden en alle overeenkomsten die via het Platform tot stand komen is Nederlands recht van toepassing.</li>
            <li>Geschillen worden bij uitsluiting voorgelegd aan de bevoegde rechter in het arrondissement waar Kliekjesclub gevestigd is, tenzij dwingend recht anders bepaalt.</li>
            <li>Partijen zullen eerst proberen om geschillen in onderling overleg op te lossen alvorens een geschil aan de rechter voor te leggen.</li>
          </ol>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>Artikel 13 &mdash; Overige bepalingen</h2>
          <ol>
            <li>Indien een bepaling van deze voorwaarden nietig of vernietigbaar is, tast dit de geldigheid van de overige bepalingen niet aan.</li>
            <li>Het nalaten door Kliekjesclub om enig recht of bepaling uit deze voorwaarden uit te oefenen, houdt geen afstand van dat recht in.</li>
            <li>Kliekjesclub mag rechten en verplichtingen uit deze voorwaarden overdragen aan derden, mits dit geen nadelig effect heeft op de rechten van de Gebruiker.</li>
          </ol>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>Artikel 14 &mdash; Contact</h2>
          <p>
            Voor vragen over deze algemene voorwaarden kun je contact opnemen met:
          </p>
          <p>
            <strong>Kliekjesclub</strong><br />
            E-mail:{' '}
            <a href="mailto:info@kliekjesclub.nl" className="font-semibold text-brand-600 hover:text-brand-700">info@kliekjesclub.nl</a>
          </p>
        </section>
      </div>
    </div>
  )
}
