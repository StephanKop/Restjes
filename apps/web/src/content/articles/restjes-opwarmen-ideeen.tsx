import type { Article } from './types'
import { P, H2, OL, LI, Strong, A, Callout } from './_components'

export const article: Article = {
  slug: 'restjes-opwarmen-ideeen',
  title: '10 manieren om kliekjes lekker op te warmen (zonder dat ze taai worden)',
  description:
    'Restjes hoeven niet saai te zijn. Tien praktische ideeën om kliekjes opnieuw lekker te maken — pasta, rijst, pizza, brood en meer.',
  publishedAt: '2026-04-02',
  category: 'praktisch',
  readingMinutes: 5,
  Body,
}

function Body() {
  return (
    <>
      <P>
        De magnetron is snel maar maakt veel restjes taai, droog of slap. Met een paar simpele
        kunstgrepen kun je gisteravond&apos;s pasta, pizza of curry verrassend lekker opwarmen —
        soms zelfs lekkerder dan de eerste keer. Tien beproefde manieren.
      </P>

      <H2 id="1-pasta">1. Pasta met saus: pan, geen magnetron</H2>

      <P>
        Magnetron-pasta wordt droog. Doe in plaats daarvan de pasta in een koekenpan met een
        scheutje pastawater, melk of bouillon, en verwarm met een deksel erop. Het zetmeel komt
        weer los, de saus glijdt opnieuw rond elke sliert.
      </P>

      <H2 id="2-rijst">2. Rijst: een eetlepel water erbij</H2>

      <P>
        Rijst droogt uit in de koelkast. Doe een eetlepel water bij elke 100 gram rijst, dek af
        met een vochtige theedoek of magnetron-deksel, en verwarm 1 minuut op halve kracht. De
        stoom maakt de rijst weer luchtig. Bonus-tip: bak koude rijst met groente, ei en
        sojasaus tot nasi.
      </P>

      <H2 id="3-pizza">3. Pizza: koekenpan, geen magnetron</H2>

      <P>
        Wil je een knapperige bodem en gesmolten kaas? Leg de pizza in een droge koekenpan,
        deksel erop, op laag vuur, 5 minuten. Geen krokant gevoel? Voeg twee druppels water
        ernaast toe — de stoom smelt de kaas perfect.
      </P>

      <H2 id="4-frituurproducten">4. Frituurproducten: airfryer of oven</H2>

      <P>
        Friet, kroketten en gebakken kip horen niet in de magnetron. 4 tot 5 minuten in een
        airfryer of voorverwarmde oven (200 °C) maakt ze weer krokant alsof het de eerste keer
        is.
      </P>

      <H2 id="5-soep-stoofpot">5. Soep en stoofpot: pan, niet magnetron</H2>

      <P>
        Soep wordt op het fornuis gelijkmatiger warm. Roer regelmatig en laat hem even doorkoken
        — door het zachtjes opnieuw &quot;trekken&quot; wordt de smaak vaak zelfs intenser.
      </P>

      <H2 id="6-brood">6. Brood: kwastje water + oven</H2>

      <P>
        Hard geworden brood lijkt verloren — maar niet als je het kort onder de kraan houdt
        (alleen de korst), schudt om overtollig water af te schudden, en 5 minuten in een 180 °C
        oven legt. Het komt eruit alsof het net gebakken is.
      </P>

      <H2 id="7-snijd-anders">7. Maak van een restje een ander gerecht</H2>

      <OL>
        <LI>
          <Strong>Stoofpot</Strong> over een gepofte aardappel met een lepel zure room
        </LI>
        <LI>
          <Strong>Gegrilde groente</Strong> door een omelet of frittata
        </LI>
        <LI>
          <Strong>Rijst</Strong> tot nasi of tot rijstpap (zoet, met kaneel en suiker)
        </LI>
        <LI>
          <Strong>Aardappel</Strong> tot rösti of door een schakshuka
        </LI>
        <LI>
          <Strong>Vleeswaren</Strong> in een tosti of roerbakgerecht
        </LI>
      </OL>

      <H2 id="8-vlees">8. Vlees: laag &amp; langzaam</H2>

      <P>
        Magnetron op vol vermogen verandert kip in zoolleer. Verwarm vlees op halve kracht, met
        een sausje of bouillon erbij voor vocht, en geef het wat extra tijd. Of nog beter: snijd
        het en verwerk het in een koud gerecht — salade, wraps, broodjes.
      </P>

      <H2 id="9-saus-water">9. Magnetron? Een eetlepel water erbij</H2>

      <P>
        Als je tóch de magnetron pakt: voeg altijd een paar druppels water toe en dek af met een
        deksel of vochtige theedoek. De stoom voorkomt uitdroging en zorgt voor gelijkmatigere
        verwarming. Roer halverwege.
      </P>

      <H2 id="10-temperatuur">10. Tot het echt warm is — minimaal 70 °C</H2>

      <P>
        Veiligheid: kliekjes moeten écht door en door warm worden, niet alleen lauw. Zeker bij
        rijst, kip en gehakt. Een keukenthermometer is geen overbodige luxe — 70 °C in het hart
        is de minimale veilige temperatuur.
      </P>

      <Callout>
        <Strong>Restje dat je toch niet meer opeet?</Strong> Geef het weg via{' '}
        <A href="/aanbieder/dishes/new">Kliekjesclub</A>. Iemand in je buurt is er blij mee, en
        jij voorkomt verspilling. Een paar tikken op de telefoon en je gerecht staat online.
      </Callout>
    </>
  )
}
