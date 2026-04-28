-- Seed the kennisbank with the 9 articles previously stored as TSX in
-- apps/web/src/content/articles/. Idempotent via INSERT...ON CONFLICT.
-- Body is markdown with three custom directives:
--   :::callout … :::            → highlighted aside
--   :::stats / ::stat{...} :::  → 3-column stat grid
-- All standard CommonMark + GFM is supported.

-- ============================================================
-- 1. duurzaam-eten-thuis
-- ============================================================
INSERT INTO public.articles (
  slug, title, description, category, body_md, reading_minutes, published_at
) VALUES (
  'duurzaam-eten-thuis',
  'Duurzaam eten: 8 manieren om thuis voedselverspilling te verminderen',
  'Concrete tips om thuis minder eten weg te gooien — van slim boodschappen doen en koelkastorganisatie tot restjes delen met buren.',
  'duurzaamheid',
  $md$Duurzaam eten begint niet bij wat je koopt, maar bij wat je *niet* weggooit. Onderzoek laat zien dat het terugdringen van voedselverspilling thuis één van de grootste persoonlijke klimaatwinsten is — groter dan minder vlees eten of de auto laten staan. Acht concrete dingen die je vandaag nog kunt doen.

## 1. Plan je week voordat je boodschappen doet

Het klinkt saai, maar boodschappen doen zonder plan is verspilling-machine nummer één. Schrijf op wat je deze week wilt eten, kijk wat er nog in huis is, en koop alleen wat ontbreekt. Een wekelijks menu met ruimte voor één "restjes-avond" werkt verrassend goed.

## 2. Organiseer je koelkast met "eerst eten"

Reserveer één plank — bij voorkeur op ooghoogte — voor producten die binnenkort op moeten. Alles wat je opent of producten met een bijna verlopen datum verhuizen naar dat plekje. Zo verdwijnt er niets meer achterin.

## 3. Leer het verschil tussen THT en TGT

1. **THT (Ten minste houdbaar tot)** is een kwaliteitsdatum. Producten zijn vaak nog dagen, weken of maanden goed na deze datum. Vertrouw op je zintuigen.
2. **TGT (Te gebruiken tot)** is een veiligheidsdatum, vaak op kwetsbare producten als rauw vlees, vis en voorverpakte salades. Hou je hier wél strikt aan.

Volgens schattingen gooien Nederlanders alleen al 600 miljoen kilo eten per jaar weg omdat de THT verlopen was — terwijl het meeste daarvan nog prima was.

## 4. Kook bewuster qua porties

Een gemiddeld huishouden kookt zo'n 20% meer dan dat ze opeet. Gebruik een maatbeker voor pasta en rijst, of weeg een keer een goede portie af zodat je een gevoel ontwikkelt. 75 g pasta per persoon, 60 g rijst, 250 g groente — een prima richtlijn.

## 5. Vries strategisch in

Een vriezer is een tijdmachine. Wat je vandaag te veel hebt, kun je over twee maanden nog opeten. Zie ons artikel [Restjes invriezen](/kennisbank/restjes-invriezen) voor wat wel en wat niet goed invriest.

## 6. Maak van restjes een nieuw gerecht

Pasta van gisteren wordt vandaag een ovenschotel, rijst wordt nasi, oud brood wordt wentelteefjes. We hebben [7 recepten met restjes](/kennisbank/recepten-met-restjes) verzameld die in ongeveer 30 minuten klaar zijn.

## 7. Deel wat je niet opkrijgt

Soms heb je gewoon te veel. In plaats van weggooien: deel met buren, vrienden of via een platform als Kliekjesclub. Een paar tikken op je telefoon en iemand uit je straat haalt je restje op.

Gemiddeld voorkomt één gedeeld restje 0,5 tot 1 kg voedselverspilling — én geeft het iemand anders een gratis maaltijd. Win-win.

## 8. Meet wat je weggooit

Je weet pas hoe groot je verspilling is als je het bijhoudt. Een week lang noteren wat er in de bak gaat is meestal een eye-opener. Het Voedingscentrum heeft hiervoor een gratis "Verspillingsdagboek" — confronterend, maar effectief.

:::callout
**Eén stap vandaag:** kijk in je koelkast wat er deze week op moet, en kook daar je avondeten omheen. En als er over blijft — [deel het op Kliekjesclub](/aanbieder/dishes/new).
:::

## Wil je meer impact?

1. Doe mee aan de jaarlijkse **Verspillingsvrije Week** (vaak in september).
2. Kijk eens bij [Restjes per stad](/restjes) wat er in jouw buurt al wordt gedeeld.
3. Volg organisaties als Stichting Samen Tegen Voedselverspilling, Too Good To Go en Voedingscentrum voor up-to-date tips en data.
$md$,
  6,
  '2026-04-22T00:00:00Z'
) ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 2. hoe-lang-blijven-kliekjes-goed
-- ============================================================
INSERT INTO public.articles (
  slug, title, description, category, body_md, reading_minutes, published_at
) VALUES (
  'hoe-lang-blijven-kliekjes-goed',
  'Hoe lang blijven kliekjes goed in de koelkast?',
  'Een praktische gids voor hoe lang verschillende kliekjes en restjes veilig zijn in de koelkast — van pasta en rijst tot vlees, vis en soep.',
  'praktisch',
  $md$Je hebt gisteren te veel pasta gekookt, of er staat een halve pan soep in de koelkast. De grote vraag: kun je dat morgen, overmorgen of pas volgende week nog veilig opeten? In dit artikel zetten we per type gerecht op een rij hoe lang kliekjes goed blijven in de koelkast — en wanneer je ze beter kunt invriezen of weggeven.

:::callout
**Algemene vuistregel:** de meeste warme kliekjes zijn 2 tot 4 dagen houdbaar in een koelkast op 4 °C of lager. Vertrouw op je zintuigen: ruikt of kleurt het anders, gooi het dan weg. Bij twijfel: niet eten.
:::

## Eerst: hoe koud is je koelkast?

De houdbaarheid van kliekjes hangt direct af van de temperatuur van je koelkast. Het [Voedingscentrum](https://www.voedingscentrum.nl) adviseert **4 °C of lager**. In de praktijk staat een koelkast vaak op 6 tot 7 °C — warm genoeg om de houdbaarheid van kliekjes flink te verkorten. Een koelkastthermometer van een paar euro is de moeite waard om dit te checken.

## Pasta, rijst en aardappelen

- **Gekookte pasta (zonder saus):** 3 tot 5 dagen.
- **Pasta met saus:** 2 tot 3 dagen — de saus is bepalend.
- **Gekookte rijst:** 1 tot 2 dagen. Rijst kan de bacterie *Bacillus cereus* bevatten, die zich snel vermeerdert. Snel afkoelen en afgesloten bewaren.
- **Gekookte aardappelen:** 2 tot 3 dagen.

## Vlees, vis en kip

- **Gebakken kip of kalkoen:** 3 tot 4 dagen. Goed door en door verhitten bij opwarmen.
- **Gehakt en gehaktbal:** 1 tot 2 dagen. Snel achteruit door het grote oppervlak.
- **Gebakken biefstuk of varkensvlees:** 3 tot 4 dagen.
- **Gebakken vis:** 1 tot 2 dagen — vis bederft sneller dan vlees.
- **Vleeswaren (open verpakking):** 3 dagen.

## Soep, stoofpot en sauzen

- **Groentesoep:** 3 tot 4 dagen.
- **Bouillon, kippen- of vleessoep:** 2 tot 3 dagen. Even opnieuw aan de kook brengen voor het opwarmen.
- **Stoofpot of curry:** 2 tot 3 dagen, soms wint het zelfs aan smaak op dag 2.
- **Tomatensaus:** 4 tot 5 dagen door het zuur in tomaten.

## Zuivel, eieren en gebakken eten

- **Gekookte eieren in de schaal:** 7 dagen.
- **Roerei of omelet:** 2 dagen.
- **Open zuivelproducten (yoghurt, kwark):** volg de TGT-datum, in de regel 3 tot 5 dagen na openen.
- **Pizza:** 2 tot 3 dagen.

## Belangrijk: snel afkoelen

Wat misschien wel belangrijker is dan hoe lang iets *kan*: hoe snel je het in de koelkast krijgt. Bacteriën groeien het snelst tussen 7 en 60 °C — de zogeheten gevarenzone. Laat warme gerechten dus niet uren op het aanrecht staan. Vuistregel: **binnen 2 uur na bereiding in de koelkast**, in een ondiepe schaal of bakje zodat het snel tot 4 °C zakt.

## Veilig opwarmen

Verwarm kliekjes goed door — minstens 70 °C in het hart van het gerecht, ongeveer 2 minuten. Vooral bij rijst, gevogelte en gehakt. Eénmaal opgewarmde kliekjes kun je het beste niet opnieuw afkoelen en weer opwarmen.

:::callout
**Te veel om op te eten?** In plaats van weggooien: vries restjes in (zie [Restjes invriezen](/kennisbank/restjes-invriezen)) of deel ze met buren via [Kliekjesclub](/aanbieder/dishes/new). Gratis, lokaal en zonder verspilling.
:::
$md$,
  5,
  '2026-04-08T00:00:00Z'
) ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 3. horeca-overgebleven-eten
-- ============================================================
INSERT INTO public.articles (
  slug, title, description, category, body_md, reading_minutes, published_at
) VALUES (
  'horeca-overgebleven-eten',
  'Tips voor horeca: wat doe je met overgebleven eten aan het einde van de dag?',
  'Voor restaurants, bakkerijen en lunchrooms: praktische opties om overschot om te zetten in waarde — voor de zaak, het personeel én de buurt.',
  'voedselverspilling',
  $md$Geen ondernemer in de horeca calculeert *op* verspilling — toch hoort het bij het vak. Een bakkerij die om 16:00 uitverkocht is, mist omzet; een bakkerij die om 18:00 nog vol staat, gooit weg. Dezelfde logica geldt voor restaurants, lunchrooms, broodjeszaken en cafés. In dit artikel: zes praktische opties om overschot om te zetten in iets waardevols.

## 1. Personeelsmaaltijd

De makkelijkste eerste stap. Wat aan het eind van de service overblijft, gaat naar het team. Goed voor sfeer, scheelt personeelskosten (in sommige cao's mag dit als secundaire arbeidsvoorwaarde gelden) en geen gedoe met externe partijen. Veel zaken doen dit al, maar lang niet alle.

## 2. Doneren aan Voedselbank of buurthuis

Voor structureel overschot van langere houdbaarheid (verpakte producten, brood, ingevroren) is samenwerking met de Voedselbank een optie. Voorwaarden:

- Geen producten over de TGT-datum;
- Volgens HACCP gekoeld of bewaard;
- Vooraf afgestemd in welke vorm en hoeveelheid je aanbiedt.

Voor warme maaltijden is dit lastiger door temperatuurregels — daar zijn andere routes beter geschikt.

## 3. Platforms voor restjes-aanbod

De afgelopen jaren zijn er een aantal platforms ontstaan die professionals helpen om overschot om te zetten in waarde:

- **Too Good To Go** — verkoop verrassingspakketten voor zo'n een derde van de prijs. Verdient nog wat aan wat anders weggegooid zou worden, geen commissie boven een vast bedrag per pakket.
- **Kliekjesclub** — gratis platform voor zowel particulieren als horeca. Plaats overgebleven gerechten met titel, ophaalmoment en aantal porties; mensen in de buurt reserveren en halen op. Geen commissie. Vooral handig voor specifieke gerechten die je toch wil benoemen, of voor donerende horeca. [Plaats je eerste gerecht →](/aanbieder/dishes/new)
- **ResQ Club / lokale apps** — minder bekend in NL maar populair in Belgisch grensgebied.

## 4. Verwerk overschot anders

Wat vandaag overblijft kan morgen op de kaart staan in een andere vorm. Klassieke keukentruc:

1. **Brood** wordt croutons, paneermeel, bread pudding of wentelteefjes.
2. **Verlepte groente** wordt soep, bouillon of pesto.
3. **Restjes vlees of vis** worden ragout, croquetten of een dagschotel.
4. **Overrijp fruit** wordt jam, chutney, smoothie of dessert.
5. **Restjes pasta of risotto** worden arancini of pastaschotel.

## 5. Pas je voorraadbeleid aan

Verspilling structureel verminderen begint bij minder produceren of inkopen. Tips uit het [Samen Tegen Voedselverspilling-programma](https://samentegenvoedselverspilling.nl/):

- **Meet wat er weggaat.** Een week lang noteren in welke categorie het meeste verspild wordt, geeft enorme inzicht. Vaak blijken een paar producten verantwoordelijk voor 60% van het probleem.
- **Werk met dagaanbod en seizoensgerechten.** Een wisselende dagschotel kan inzet zijn voor restanten van eergisteren — eerlijk gepositioneerd is dat zelfs marketing-waardig ("onze chefs werken 100% verspillingsvrij").
- **Snij portiegrootte slim.** Te grote borden gaan altijd voor een deel terug naar de keuken. Twee portiematen aanbieden (*klein* en *groot*) reduceert verspilling én vergroot toegankelijkheid.

## 6. Maak het zichtbaar voor je gasten

Communicatie over jouw aanpak is geen marketingtruc — het is informatie waar consumenten anno 2026 actief op letten. Gemiddelde Nederlanders vinden duurzaamheid belangrijk, en nog meer als ze zien dat een lokale ondernemer er werk van maakt.

- Een bordje "wij delen onze restjes via Kliekjesclub" werkt.
- Op je website een kort tabje over wat je doet aan voedselverspilling.
- Sticker op de deur van het project "Samen Tegen Voedselverspilling".

## Tot slot

De keuken is altijd een plek geweest waar verspilling werd vermeden — eeuwenlang werd elk botje, elke schil, elke korst hergebruikt. Moderne horeca staat onder andere druk: wisselende vraag, hoge kwaliteitsverwachtingen, smalle marges. Maar elke kilo voedsel die je niet weggooit is winst — letterlijk financieel en in klimaat-impact.

:::callout
**Begin klein:** één avond per week je overschot delen via [Kliekjesclub](/aanbieder/dishes/new). Geen commissie, geen abonnement, eenmalige inrichting van je profiel en je bent klaar.
:::
$md$,
  6,
  '2026-04-25T00:00:00Z'
) ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 4. recepten-met-restjes
-- ============================================================
INSERT INTO public.articles (
  slug, title, description, category, body_md, reading_minutes, published_at
) VALUES (
  'recepten-met-restjes',
  '7 makkelijke recepten met restjes uit je koelkast',
  'Wat overblijft hoeft niet weg. Zeven simpele Nederlandse recepten om kliekjes en losse ingrediënten om te toveren tot een nieuwe maaltijd.',
  'recepten',
  $md$De beste recepten met restjes zijn niet streng. Ze geven je een richting en laten je je aanpassen aan wat er toevallig in de koelkast ligt. Hieronder zeven recepten waarmee je kliekjes redt en een hele nieuwe maaltijd op tafel zet — vaak in minder dan 30 minuten.

## 1. Frittata met restjes-groente

**Voor 2 personen.** Eieren in combinatie met wat dan ook in de groentela.

- 4 eieren
- Een handvol restjes-groente (broccoli, courgette, paprika, ui)
- Restjes vlees of gerookte zalm — optioneel
- 50 gram geraspte kaas
- Klontje boter, peper, zout

Klop de eieren los met de kaas. Bak de groente kort in een ovenvaste koekenpan. Schenk het eimengsel erover, laat 2 minuten op het vuur zachtjes stollen, en zet de pan dan 8 minuten onder de grill. Klaar.

## 2. Nasi van koude rijst

**Voor 2 personen.** Het beste recept voor rijst die al een dag oud is.

- 300 gram gekookte rijst (koud uit de koelkast)
- 1 ui, 2 tenen knoflook
- Restjes groente of kip
- 2 eieren
- Sojasaus, ketjap, sambal

Roerbak ui en knoflook in een wok. Gooi groente en eventuele restjes vlees erbij. Voeg de rijst toe — koude rijst plakt minder en wordt mooi rul. Maak een kuiltje, klop de eieren erin en roer door. Op smaak met ketjap, sojasaus en sambal.

## 3. "Vrijdagmiddag-soep" van groenterestjes

**Voor 4 personen.** De ultieme verspillings-redder.

1. Snij alle groenterestjes uit de koelkast in stukken — wortel, ui, prei, courgette, tomaat, paprika, en zelfs de uiteinden van komkommer kunnen mee.
2. Fruit een ui en knoflook in een soeppan, voeg de groente toe en bak kort mee.
3. Schenk er bouillon bij (water + bouillonblokje volstaat) en laat 20 minuten zachtjes koken.
4. Pureer met een staafmixer, breng op smaak met peper, zout en eventueel een scheutje room of olijfolie.
5. Top af met restjes brood die je hebt gecroutonneerd in de oven.

## 4. Wentelteefjes van oud brood

**Voor 2 personen.** De Nederlandse klassieker. Hoe ouder het brood, hoe beter — droger brood neemt het beslag beter op.

- 4 sneetjes oud brood
- 2 eieren, 100 ml melk, snufje kaneel, 1 eetlepel suiker
- Boter om in te bakken
- Poedersuiker en stroop om te serveren

Klop ei, melk, suiker en kaneel los. Doop het brood in het beslag, laat het 30 seconden intrekken, en bak goudbruin in boter. Strooi poedersuiker erover en serveer met stroop of jam.

## 5. Pastaschotel uit de oven

**Voor 4 personen.** Werkt met elke gekookte pasta die je over hebt.

- 400 gram gekookte pasta
- Restjes groente, eventueel restjes gehakt of kip
- Pot tomatensaus of een blik gepelde tomaten
- 200 gram geraspte kaas

Meng pasta, groente, vlees en saus in een ovenschaal. Strooi de kaas erover. Oven op 200 °C, 20 minuten — tot de kaas mooi gegratineerd is.

## 6. Bananenbrood van overrijpe bananen

**Voor 1 cake.** Hoe bruiner de banaan, hoe zoeter het brood.

- 3 overrijpe bananen, geprakt
- 200 gram bloem
- 100 gram suiker
- 2 eieren
- 75 gram gesmolten boter
- 1 theelepel bakpoeder, snufje zout, kaneel

Meng alle natte ingrediënten, voeg dan de droge toe. In een cakevorm, oven op 175 °C, ongeveer 50 minuten. Werkt ook met blokjes pure chocolade of walnoten erdoor — laatste kans om die snippers op de plank te gebruiken.

## 7. Smoothie van zacht fruit

**Voor 2 glazen.** De redder voor te zachte aardbeien, bruine bananen, rimpelige appel of overrijpe mango.

- Een handvol fruit (vers of bevroren)
- 200 ml melk, plantenmelk of yoghurt
- 1 eetlepel havervlokken voor extra vulling
- Optioneel: lepel honing of dadel voor extra zoetheid

Alles in de blender en blenden tot glad. Klaar.

:::callout
**Te veel gemaakt?** Plaats het overschot op [Kliekjesclub](/aanbieder/dishes/new). Iemand in je buurt is er blij mee.
:::
$md$,
  7,
  '2026-04-19T00:00:00Z'
) ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 5. restjes-invriezen
-- ============================================================
INSERT INTO public.articles (
  slug, title, description, category, body_md, reading_minutes, published_at
) VALUES (
  'restjes-invriezen',
  'Restjes invriezen: alles wat je moet weten',
  'Welke restjes kun je goed invriezen, welke juist niet? Hoe lang blijven ze in de vriezer goed? Een complete gids met praktische tips.',
  'praktisch',
  $md$De vriezer is je beste vriend tegen voedselverspilling. Wat je vandaag niet opeet, kun je morgen, volgende maand of zelfs over een halfjaar nog gebruiken. Maar niet alles laat zich even goed invriezen, en de manier waarop je invriest maakt veel uit voor smaak en textuur na ontdooien.

In dit artikel: welke restjes vriezen goed in, hoe lang blijven ze houdbaar, en de belangrijkste do's en don'ts.

## Wat vriest goed in?

- **Soep, stoofpot en saus.** Bevatten al veel vocht en hebben weinig last van ijskristallen. Tot 3 maanden goed.
- **Brood en bakkerijproducten.** Sneetjes los invriezen of een hele krentenbol — direct uit de vriezer in de broodrooster.
- **Gekookt vlees, kip en gehakt.** Tot 2 à 3 maanden.
- **Pasta-saus, lasagne, gevulde pasta.** Hele schalen of porties — direct ovenklaar als je geen tijd hebt om te koken.
- **Geraspte kaas, gesneden hard fruit.** Praktisch om snel iets aan een gerecht toe te voegen.
- **Bananen, bessen, mango.** Ideaal voor smoothies of bananenbrood.
- **Verse kruiden in olijfolie.** Hak de kruiden, doe ze in een ijsblokjesvorm met olie en je hebt portie-klare smaakmakers.

## Wat juist niet?

- **Sla, komkommer, radijs en andere groente met veel water.** Worden slap en waterig na ontdooien.
- **Aardappel in zijn geheel.** Wordt korrelig. Aardappelpuree of aardappelschijfjes vriezen wél goed in.
- **Eieren in de schaal.** Knappen open. Losgeklopt in een bakje gaat wel.
- **Mayonaise, slasaus en yoghurt.** Schiften.
- **Zachte kazen.** Verliezen textuur. Harde kazen kunnen wel.
- **Frituurproducten.** Verliezen knapperigheid en worden zacht na opwarmen.

## Hoe lang blijven restjes goed in de vriezer?

Bevroren eten is op een vriezer van -18 °C in principe maandenlang veilig — maar de kwaliteit gaat geleidelijk achteruit. Globale richtlijnen voor optimale smaak:

- **Soep en bouillon:** 3 maanden
- **Stoofpot, curry, ovenschotels:** 3 maanden
- **Gebakken vlees en kip:** 2 tot 3 maanden
- **Rauw vlees:** 4 tot 12 maanden, afhankelijk van soort
- **Vis:** 2 tot 3 maanden
- **Brood:** 1 tot 3 maanden
- **Pasta-restjes:** 1 tot 2 maanden
- **Fruit:** 6 maanden
- **Groente (geblancheerd):** 8 tot 12 maanden

## Hoe vries je goed in?

- **Snel afkoelen vóór invriezen.** Warme gerechten in een ondiepe schaal maximaal twee uur op het aanrecht laten afkoelen, daarna in de koelkast en pas dan in de vriezer.
- **In porties.** Liever 4 bakjes van 1 portie dan 1 grote bak — dan kun je ontdooien wat je nodig hebt.
- **Lucht eruit.** Diepvrieszakjes platgedrukt of een vacuümzakje voorkomt vriesbrand (uitgedroogde plekken).
- **Met datum en inhoud labelen.** Anders sta je over twee maanden voor een mysterie-bakje.
- **Niet helemaal vol vullen.** Vloeistoffen zetten uit bij bevriezen — laat 1 à 2 cm ruimte aan de bovenkant.

## Hoe ontdooi je veilig?

- **In de koelkast (beste optie):** 12 tot 24 uur, afhankelijk van portie.
- **In koud water:** in een afgesloten zakje, water elk halfuur verversen.
- **In de magnetron op ontdooistand:** snelste optie, maar daarna direct verhitten.
- **Niet op het aanrecht.** De buitenkant warmt te snel op terwijl het midden nog bevroren is — bacteriegevarenzone.

:::callout
**Vriezer vol?** Kliekjesclub is een handige uitlaatklep. Plaats je restjes in een paar tikken en iemand in je buurt komt ze ophalen — zonder verspilling én zonder dat het in jouw vriezer hoeft. [Plaats je eerste restje →](/aanbieder/dishes/new)
:::
$md$,
  6,
  '2026-04-15T00:00:00Z'
) ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 6. restjes-opwarmen-ideeen
-- ============================================================
INSERT INTO public.articles (
  slug, title, description, category, body_md, reading_minutes, published_at
) VALUES (
  'restjes-opwarmen-ideeen',
  '10 manieren om kliekjes lekker op te warmen (zonder dat ze taai worden)',
  'Restjes hoeven niet saai te zijn. Tien praktische ideeën om kliekjes opnieuw lekker te maken — pasta, rijst, pizza, brood en meer.',
  'praktisch',
  $md$De magnetron is snel maar maakt veel restjes taai, droog of slap. Met een paar simpele kunstgrepen kun je gisteravond's pasta, pizza of curry verrassend lekker opwarmen — soms zelfs lekkerder dan de eerste keer. Tien beproefde manieren.

## 1. Pasta met saus: pan, geen magnetron

Magnetron-pasta wordt droog. Doe in plaats daarvan de pasta in een koekenpan met een scheutje pastawater, melk of bouillon, en verwarm met een deksel erop. Het zetmeel komt weer los, de saus glijdt opnieuw rond elke sliert.

## 2. Rijst: een eetlepel water erbij

Rijst droogt uit in de koelkast. Doe een eetlepel water bij elke 100 gram rijst, dek af met een vochtige theedoek of magnetron-deksel, en verwarm 1 minuut op halve kracht. De stoom maakt de rijst weer luchtig. Bonus-tip: bak koude rijst met groente, ei en sojasaus tot nasi.

## 3. Pizza: koekenpan, geen magnetron

Wil je een knapperige bodem en gesmolten kaas? Leg de pizza in een droge koekenpan, deksel erop, op laag vuur, 5 minuten. Geen krokant gevoel? Voeg twee druppels water ernaast toe — de stoom smelt de kaas perfect.

## 4. Frituurproducten: airfryer of oven

Friet, kroketten en gebakken kip horen niet in de magnetron. 4 tot 5 minuten in een airfryer of voorverwarmde oven (200 °C) maakt ze weer krokant alsof het de eerste keer is.

## 5. Soep en stoofpot: pan, niet magnetron

Soep wordt op het fornuis gelijkmatiger warm. Roer regelmatig en laat hem even doorkoken — door het zachtjes opnieuw "trekken" wordt de smaak vaak zelfs intenser.

## 6. Brood: kwastje water + oven

Hard geworden brood lijkt verloren — maar niet als je het kort onder de kraan houdt (alleen de korst), schudt om overtollig water af te schudden, en 5 minuten in een 180 °C oven legt. Het komt eruit alsof het net gebakken is.

## 7. Maak van een restje een ander gerecht

1. **Stoofpot** over een gepofte aardappel met een lepel zure room
2. **Gegrilde groente** door een omelet of frittata
3. **Rijst** tot nasi of tot rijstpap (zoet, met kaneel en suiker)
4. **Aardappel** tot rösti of door een schakshuka
5. **Vleeswaren** in een tosti of roerbakgerecht

## 8. Vlees: laag & langzaam

Magnetron op vol vermogen verandert kip in zoolleer. Verwarm vlees op halve kracht, met een sausje of bouillon erbij voor vocht, en geef het wat extra tijd. Of nog beter: snijd het en verwerk het in een koud gerecht — salade, wraps, broodjes.

## 9. Magnetron? Een eetlepel water erbij

Als je tóch de magnetron pakt: voeg altijd een paar druppels water toe en dek af met een deksel of vochtige theedoek. De stoom voorkomt uitdroging en zorgt voor gelijkmatigere verwarming. Roer halverwege.

## 10. Tot het echt warm is — minimaal 70 °C

Veiligheid: kliekjes moeten écht door en door warm worden, niet alleen lauw. Zeker bij rijst, kip en gehakt. Een keukenthermometer is geen overbodige luxe — 70 °C in het hart is de minimale veilige temperatuur.

:::callout
**Restje dat je toch niet meer opeet?** Geef het weg via [Kliekjesclub](/aanbieder/dishes/new). Iemand in je buurt is er blij mee, en jij voorkomt verspilling. Een paar tikken op de telefoon en je gerecht staat online.
:::
$md$,
  5,
  '2026-04-02T00:00:00Z'
) ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 7. studenten-gratis-eten
-- ============================================================
INSERT INTO public.articles (
  slug, title, description, category, body_md, reading_minutes, published_at
) VALUES (
  'studenten-gratis-eten',
  'Studenten en duurzaam eten: gratis maaltijden ophalen in jouw studentenstad',
  'Met een studentenbudget op duurzaam eten letten? Praktische tips, plekken om gratis maaltijden te vinden en hoe je zelf voedselverspilling tegengaat.',
  'duurzaamheid',
  $md$Op kamers wonen, een schraal budget, drukke roosters — koken is voor veel studenten een bijzaak. Het gevolg: te veel ingekochte boodschappen die in de prullenbak belanden, of net te weinig en weer een keer pasta met ketchup. Hieronder: praktische tips om als student én duurzamer én goedkoper te eten.

## Plekken voor gratis of goedkope maaltijden

- **Kliekjesclub.** Gratis. Zoek op [jouw studentenstad](/restjes) en zie wat er nu in de buurt wordt aangeboden — van particulieren én lokale bakkerijen.
- **Too Good To Go.** €3-€6 voor een "magic bag" bij horeca aan het einde van de dag.
- **Studentenrestaurants.** Veel universiteitssteden hebben een studentenmensa met maaltijden voor €3-€7.
- **Kookgroepen.** Veel studentenverenigingen en buurthuizen organiseren kook-met-buren-avonden waar je voor weinig mee-eet.
- **Voedselbank Studentenpunt.** In Amsterdam, Utrecht, Leiden en een aantal andere steden bestaat een speciaal studentenloket — als je rondkomen lastig wordt, is het de moeite waard te informeren.

## Slimmer boodschappen doen op studentenbudget

1. **Plan eerst, koop dan.** Schrijf je menu voor de week, kijk wat je nog hebt, en koop alleen wat ontbreekt. Bespaart minstens 20% op je boodschappen-budget.
2. **Markt > supermarkt.** Aan het eind van de marktdag (vaak vrijdag- of zaterdagmiddag) verkopen kraampjes hun groente en fruit voor een fractie van de prijs.
3. **Huismerken.** Voor 80% van de basisproducten (rijst, pasta, bonen, olijfolie) is het huismerk gewoon prima.
4. **Vries in.** Kook één keer per week iets groots — chili, soep, pastasaus — en vries 4-5 porties in. Dat scheelt magnetronmaaltijden later.
5. **Kook samen met huisgenoten.** 1 grote pan curry voor vier kost minder per persoon dan vier losse pakken. Beurtelings koken werkt voor iedereen.

## Restjes verwerken in je studentenkeuken

Beperkt budget = elk restje telt. Een paar tweede-leven-tips:

- **Pasta van gisteren?** Bak met ei en kaas tot een *frittata di pasta*.
- **Halve ui en aanslag-knoflook?** Verzamel in een diepvrieszakje en gebruik later voor bouillon.
- **Brood dat hard wordt?** [Wentelteefjes](/kennisbank/recepten-met-restjes), croutons of broodpudding.
- **Een handvol groente over?** Pan-roeren, eitje erover, klaar.
- **Bakje yoghurt op zijn eind?** Bevries in ijsjes-vormen voor frozen yogurt-snacks.

## Zelf overschot delen

Soms gaat het andere kant op: je hebt voor de gezelligheid een grote pan pasta gemaakt en zit nu met restjes voor drie. In plaats van weggooien, deel het op [Kliekjesclub](/aanbieder/dishes/new). Iemand in jouw studentenstad is er blij mee — én je doet er goed aan voor het milieu.

## Check je studentenstad

Direct kijken wat er nu wordt aangeboden:

- [Restjes in Amsterdam](/restjes/amsterdam)
- [Restjes in Utrecht](/restjes/utrecht)
- [Restjes in Leiden](/restjes/leiden)
- [Restjes in Groningen](/restjes/groningen)
- [Restjes in Nijmegen](/restjes/nijmegen)
- [Restjes in Maastricht](/restjes/maastricht)
- [Restjes in Wageningen](/restjes/wageningen)
- [Restjes in Delft](/restjes/delft)
- [Restjes in Eindhoven](/restjes/eindhoven)
- [Restjes in Tilburg](/restjes/tilburg)

:::callout
**Stadgenoot bij jou in de straat?** Studenten delen vaak makkelijk met andere studenten. Als jij regelmatig restjes hebt, plaats ze; als je vaak zoekt, kijk elke avond even.
:::
$md$,
  5,
  '2026-04-24T00:00:00Z'
) ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 8. voedselbank-vs-kliekjesclub
-- ============================================================
INSERT INTO public.articles (
  slug, title, description, category, body_md, reading_minutes, published_at
) VALUES (
  'voedselbank-vs-kliekjesclub',
  'Voedselbank vs Kliekjesclub: wat is het verschil?',
  'Beide gaan ze tegen voedselverspilling — maar werken heel anders. Een eerlijke vergelijking van Voedselbank, Too Good To Go en Kliekjesclub.',
  'voedselverspilling',
  $md$In Nederland zijn er meerdere initiatieven die op verschillende manieren tegen voedselverspilling werken. Voedselbank, Too Good To Go, Kliekjesclub — ze klinken alle drie alsof ze hetzelfde doen, maar het verschil zit in *wie* het eten krijgt en *hoe* het gedeeld wordt. In dit artikel zetten we ze naast elkaar.

## Voedselbank: voor mensen die het hard nodig hebben

De Voedselbank is een Nederlands netwerk van vrijwilligers dat al sinds 2002 bestaat. Het principe: supermarkten, bakkerijen en producenten doneren voedsel dat anders zou worden weggegooid; vrijwilligers verzamelen, sorteren en verdelen het naar mensen onder de armoedegrens.

- **Doel:** armoedebestrijding én voedselverspilling tegengaan.
- **Doelgroep:** alleen mensen met een inkomen onder de Voedselbank-norm. Je krijgt eerst een intake en moet aan voorwaarden voldoen.
- **Hoe:** één keer per week een pakket op een uitdeelpunt.
- **Wie geeft:** grote bedrijven en supermarktketens.
- **Kosten:** volledig gratis voor de ontvanger.

Voedselbanken Nederland is een geweldige organisatie maar bewust selectief — ze willen de hulp gericht houden op mensen die het écht nodig hebben.

## Too Good To Go: betaalbaar restjes-pakket

Too Good To Go is een commerciële app waarop horeca en supermarkten een *magic bag* verkopen: een verrassingspakket met overschot van die dag, voor zo'n een derde van de oorspronkelijke prijs. Pak je TGTG-zak op aan het eind van de dag.

- **Doel:** commerciële markt voor verspilling-overschot.
- **Doelgroep:** iedereen.
- **Hoe:** je betaalt €3 tot €6 voor een verrassingspakket, ophalen op een vast tijdstip.
- **Wie geeft:** horeca, bakkerijen, supermarkten.
- **Kosten:** betaalt platform een commissie, gebruiker betaalt voor de tas.

Voor de horeca is het een handige manier om verspilling om te zetten in nog wat omzet. Voor consumenten is het goedkoop, maar je weet pas bij ophalen wat erin zit.

## Kliekjesclub: gratis delen tussen buren en lokale aanbieders

Kliekjesclub is een platform waarop iedereen — particulieren, bakkerijen, restaurants — hun overgebleven eten gratis kan aanbieden. Mensen in de buurt zien wat er beschikbaar is, reserveren wat ze willen en spreken een ophaalmoment af.

- **Doel:** voedselverspilling tegengaan via lokaal delen — laagdrempelig, voor iedereen.
- **Doelgroep:** iedereen, geen inkomenstoets, geen voorwaarden.
- **Hoe:** bekijk het aanbod online, reserveer een gerecht, spreek af waar/wanneer je het ophaalt.
- **Wie geeft:** particulieren, bakkerijen, lunchrooms, restaurants — iedereen die te veel heeft gemaakt of overhoudt.
- **Kosten:** volledig gratis, geen commissie, geen abonnement.

## Naast elkaar bekeken

|  | Voedselbank | Too Good To Go | Kliekjesclub |
| --- | --- | --- | --- |
| Voor wie? | Inkomen-getoetst | Iedereen | Iedereen |
| Kosten | Gratis | €3-€6 per zak | Gratis |
| Aanbieders | Bedrijven | Horeca + retail | Iedereen |
| Vooraf weten | Pakket-mix | Verrassing | Specifiek gerecht |
| Particulieren? | Nee | Nee | Ja |

## Welke past bij jou?

- **Voedselbank:** als je rond moet komen en aan de voorwaarden voldoet, biedt de Voedselbank consistente wekelijkse ondersteuning.
- **Too Good To Go:** als je 's avonds graag een goedkope verrassings-maaltijd ophaalt bij horeca.
- **Kliekjesclub:** als je gratis eten wilt redden van mensen in je buurt, of zelf je restjes wilt delen — ongeacht inkomen.

Ze zijn complementair, niet concurrerend. De Voedselbank pakt het systemische probleem van armoede, Too Good To Go zet horeca-overschot om in betaalbare maaltijden, en Kliekjesclub maakt buurtniveau delen makkelijk voor iedereen — particulieren én professionals.

:::callout
**Zelf bijdragen?** Heb je restjes over die je wilt delen? [Plaats ze in een paar tikken op Kliekjesclub](/aanbieder/dishes/new) en iemand in je buurt komt ze ophalen.
:::
$md$,
  5,
  '2026-04-23T00:00:00Z'
) ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 9. voedselverspilling-cijfers-nederland
-- ============================================================
INSERT INTO public.articles (
  slug, title, description, category, body_md, reading_minutes, published_at, updated_at
) VALUES (
  'voedselverspilling-cijfers-nederland',
  'Voedselverspilling in Nederland: de cijfers van 2026',
  'Hoeveel eten gooien Nederlanders weg? Een overzicht van de cijfers, oorzaken en gevolgen van voedselverspilling in Nederland — en wat jij kunt doen.',
  'voedselverspilling',
  $md$Voedselverspilling is een van de grootste, meest onzichtbare problemen van ons voedselsysteem. We produceren genoeg eten om de hele wereldbevolking te voeden, maar wereldwijd belandt zo'n derde van al het voedsel in de prullenbak. Nederland is daarbij geen uitzondering — integendeel.

In dit artikel zetten we de meest recente cijfers over voedselverspilling in Nederland op een rij, leggen we uit waar het mis gaat, en laten we zien wat huishoudens en bedrijven eraan kunnen doen.

## Hoeveel eten gooit Nederland weg?

:::stats
::stat{value="2 mld kg" label="totaal in Nederland per jaar"}
::stat{value="33 kg" label="per persoon per jaar (huishoudens)"}
::stat{value="€155" label="weggegooid voedsel per persoon per jaar"}
:::

Volgens schattingen van de [Wageningen University & Research](https://www.wur.nl) en het Voedingscentrum gooien we in Nederland samen circa **2 miljard kilo voedsel** per jaar weg. Dat is omgerekend ruim 110 kilo per persoon — verdeeld over huishoudens, supermarkten, horeca en de productieketen.

Bij Nederlandse huishoudens gaat het om gemiddeld **33 kg per persoon per jaar**. Een gemiddeld gezin van vier personen gooit dus zo'n 132 kg eten weg — goed voor ruim **€620 per jaar** aan verspilling. Geld dat letterlijk in de groene of restafvalbak verdwijnt.

## Wat gooien we het meeste weg?

De grootste boosdoeners zijn opvallend voorspelbaar. De top vijf van meest verspilde producten in Nederlandse keukens:

- **Brood en bakkerijproducten** — het meest verspilde product in Nederland. We kopen vaker en kleinere hoeveelheden dan we werkelijk opeten.
- **Zuivel** — vooral melk en yoghurt waarvan de THT-datum is verlopen, terwijl ze vaak nog perfect drinkbaar zijn.
- **Groente en fruit** — verlepte sla, te zachte tomaten, bruine bananen. Vaak nog goed te verwerken in soepen of smoothies.
- **Restjes van warme maaltijden** — pastaschotels, rijstgerechten en stoofpotjes die in de koelkast blijven staan.
- **Vlees en vis** — minder vaak verspild qua gewicht, maar wel met de hoogste milieu-impact per kilogram.

## Waarom verspillen we zoveel?

De oorzaken zijn een mix van praktisch, sociaal en psychologisch. De vier vaakst genoemde redenen in Nederlands consumentenonderzoek:

- **Te veel inkopen.** Aanbiedingen, grote verpakkingen en boodschappen zonder duidelijk plan leiden tot een volle koelkast met spullen die niet allemaal opraken.
- **Verwarring over THT en TGT.** "Ten minste houdbaar tot" (THT) is een kwaliteitsdatum, geen veiligheidsdatum. Veel producten zijn na de THT nog prima. "Te gebruiken tot" (TGT) is wél een veiligheidsdatum.
- **Te veel koken.** Veel huishoudens koken meer dan ze nodig hebben uit gewoonte of voor het geval er gasten komen.
- **Geen plan voor restjes.** Restjes verdwijnen achterin de koelkast en worden uiteindelijk weggegooid omdat niemand er meer naar omkijkt.

## De impact op klimaat en portemonnee

Voedselverspilling is verantwoordelijk voor naar schatting **8 tot 10% van de wereldwijde broeikasgasuitstoot**. Als voedselverspilling een land was, zou het na China en de VS de derde grootste vervuiler ter wereld zijn.

Voor Nederlandse consumenten betekent verspilling vooral een gemiste kans: het geld dat in de afvalbak verdwijnt is reëel inkomen. De Nederlandse overheid heeft als doel om voedselverspilling tegen 2030 met 50% te halveren, in lijn met VN-doelstellingen.

:::callout
**Wat jij kunt doen:** deel je restjes met buren via Kliekjesclub. Eén gedeeld gerecht voorkomt zo'n 0,5 tot 1 kg voedselverspilling — én geeft iemand anders een lekkere maaltijd. [Plaats je eerste restje](/aanbieder/dishes/new) of [bekijk wat er in jouw buurt te halen is](/browse).
:::

## Bronnen

- Wageningen University & Research, "Voedselverspilling Monitor Nederland" (meest recente publicatie).
- Voedingscentrum, gemiddelde verspilling per persoon en categorie-overzicht.
- Stichting Samen Tegen Voedselverspilling — coalitie van Nederlandse overheid, retail en maatschappelijke organisaties.
- UN Food Waste Index Report — globale cijfers en trends.
$md$,
  6,
  '2026-04-12T00:00:00Z',
  '2026-04-25T00:00:00Z'
) ON CONFLICT (slug) DO NOTHING;
