import type { Article } from './types'
import { P, H2, OL, LI, Strong, A, Callout } from './_components'

export const article: Article = {
  slug: 'duurzaam-eten-thuis',
  title: 'Duurzaam eten: 8 manieren om thuis voedselverspilling te verminderen',
  description:
    'Concrete tips om thuis minder eten weg te gooien — van slim boodschappen doen en koelkastorganisatie tot restjes delen met buren.',
  publishedAt: '2026-04-22',
  category: 'duurzaamheid',
  readingMinutes: 6,
  Body,
}

function Body() {
  return (
    <>
      <P>
        Duurzaam eten begint niet bij wat je koopt, maar bij wat je <em>niet</em> weggooit.
        Onderzoek laat zien dat het terugdringen van voedselverspilling thuis één van de
        grootste persoonlijke klimaatwinsten is — groter dan minder vlees eten of de auto laten
        staan. Acht concrete dingen die je vandaag nog kunt doen.
      </P>

      <H2 id="1-plan">1. Plan je week voordat je boodschappen doet</H2>

      <P>
        Het klinkt saai, maar boodschappen doen zonder plan is verspilling-machine nummer één.
        Schrijf op wat je deze week wilt eten, kijk wat er nog in huis is, en koop alleen wat
        ontbreekt. Een wekelijks menu met ruimte voor één &quot;restjes-avond&quot; werkt
        verrassend goed.
      </P>

      <H2 id="2-koelkast">2. Organiseer je koelkast met &quot;eerst eten&quot;</H2>

      <P>
        Reserveer één plank — bij voorkeur op ooghoogte — voor producten die binnenkort op
        moeten. Alles wat je opent of producten met een bijna verlopen datum verhuizen naar dat
        plekje. Zo verdwijnt er niets meer achterin.
      </P>

      <H2 id="3-tht-tgt">3. Leer het verschil tussen THT en TGT</H2>

      <OL>
        <LI>
          <Strong>THT (Ten minste houdbaar tot)</Strong> is een kwaliteitsdatum. Producten zijn
          vaak nog dagen, weken of maanden goed na deze datum. Vertrouw op je zintuigen.
        </LI>
        <LI>
          <Strong>TGT (Te gebruiken tot)</Strong> is een veiligheidsdatum, vaak op kwetsbare
          producten als rauw vlees, vis en voorverpakte salades. Hou je hier wél strikt aan.
        </LI>
      </OL>

      <P>
        Volgens schattingen gooien Nederlanders alleen al 600 miljoen kilo eten per jaar weg
        omdat de THT verlopen was — terwijl het meeste daarvan nog prima was.
      </P>

      <H2 id="4-portie">4. Kook bewuster qua porties</H2>

      <P>
        Een gemiddeld huishouden kookt zo&apos;n 20% meer dan dat ze opeet. Gebruik een maatbeker
        voor pasta en rijst, of weeg een keer een goede portie af zodat je een gevoel
        ontwikkelt. 75 g pasta per persoon, 60 g rijst, 250 g groente — een prima richtlijn.
      </P>

      <H2 id="5-invriezen">5. Vries strategisch in</H2>

      <P>
        Een vriezer is een tijdmachine. Wat je vandaag te veel hebt, kun je over twee maanden
        nog opeten. Zie ons artikel{' '}
        <A href="/kennisbank/restjes-invriezen">Restjes invriezen</A> voor wat wel en wat niet
        goed invriest.
      </P>

      <H2 id="6-restjes-recepten">6. Maak van restjes een nieuw gerecht</H2>

      <P>
        Pasta van gisteren wordt vandaag een ovenschotel, rijst wordt nasi, oud brood wordt
        wentelteefjes. We hebben{' '}
        <A href="/kennisbank/recepten-met-restjes">7 recepten met restjes</A> verzameld die in
        ongeveer 30 minuten klaar zijn.
      </P>

      <H2 id="7-deel">7. Deel wat je niet opkrijgt</H2>

      <P>
        Soms heb je gewoon te veel. In plaats van weggooien: deel met buren, vrienden of via een
        platform als Kliekjesclub. Een paar tikken op je telefoon en iemand uit je straat haalt
        je restje op.
      </P>

      <P>
        Gemiddeld voorkomt één gedeeld restje 0,5 tot 1 kg voedselverspilling — én geeft het
        iemand anders een gratis maaltijd. Win-win.
      </P>

      <H2 id="8-meten">8. Meet wat je weggooit</H2>

      <P>
        Je weet pas hoe groot je verspilling is als je het bijhoudt. Een week lang noteren wat
        er in de bak gaat is meestal een eye-opener. Het Voedingscentrum heeft hiervoor een
        gratis &quot;Verspillingsdagboek&quot; — confronterend, maar effectief.
      </P>

      <Callout>
        <Strong>Eén stap vandaag:</Strong> kijk in je koelkast wat er deze week op moet, en kook
        daar je avondeten omheen. En als er over blijft —{' '}
        <A href="/aanbieder/dishes/new">deel het op Kliekjesclub</A>.
      </Callout>

      <H2 id="meer-impact">Wil je meer impact?</H2>

      <OL>
        <LI>
          Doe mee aan de jaarlijkse <strong>Verspillingsvrije Week</strong> (vaak in september).
        </LI>
        <LI>
          Kijk eens bij <A href="/restjes">Restjes per stad</A> wat er in jouw buurt al wordt
          gedeeld.
        </LI>
        <LI>
          Volg organisaties als Stichting Samen Tegen Voedselverspilling, Too Good To Go en
          Voedingscentrum voor up-to-date tips en data.
        </LI>
      </OL>
    </>
  )
}
