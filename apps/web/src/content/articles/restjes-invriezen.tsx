import type { Article } from './types'
import { P, H2, UL, LI, Strong, A, Callout } from './_components'

export const article: Article = {
  slug: 'restjes-invriezen',
  title: 'Restjes invriezen: alles wat je moet weten',
  description:
    'Welke restjes kun je goed invriezen, welke juist niet? Hoe lang blijven ze in de vriezer goed? Een complete gids met praktische tips.',
  publishedAt: '2026-04-15',
  category: 'praktisch',
  readingMinutes: 6,
  Body,
}

function Body() {
  return (
    <>
      <P>
        De vriezer is je beste vriend tegen voedselverspilling. Wat je vandaag niet opeet, kun je
        morgen, volgende maand of zelfs over een halfjaar nog gebruiken. Maar niet alles laat
        zich even goed invriezen, en de manier waarop je invriest maakt veel uit voor smaak en
        textuur na ontdooien.
      </P>

      <P>
        In dit artikel: welke restjes vriezen goed in, hoe lang blijven ze houdbaar, en de
        belangrijkste do&apos;s en don&apos;ts.
      </P>

      <H2 id="wat-wel">Wat vriest goed in?</H2>

      <UL>
        <LI>
          <Strong>Soep, stoofpot en saus.</Strong> Bevatten al veel vocht en hebben weinig last
          van ijskristallen. Tot 3 maanden goed.
        </LI>
        <LI>
          <Strong>Brood en bakkerijproducten.</Strong> Sneetjes los invriezen of een hele
          krentenbol — direct uit de vriezer in de broodrooster.
        </LI>
        <LI>
          <Strong>Gekookt vlees, kip en gehakt.</Strong> Tot 2 à 3 maanden.
        </LI>
        <LI>
          <Strong>Pasta-saus, lasagne, gevulde pasta.</Strong> Hele schalen of porties — direct
          ovenklaar als je geen tijd hebt om te koken.
        </LI>
        <LI>
          <Strong>Geraspte kaas, gesneden hard fruit.</Strong> Praktisch om snel iets aan een
          gerecht toe te voegen.
        </LI>
        <LI>
          <Strong>Bananen, bessen, mango.</Strong> Ideaal voor smoothies of bananenbrood.
        </LI>
        <LI>
          <Strong>Verse kruiden in olijfolie.</Strong> Hak de kruiden, doe ze in een ijsblokjesvorm
          met olie en je hebt portie-klare smaakmakers.
        </LI>
      </UL>

      <H2 id="wat-niet">Wat juist niet?</H2>

      <UL>
        <LI>
          <Strong>Sla, komkommer, radijs en andere groente met veel water.</Strong> Worden slap en
          waterig na ontdooien.
        </LI>
        <LI>
          <Strong>Aardappel in zijn geheel.</Strong> Wordt korrelig. Aardappelpuree of
          aardappelschijfjes vriezen wél goed in.
        </LI>
        <LI>
          <Strong>Eieren in de schaal.</Strong> Knappen open. Losgeklopt in een bakje gaat wel.
        </LI>
        <LI>
          <Strong>Mayonaise, slasaus en yoghurt.</Strong> Schiften.
        </LI>
        <LI>
          <Strong>Zachte kazen.</Strong> Verliezen textuur. Harde kazen kunnen wel.
        </LI>
        <LI>
          <Strong>Frituurproducten.</Strong> Verliezen knapperigheid en worden zacht na opwarmen.
        </LI>
      </UL>

      <H2 id="hoe-lang">Hoe lang blijven restjes goed in de vriezer?</H2>

      <P>
        Bevroren eten is op een vriezer van -18 °C in principe maandenlang veilig — maar de
        kwaliteit gaat geleidelijk achteruit. Globale richtlijnen voor optimale smaak:
      </P>

      <UL>
        <LI><Strong>Soep en bouillon:</Strong> 3 maanden</LI>
        <LI><Strong>Stoofpot, curry, ovenschotels:</Strong> 3 maanden</LI>
        <LI><Strong>Gebakken vlees en kip:</Strong> 2 tot 3 maanden</LI>
        <LI><Strong>Rauw vlees:</Strong> 4 tot 12 maanden, afhankelijk van soort</LI>
        <LI><Strong>Vis:</Strong> 2 tot 3 maanden</LI>
        <LI><Strong>Brood:</Strong> 1 tot 3 maanden</LI>
        <LI><Strong>Pasta-restjes:</Strong> 1 tot 2 maanden</LI>
        <LI><Strong>Fruit:</Strong> 6 maanden</LI>
        <LI><Strong>Groente (geblancheerd):</Strong> 8 tot 12 maanden</LI>
      </UL>

      <H2 id="goed-invriezen">Hoe vries je goed in?</H2>

      <UL>
        <LI>
          <Strong>Snel afkoelen vóór invriezen.</Strong> Warme gerechten in een ondiepe schaal
          maximaal twee uur op het aanrecht laten afkoelen, daarna in de koelkast en pas dan in
          de vriezer.
        </LI>
        <LI>
          <Strong>In porties.</Strong> Liever 4 bakjes van 1 portie dan 1 grote bak — dan kun je
          ontdooien wat je nodig hebt.
        </LI>
        <LI>
          <Strong>Lucht eruit.</Strong> Diepvrieszakjes platgedrukt of een vacuümzakje voorkomt
          vriesbrand (uitgedroogde plekken).
        </LI>
        <LI>
          <Strong>Met datum en inhoud labelen.</Strong> Anders sta je over twee maanden voor een
          mysterie-bakje.
        </LI>
        <LI>
          <Strong>Niet helemaal vol vullen.</Strong> Vloeistoffen zetten uit bij bevriezen — laat
          1 à 2 cm ruimte aan de bovenkant.
        </LI>
      </UL>

      <H2 id="ontdooien">Hoe ontdooi je veilig?</H2>

      <UL>
        <LI>
          <Strong>In de koelkast (beste optie):</Strong> 12 tot 24 uur, afhankelijk van portie.
        </LI>
        <LI>
          <Strong>In koud water:</Strong> in een afgesloten zakje, water elk halfuur verversen.
        </LI>
        <LI>
          <Strong>In de magnetron op ontdooistand:</Strong> snelste optie, maar daarna direct
          verhitten.
        </LI>
        <LI>
          <Strong>Niet op het aanrecht.</Strong> De buitenkant warmt te snel op terwijl het
          midden nog bevroren is — bacteriegevarenzone.
        </LI>
      </UL>

      <Callout>
        <Strong>Vriezer vol?</Strong> Kliekjesclub is een handige uitlaatklep. Plaats je restjes
        in een paar tikken en iemand in je buurt komt ze ophalen — zonder verspilling én zonder
        dat het in jouw vriezer hoeft.{' '}
        <A href="/aanbieder/dishes/new">Plaats je eerste restje →</A>
      </Callout>
    </>
  )
}
