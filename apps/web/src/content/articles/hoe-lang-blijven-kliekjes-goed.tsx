import type { Article } from './types'
import { P, H2, UL, LI, Strong, A, Callout } from './_components'

export const article: Article = {
  slug: 'hoe-lang-blijven-kliekjes-goed',
  title: 'Hoe lang blijven kliekjes goed in de koelkast?',
  description:
    'Een praktische gids voor hoe lang verschillende kliekjes en restjes veilig zijn in de koelkast — van pasta en rijst tot vlees, vis en soep.',
  publishedAt: '2026-04-08',
  category: 'praktisch',
  readingMinutes: 5,
  Body,
}

function Body() {
  return (
    <>
      <P>
        Je hebt gisteren te veel pasta gekookt, of er staat een halve pan soep in de koelkast. De
        grote vraag: kun je dat morgen, overmorgen of pas volgende week nog veilig opeten? In dit
        artikel zetten we per type gerecht op een rij hoe lang kliekjes goed blijven in de
        koelkast — en wanneer je ze beter kunt invriezen of weggeven.
      </P>

      <Callout>
        <Strong>Algemene vuistregel:</Strong> de meeste warme kliekjes zijn 2 tot 4 dagen
        houdbaar in een koelkast op 4 °C of lager. Vertrouw op je zintuigen: ruikt of kleurt het
        anders, gooi het dan weg. Bij twijfel: niet eten.
      </Callout>

      <H2 id="koelkasttemperatuur">Eerst: hoe koud is je koelkast?</H2>

      <P>
        De houdbaarheid van kliekjes hangt direct af van de temperatuur van je koelkast. Het{' '}
        <A href="https://www.voedingscentrum.nl">Voedingscentrum</A> adviseert{' '}
        <Strong>4 °C of lager</Strong>. In de praktijk staat een koelkast vaak op 6 tot 7 °C —
        warm genoeg om de houdbaarheid van kliekjes flink te verkorten. Een koelkastthermometer
        van een paar euro is de moeite waard om dit te checken.
      </P>

      <H2 id="pasta-rijst">Pasta, rijst en aardappelen</H2>

      <UL>
        <LI>
          <Strong>Gekookte pasta (zonder saus):</Strong> 3 tot 5 dagen.
        </LI>
        <LI>
          <Strong>Pasta met saus:</Strong> 2 tot 3 dagen — de saus is bepalend.
        </LI>
        <LI>
          <Strong>Gekookte rijst:</Strong> 1 tot 2 dagen. Rijst kan de bacterie{' '}
          <em>Bacillus cereus</em> bevatten, die zich snel vermeerdert. Snel afkoelen en
          afgesloten bewaren.
        </LI>
        <LI>
          <Strong>Gekookte aardappelen:</Strong> 2 tot 3 dagen.
        </LI>
      </UL>

      <H2 id="vlees-vis">Vlees, vis en kip</H2>

      <UL>
        <LI>
          <Strong>Gebakken kip of kalkoen:</Strong> 3 tot 4 dagen. Goed door en door verhitten
          bij opwarmen.
        </LI>
        <LI>
          <Strong>Gehakt en gehaktbal:</Strong> 1 tot 2 dagen. Snel achteruit door het grote
          oppervlak.
        </LI>
        <LI>
          <Strong>Gebakken biefstuk of varkensvlees:</Strong> 3 tot 4 dagen.
        </LI>
        <LI>
          <Strong>Gebakken vis:</Strong> 1 tot 2 dagen — vis bederft sneller dan vlees.
        </LI>
        <LI>
          <Strong>Vleeswaren (open verpakking):</Strong> 3 dagen.
        </LI>
      </UL>

      <H2 id="soep-stoofpot">Soep, stoofpot en sauzen</H2>

      <UL>
        <LI>
          <Strong>Groentesoep:</Strong> 3 tot 4 dagen.
        </LI>
        <LI>
          <Strong>Bouillon, kippen- of vleessoep:</Strong> 2 tot 3 dagen. Even opnieuw aan de kook
          brengen voor het opwarmen.
        </LI>
        <LI>
          <Strong>Stoofpot of curry:</Strong> 2 tot 3 dagen, soms wint het zelfs aan smaak op
          dag 2.
        </LI>
        <LI>
          <Strong>Tomatensaus:</Strong> 4 tot 5 dagen door het zuur in tomaten.
        </LI>
      </UL>

      <H2 id="zuivel-eieren">Zuivel, eieren en gebakken eten</H2>

      <UL>
        <LI>
          <Strong>Gekookte eieren in de schaal:</Strong> 7 dagen.
        </LI>
        <LI>
          <Strong>Roerei of omelet:</Strong> 2 dagen.
        </LI>
        <LI>
          <Strong>Open zuivelproducten (yoghurt, kwark):</Strong> volg de TGT-datum, in de regel
          3 tot 5 dagen na openen.
        </LI>
        <LI>
          <Strong>Pizza:</Strong> 2 tot 3 dagen.
        </LI>
      </UL>

      <H2 id="snel-afkoelen">Belangrijk: snel afkoelen</H2>

      <P>
        Wat misschien wel belangrijker is dan hoe lang iets <em>kan</em>: hoe snel je het in de
        koelkast krijgt. Bacteriën groeien het snelst tussen 7 en 60 °C — de zogeheten
        gevarenzone. Laat warme gerechten dus niet uren op het aanrecht staan. Vuistregel:{' '}
        <Strong>binnen 2 uur na bereiding in de koelkast</Strong>, in een ondiepe schaal of
        bakje zodat het snel tot 4 °C zakt.
      </P>

      <H2 id="opwarmen">Veilig opwarmen</H2>

      <P>
        Verwarm kliekjes goed door — minstens 70 °C in het hart van het gerecht, ongeveer 2
        minuten. Vooral bij rijst, gevogelte en gehakt. Eénmaal opgewarmde kliekjes kun je het
        beste niet opnieuw afkoelen en weer opwarmen.
      </P>

      <Callout>
        <Strong>Te veel om op te eten?</Strong> In plaats van weggooien: vries restjes in (zie{' '}
        <A href="/kennisbank/restjes-invriezen">Restjes invriezen</A>) of deel ze met buren via{' '}
        <A href="/aanbieder/dishes/new">Kliekjesclub</A>. Gratis, lokaal en zonder verspilling.
      </Callout>
    </>
  )
}
