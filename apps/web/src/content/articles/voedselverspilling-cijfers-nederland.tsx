import type { Article } from './types'
import { P, H2, UL, LI, Strong, A, Callout, Stat } from './_components'

export const article: Article = {
  slug: 'voedselverspilling-cijfers-nederland',
  title: 'Voedselverspilling in Nederland: de cijfers van 2026',
  description:
    'Hoeveel eten gooien Nederlanders weg? Een overzicht van de cijfers, oorzaken en gevolgen van voedselverspilling in Nederland — en wat jij kunt doen.',
  publishedAt: '2026-04-12',
  updatedAt: '2026-04-25',
  category: 'voedselverspilling',
  readingMinutes: 6,
  Body,
}

function Body() {
  return (
    <>
      <P>
        Voedselverspilling is een van de grootste, meest onzichtbare problemen van ons
        voedselsysteem. We produceren genoeg eten om de hele wereldbevolking te voeden, maar
        wereldwijd belandt zo&apos;n derde van al het voedsel in de prullenbak. Nederland is
        daarbij geen uitzondering — integendeel.
      </P>

      <P>
        In dit artikel zetten we de meest recente cijfers over voedselverspilling in Nederland op
        een rij, leggen we uit waar het mis gaat, en laten we zien wat huishoudens en bedrijven
        eraan kunnen doen.
      </P>

      <H2 id="hoeveel">Hoeveel eten gooit Nederland weg?</H2>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat value="2 mld kg" label="totaal in Nederland per jaar" />
        <Stat value="33 kg" label="per persoon per jaar (huishoudens)" />
        <Stat value="€155" label="weggegooid voedsel per persoon per jaar" />
      </div>

      <P>
        Volgens schattingen van de <A href="https://www.wur.nl">Wageningen University &amp; Research</A>{' '}
        en het Voedingscentrum gooien we in Nederland samen circa{' '}
        <Strong>2 miljard kilo voedsel</Strong> per jaar weg. Dat is omgerekend ruim 110 kilo per
        persoon — verdeeld over huishoudens, supermarkten, horeca en de productieketen.
      </P>

      <P>
        Bij Nederlandse huishoudens gaat het om gemiddeld <Strong>33 kg per persoon per jaar</Strong>.
        Een gemiddeld gezin van vier personen gooit dus zo&apos;n 132 kg eten weg — goed voor ruim{' '}
        <Strong>€620 per jaar</Strong> aan verspilling. Geld dat letterlijk in de groene of
        restafvalbak verdwijnt.
      </P>

      <H2 id="wat-gooien-we-weg">Wat gooien we het meeste weg?</H2>

      <P>
        De grootste boosdoeners zijn opvallend voorspelbaar. De top vijf van meest verspilde
        producten in Nederlandse keukens:
      </P>

      <UL>
        <LI>
          <Strong>Brood en bakkerijproducten</Strong> — het meest verspilde product in Nederland.
          We kopen vaker en kleinere hoeveelheden dan we werkelijk opeten.
        </LI>
        <LI>
          <Strong>Zuivel</Strong> — vooral melk en yoghurt waarvan de THT-datum is verlopen, terwijl
          ze vaak nog perfect drinkbaar zijn.
        </LI>
        <LI>
          <Strong>Groente en fruit</Strong> — verlepte sla, te zachte tomaten, bruine bananen.
          Vaak nog goed te verwerken in soepen of smoothies.
        </LI>
        <LI>
          <Strong>Restjes van warme maaltijden</Strong> — pastaschotels, rijstgerechten en
          stoofpotjes die in de koelkast blijven staan.
        </LI>
        <LI>
          <Strong>Vlees en vis</Strong> — minder vaak verspild qua gewicht, maar wel met de
          hoogste milieu-impact per kilogram.
        </LI>
      </UL>

      <H2 id="waarom">Waarom verspillen we zoveel?</H2>

      <P>
        De oorzaken zijn een mix van praktisch, sociaal en psychologisch. De vier vaakst genoemde
        redenen in Nederlands consumentenonderzoek:
      </P>

      <UL>
        <LI>
          <Strong>Te veel inkopen.</Strong> Aanbiedingen, grote verpakkingen en boodschappen
          zonder duidelijk plan leiden tot een volle koelkast met spullen die niet allemaal
          opraken.
        </LI>
        <LI>
          <Strong>Verwarring over THT en TGT.</Strong> &quot;Ten minste houdbaar tot&quot; (THT) is
          een kwaliteitsdatum, geen veiligheidsdatum. Veel producten zijn na de THT nog prima.
          &quot;Te gebruiken tot&quot; (TGT) is wél een veiligheidsdatum.
        </LI>
        <LI>
          <Strong>Te veel koken.</Strong> Veel huishoudens koken meer dan ze nodig hebben uit
          gewoonte of voor het geval er gasten komen.
        </LI>
        <LI>
          <Strong>Geen plan voor restjes.</Strong> Restjes verdwijnen achterin de koelkast en
          worden uiteindelijk weggegooid omdat niemand er meer naar omkijkt.
        </LI>
      </UL>

      <H2 id="impact">De impact op klimaat en portemonnee</H2>

      <P>
        Voedselverspilling is verantwoordelijk voor naar schatting <Strong>8 tot 10% van de
        wereldwijde broeikasgasuitstoot</Strong>. Als voedselverspilling een land was, zou het na
        China en de VS de derde grootste vervuiler ter wereld zijn.
      </P>

      <P>
        Voor Nederlandse consumenten betekent verspilling vooral een gemiste kans: het geld dat
        in de afvalbak verdwijnt is reëel inkomen. De Nederlandse overheid heeft als doel om
        voedselverspilling tegen 2030 met 50% te halveren, in lijn met VN-doelstellingen.
      </P>

      <Callout>
        <Strong>Wat jij kunt doen:</Strong> deel je restjes met buren via Kliekjesclub. Eén
        gedeeld gerecht voorkomt zo&apos;n 0,5 tot 1 kg voedselverspilling — én geeft iemand
        anders een lekkere maaltijd. <A href="/aanbieder/dishes/new">Plaats je eerste restje</A>{' '}
        of <A href="/browse">bekijk wat er in jouw buurt te halen is</A>.
      </Callout>

      <H2 id="bronnen">Bronnen</H2>

      <UL>
        <LI>
          Wageningen University &amp; Research, &quot;Voedselverspilling Monitor Nederland&quot;
          (meest recente publicatie).
        </LI>
        <LI>
          Voedingscentrum, gemiddelde verspilling per persoon en categorie-overzicht.
        </LI>
        <LI>
          Stichting Samen Tegen Voedselverspilling — coalitie van Nederlandse overheid, retail en
          maatschappelijke organisaties.
        </LI>
        <LI>UN Food Waste Index Report — globale cijfers en trends.</LI>
      </UL>
    </>
  )
}
