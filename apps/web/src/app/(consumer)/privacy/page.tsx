import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacybeleid',
  description: 'Lees hoe Kliekjesclub omgaat met je persoonsgegevens en privacy.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-extrabold text-warm-900">Privacybeleid</h1>
      <p className="mb-8 text-sm text-warm-400">Laatst bijgewerkt: 13 april 2026</p>

      <div className="space-y-8 text-warm-700 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-warm-900 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-warm-800 [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:leading-relaxed">

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>1. Inleiding</h2>
          <p>
            Kliekjesclub (&ldquo;wij&rdquo;, &ldquo;ons&rdquo;, &ldquo;onze&rdquo;) hecht veel waarde aan de bescherming van je persoonsgegevens.
            In dit privacybeleid leggen wij uit welke gegevens wij verzamelen, waarom wij dat doen,
            hoe wij ze gebruiken en welke rechten je hebt met betrekking tot je persoonsgegevens.
          </p>
          <p>
            Dit beleid is van toepassing op het gebruik van de website kliekjesclub.nl, de mobiele
            applicatie en alle bijbehorende diensten (samen het &ldquo;Platform&rdquo;).
          </p>
          <p>
            Door gebruik te maken van ons Platform ga je akkoord met de verwerking van je
            persoonsgegevens zoals beschreven in dit privacybeleid.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>2. Verwerkingsverantwoordelijke</h2>
          <p>
            De verwerkingsverantwoordelijke voor de verwerking van persoonsgegevens via het Platform is:
          </p>
          <p>
            <strong>Kliekjesclub</strong><br />
            E-mail: info@kliekjesclub.nl<br />
            KvK-nummer: [invullen]<br />
          </p>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>3. Welke gegevens verzamelen wij</h2>

          <h3>3.1 Gegevens die je zelf verstrekt</h3>
          <ul>
            <li><strong>Accountgegevens:</strong> naam, e-mailadres, wachtwoord, woonplaats en optioneel een profielfoto en telefoonnummer.</li>
            <li><strong>Aanbiedersprofiel:</strong> bedrijfsnaam, beschrijving, adresgegevens, telefoonnummer, website en logo wanneer je je registreert als aanbieder.</li>
            <li><strong>Gerechten:</strong> titel, beschrijving, foto&apos;s, ingredi&euml;nten, allergeneninformatie, ophaalgegevens en dieetlabels van gerechten die je plaatst.</li>
            <li><strong>Berichten:</strong> inhoud van chatberichten die je verstuurt via het Platform.</li>
            <li><strong>Beoordelingen:</strong> sterrenbeoordelingen en geschreven reviews die je plaatst.</li>
            <li><strong>Reserveringen:</strong> gegevens over je reserveringen, inclusief aantallen en opmerkingen.</li>
          </ul>

          <h3>3.2 Gegevens die automatisch worden verzameld</h3>
          <ul>
            <li><strong>Apparaatgegevens:</strong> type apparaat, besturingssysteem en unieke apparaat-ID&apos;s voor het verzenden van pushnotificaties.</li>
            <li><strong>Gebruiksgegevens:</strong> informatie over hoe je het Platform gebruikt, zoals bezochte pagina&apos;s en uitgevoerde acties.</li>
            <li><strong>Locatiegegevens:</strong> bij het gebruik van locatiegebaseerd zoeken wordt je locatie verwerkt om relevante resultaten te tonen. Dit gebeurt alleen met je toestemming.</li>
          </ul>

          <h3>3.3 Gegevens via derden</h3>
          <ul>
            <li><strong>Google-login:</strong> wanneer je inlogt via Google ontvangen wij je naam, e-mailadres en profielfoto van Google.</li>
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>4. Doeleinden van verwerking</h2>
          <p>Wij verwerken je persoonsgegevens voor de volgende doeleinden:</p>
          <ul>
            <li><strong>Dienstverlening:</strong> het aanmaken en beheren van je account, het faciliteren van reserveringen, berichten en beoordelingen.</li>
            <li><strong>Communicatie:</strong> het versturen van notificaties over reserveringen, berichten en statuswijzigingen.</li>
            <li><strong>Veiligheid:</strong> het waarborgen van de veiligheid en integriteit van het Platform.</li>
            <li><strong>Verbetering:</strong> het analyseren van gebruikspatronen om het Platform te verbeteren.</li>
            <li><strong>Wettelijke verplichtingen:</strong> het voldoen aan wettelijke verplichtingen, zoals het bijhouden van administratie.</li>
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>5. Rechtsgronden voor verwerking</h2>
          <p>Wij verwerken je persoonsgegevens op basis van de volgende rechtsgronden (AVG/GDPR):</p>
          <ul>
            <li><strong>Uitvoering van een overeenkomst (art. 6 lid 1 sub b AVG):</strong> verwerking is noodzakelijk voor het uitvoeren van de dienst die je bij ons afneemt.</li>
            <li><strong>Toestemming (art. 6 lid 1 sub a AVG):</strong> voor het verzenden van pushnotificaties en het verwerken van locatiegegevens.</li>
            <li><strong>Gerechtvaardigd belang (art. 6 lid 1 sub f AVG):</strong> voor het verbeteren van het Platform en het waarborgen van de veiligheid.</li>
            <li><strong>Wettelijke verplichting (art. 6 lid 1 sub c AVG):</strong> voor het voldoen aan wettelijke bewaarplichten.</li>
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>6. Delen van gegevens</h2>
          <p>Wij delen je persoonsgegevens alleen in de volgende gevallen:</p>
          <ul>
            <li><strong>Andere gebruikers:</strong> je openbare profielnaam, profielfoto, beoordelingen en aanbiedersgegevens zijn zichtbaar voor andere gebruikers van het Platform.</li>
            <li><strong>Chatpartners:</strong> berichten die je stuurt zijn zichtbaar voor de ontvanger.</li>
            <li><strong>Dienstverleners:</strong> wij maken gebruik van de volgende verwerkers:
              <ul>
                <li>Supabase (database, authenticatie en opslag) &mdash; servers in de EU</li>
                <li>Vercel (hosting) &mdash; servers in de EU/VS</li>
                <li>Expo (pushnotificaties) &mdash; servers in de VS</li>
                <li>Google (authenticatie via Google-login) &mdash; servers wereldwijd</li>
              </ul>
            </li>
            <li><strong>Wettelijke verplichtingen:</strong> wij kunnen gegevens delen wanneer wij daartoe wettelijk verplicht zijn.</li>
          </ul>
          <p>Wij verkopen je persoonsgegevens nooit aan derden.</p>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>7. Bewaartermijnen</h2>
          <p>Wij bewaren je persoonsgegevens niet langer dan noodzakelijk:</p>
          <ul>
            <li><strong>Accountgegevens:</strong> worden bewaard zolang je account actief is en tot maximaal 12 maanden na verwijdering van je account.</li>
            <li><strong>Berichten:</strong> worden bewaard zolang het gesprek bestaat en tot maximaal 6 maanden na verwijdering van een van de betrokken accounts.</li>
            <li><strong>Beoordelingen:</strong> worden bewaard zolang het Platform actief is, tenzij je verzoekt om verwijdering.</li>
            <li><strong>Gerechten:</strong> verlopen gerechten worden na 30 dagen automatisch verwijderd.</li>
            <li><strong>Pushnotificatie-tokens:</strong> worden verwijderd zodra je uitlogt of je account verwijdert.</li>
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>8. Beveiliging</h2>
          <p>
            Wij nemen passende technische en organisatorische maatregelen om je persoonsgegevens te
            beschermen tegen verlies, misbruik en onbevoegde toegang. Hieronder vallen onder andere:
          </p>
          <ul>
            <li>Versleutelde verbindingen (HTTPS/TLS) voor alle communicatie</li>
            <li>Wachtwoorden worden versleuteld opgeslagen (hashing)</li>
            <li>Row Level Security (RLS) op databaseniveau zodat gebruikers alleen hun eigen gegevens kunnen inzien</li>
            <li>Beveiligde opslag van sessietokens</li>
            <li>Regelmatige beveiligingsupdates van het Platform</li>
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>9. Je rechten</h2>
          <p>Op grond van de AVG/GDPR heb je de volgende rechten:</p>
          <ul>
            <li><strong>Recht op inzage:</strong> je kunt opvragen welke persoonsgegevens wij van je verwerken.</li>
            <li><strong>Recht op rectificatie:</strong> je kunt onjuiste of onvolledige gegevens laten corrigeren.</li>
            <li><strong>Recht op verwijdering:</strong> je kunt verzoeken om verwijdering van je persoonsgegevens.</li>
            <li><strong>Recht op beperking:</strong> je kunt verzoeken om beperking van de verwerking van je gegevens.</li>
            <li><strong>Recht op overdraagbaarheid:</strong> je kunt verzoeken om je gegevens in een gestructureerd formaat te ontvangen.</li>
            <li><strong>Recht op bezwaar:</strong> je kunt bezwaar maken tegen de verwerking van je gegevens op basis van gerechtvaardigd belang.</li>
            <li><strong>Recht op intrekking van toestemming:</strong> je kunt eerder gegeven toestemming altijd intrekken.</li>
          </ul>
          <p>
            Om je rechten uit te oefenen kun je contact met ons opnemen via{' '}
            <a href="mailto:info@kliekjesclub.nl" className="font-semibold text-brand-600 hover:text-brand-700">info@kliekjesclub.nl</a>.
            Wij reageren binnen 30 dagen op je verzoek.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>10. Cookies</h2>
          <p>
            Het Platform maakt gebruik van essenti&euml;le cookies die noodzakelijk zijn voor het
            functioneren van de dienst, zoals sessiecookies voor authenticatie. Wij plaatsen geen
            tracking- of advertentiecookies.
          </p>
          <p>
            Essenti&euml;le cookies vallen onder de uitzondering van de cookiewet en vereisen geen
            voorafgaande toestemming.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>11. Internationale doorgifte</h2>
          <p>
            Sommige van onze dienstverleners (Vercel, Expo, Google) verwerken gegevens buiten de
            Europese Economische Ruimte (EER). In dat geval zorgen wij ervoor dat er passende
            waarborgen zijn getroffen, zoals Standard Contractual Clauses (SCC&apos;s) of een
            adequaatheidsbesluit van de Europese Commissie.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>12. Minderjarigen</h2>
          <p>
            Het Platform is niet bedoeld voor personen jonger dan 16 jaar. Wij verzamelen niet
            bewust persoonsgegevens van minderjarigen. Als wij ontdekken dat wij gegevens van een
            minderjarige hebben verzameld, verwijderen wij deze zo snel mogelijk.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>13. Klachten</h2>
          <p>
            Als je een klacht hebt over de verwerking van je persoonsgegevens, horen wij dat graag.
            Neem contact met ons op via{' '}
            <a href="mailto:info@kliekjesclub.nl" className="font-semibold text-brand-600 hover:text-brand-700">info@kliekjesclub.nl</a>.
          </p>
          <p>
            Je hebt ook altijd het recht om een klacht in te dienen bij de Autoriteit
            Persoonsgegevens (AP), de Nederlandse toezichthouder voor gegevensbescherming:{' '}
            <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 hover:text-brand-700">
              autoriteitpersoonsgegevens.nl
            </a>.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>14. Wijzigingen</h2>
          <p>
            Wij kunnen dit privacybeleid van tijd tot tijd wijzigen. Wijzigingen worden gepubliceerd
            op deze pagina met een bijgewerkte datum. Bij belangrijke wijzigingen stellen wij je
            hiervan op de hoogte via het Platform of per e-mail.
          </p>
          <p>
            Wij raden je aan om dit beleid regelmatig te raadplegen.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-card">
          <h2>15. Contact</h2>
          <p>
            Heb je vragen over dit privacybeleid of over de verwerking van je persoonsgegevens?
            Neem dan contact met ons op:
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
