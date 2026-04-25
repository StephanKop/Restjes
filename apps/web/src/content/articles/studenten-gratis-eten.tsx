import type { Article } from './types'
import { P, H2, OL, UL, LI, Strong, A, Callout } from './_components'

export const article: Article = {
  slug: 'studenten-gratis-eten',
  title: 'Studenten en duurzaam eten: gratis maaltijden ophalen in jouw studentenstad',
  description:
    'Met een studentenbudget op duurzaam eten letten? Praktische tips, plekken om gratis maaltijden te vinden en hoe je zelf voedselverspilling tegengaat.',
  publishedAt: '2026-04-24',
  category: 'duurzaamheid',
  readingMinutes: 5,
  Body,
}

function Body() {
  return (
    <>
      <P>
        Op kamers wonen, een schraal budget, drukke roosters — koken is voor veel studenten een
        bijzaak. Het gevolg: te veel ingekochte boodschappen die in de prullenbak belanden, of
        net te weinig en weer een keer pasta met ketchup. Hieronder: praktische tips om als
        student én duurzamer én goedkoper te eten.
      </P>

      <H2 id="gratis">Plekken voor gratis of goedkope maaltijden</H2>

      <UL>
        <LI>
          <Strong>Kliekjesclub.</Strong> Gratis. Zoek op{' '}
          <A href="/restjes">jouw studentenstad</A> en zie wat er nu in de buurt wordt
          aangeboden — van particulieren én lokale bakkerijen.
        </LI>
        <LI>
          <Strong>Too Good To Go.</Strong> €3-€6 voor een &quot;magic bag&quot; bij horeca aan
          het einde van de dag.
        </LI>
        <LI>
          <Strong>Studentenrestaurants.</Strong> Veel universiteitssteden hebben een
          studentenmensa met maaltijden voor €3-€7.
        </LI>
        <LI>
          <Strong>Kookgroepen.</Strong> Veel studentenverenigingen en buurthuizen organiseren
          kook-met-buren-avonden waar je voor weinig mee-eet.
        </LI>
        <LI>
          <Strong>Voedselbank Studentenpunt.</Strong> In Amsterdam, Utrecht, Leiden en een
          aantal andere steden bestaat een speciaal studentenloket — als je rondkomen lastig
          wordt, is het de moeite waard te informeren.
        </LI>
      </UL>

      <H2 id="boodschappen">Slimmer boodschappen doen op studentenbudget</H2>

      <OL>
        <LI>
          <Strong>Plan eerst, koop dan.</Strong> Schrijf je menu voor de week, kijk wat je nog
          hebt, en koop alleen wat ontbreekt. Bespaart minstens 20% op je boodschappen-budget.
        </LI>
        <LI>
          <Strong>Markt &gt; supermarkt.</Strong> Aan het eind van de marktdag (vaak vrijdag- of
          zaterdagmiddag) verkopen kraampjes hun groente en fruit voor een fractie van de prijs.
        </LI>
        <LI>
          <Strong>Huismerken.</Strong> Voor 80% van de basisproducten (rijst, pasta, bonen,
          olijfolie) is het huismerk gewoon prima.
        </LI>
        <LI>
          <Strong>Vries in.</Strong> Kook één keer per week iets groots — chili, soep,
          pastasaus — en vries 4-5 porties in. Dat scheelt magnetronmaaltijden later.
        </LI>
        <LI>
          <Strong>Kook samen met huisgenoten.</Strong> 1 grote pan curry voor vier kost minder
          per persoon dan vier losse pakken. Beurtelings koken werkt voor iedereen.
        </LI>
      </OL>

      <H2 id="restjes">Restjes verwerken in je studentenkeuken</H2>

      <P>
        Beperkt budget = elk restje telt. Een paar tweede-leven-tips:
      </P>

      <UL>
        <LI>
          <Strong>Pasta van gisteren?</Strong> Bak met ei en kaas tot een{' '}
          <em>frittata di pasta</em>.
        </LI>
        <LI>
          <Strong>Halve ui en aanslag-knoflook?</Strong> Verzamel in een diepvrieszakje en
          gebruik later voor bouillon.
        </LI>
        <LI>
          <Strong>Brood dat hard wordt?</Strong>{' '}
          <A href="/kennisbank/recepten-met-restjes">Wentelteefjes</A>, croutons of broodpudding.
        </LI>
        <LI>
          <Strong>Een handvol groente over?</Strong> Pan-roeren, eitje erover, klaar.
        </LI>
        <LI>
          <Strong>Bakje yoghurt op zijn eind?</Strong> Bevries in ijsjes-vormen voor frozen
          yogurt-snacks.
        </LI>
      </UL>

      <H2 id="zelf-delen">Zelf overschot delen</H2>

      <P>
        Soms gaat het andere kant op: je hebt voor de gezelligheid een grote pan pasta gemaakt
        en zit nu met restjes voor drie. In plaats van weggooien, deel het op{' '}
        <A href="/aanbieder/dishes/new">Kliekjesclub</A>. Iemand in jouw studentenstad is er
        blij mee — én je doet er goed aan voor het milieu.
      </P>

      <H2 id="check">Check je studentenstad</H2>

      <P>Direct kijken wat er nu wordt aangeboden:</P>

      <UL>
        <LI><A href="/restjes/amsterdam">Restjes in Amsterdam</A></LI>
        <LI><A href="/restjes/utrecht">Restjes in Utrecht</A></LI>
        <LI><A href="/restjes/leiden">Restjes in Leiden</A></LI>
        <LI><A href="/restjes/groningen">Restjes in Groningen</A></LI>
        <LI><A href="/restjes/nijmegen">Restjes in Nijmegen</A></LI>
        <LI><A href="/restjes/maastricht">Restjes in Maastricht</A></LI>
        <LI><A href="/restjes/wageningen">Restjes in Wageningen</A></LI>
        <LI><A href="/restjes/delft">Restjes in Delft</A></LI>
        <LI><A href="/restjes/eindhoven">Restjes in Eindhoven</A></LI>
        <LI><A href="/restjes/tilburg">Restjes in Tilburg</A></LI>
      </UL>

      <Callout>
        <Strong>Stadgenoot bij jou in de straat?</Strong> Studenten delen vaak makkelijk met
        andere studenten. Als jij regelmatig restjes hebt, plaats ze; als je vaak zoekt, kijk
        elke avond even.
      </Callout>
    </>
  )
}
