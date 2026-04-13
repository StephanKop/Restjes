import type { HomepageContent, HowItWorksContent, AboutContent, FaqContent } from '@kliekjesclub/types'

export const HOMEPAGE_DEFAULTS: HomepageContent = {
  seo: {
    metaTitle: 'Kliekjesclub - Deel je kliekjes, maak iemand blij',
    metaDescription: 'Kliekjesclub verbindt mensen die eten over hebben met mensen die er blij mee zijn. Samen tegen voedselverspilling!',
  },
  hero: {
    heading: 'Deel je kliekjes,',
    headingHighlight: 'maak iemand blij',
    subheading:
      'Heb je eten over? Zonde om weg te gooien! Via Kliekjesclub deel je jouw overgebleven gerechten met mensen in de buurt. Samen maken we voedselverspilling een stuk leuker.',
    primaryCta: { label: 'Bekijk beschikbare gerechten', href: '/browse' },
    secondaryCta: { label: 'Zelf kliekjes aanbieden', href: '/aanbieder/dishes' },
  },
}

export const HOW_IT_WORKS_DEFAULTS: HowItWorksContent = {
  seo: {
    metaTitle: 'Hoe werkt Kliekjesclub?',
    metaDescription: 'Ontdek hoe je in vier simpele stappen eten kunt delen via Kliekjesclub. Gratis en zonder verplichtingen.',
  },
  section: {
    subtitle: 'Zo simpel is het',
    heading: 'Hoe werkt Kliekjesclub?',
  },
  stats: [
    { value: 40, prefix: '', suffix: '%', label: 'van voedsel wordt verspild in Nederland' },
    { value: 800, prefix: '€', suffix: '', label: 'gooit een gemiddeld huishouden per jaar weg' },
    { value: 0, prefix: '', suffix: ',-', label: 'het kost je niks om mee te doen' },
  ],
  steps: [
    {
      title: 'Restje plaatsen',
      description: 'Heb je eten over? Maak een foto, voeg een beschrijving toe en plaats het in een paar seconden.',
      detail: 'Gratis en zonder verplichtingen',
    },
    {
      title: 'Ontdekken & reserveren',
      description: 'Mensen in de buurt zien jouw restje op de kaart en kunnen het met een tik reserveren.',
      detail: 'Filter op afstand, dieet en allergenen',
    },
    {
      title: 'Even overleggen',
      description: 'Chat direct met de aanbieder om een ophaaltijd af te spreken die voor jullie allebei werkt.',
      detail: 'Ingebouwde chat, geen telefoonnummer nodig',
    },
    {
      title: 'Ophalen & genieten',
      description: 'Loop even langs om de hoek, haal je maaltijd op en geniet! Laat daarna een beoordeling achter.',
      detail: 'Samen tegen voedselverspilling',
    },
  ],
  community: {
    subtitle: 'Meer dan eten delen',
    heading: 'Verbind met je buren',
    description:
      'Kliekjesclub gaat verder dan alleen voedselverspilling tegengaan. Het is een manier om je buren te leren kennen, een praatje te maken aan de deur en samen te zorgen voor een hechte buurt.',
    features: [
      { title: 'Leer je buren kennen', description: 'Een bakje eten is het begin van een nieuw contact om de hoek.' },
      { title: 'Maak iemand blij', description: 'Een warme maaltijd kan iemands dag helemaal goed maken.' },
      { title: 'Beter voor de planeet', description: 'Elke portie die gedeeld wordt is voedsel dat niet verspild wordt.' },
    ],
  },
  cta: {
    heading: 'Klaar om mee te doen?',
    subheading: 'Samen zorgen we ervoor dat minder eten in de prullenbak belandt.',
    primaryCta: { label: 'Bekijk het aanbod', href: '/browse' },
    secondaryCta: { label: 'Maak een account', href: '/signup' },
  },
}

export const ABOUT_DEFAULTS: AboutContent = {
  seo: {
    metaTitle: 'Over ons - Kliekjesclub',
    metaDescription: 'Leer meer over Kliekjesclub en onze missie om voedselverspilling tegen te gaan door eten te delen met je buren.',
  },
  heading: 'Over Kliekjesclub',
  subheading: 'Samen maken we voedselverspilling een stuk leuker.',
  mission: {
    heading: 'Onze missie',
    paragraphs: [
      'In Nederland gooien we jaarlijks miljoenen kilo\u2019s eten weg. Tegelijkertijd zijn er mensen die moeite hebben om aan een goede maaltijd te komen. Kliekjesclub brengt hier verandering in door een platform te bieden waar iedereen eenvoudig overgebleven maaltijden kan delen met mensen in de buurt.',
      'Of je nu een restaurant bent met porties over, een thuiskok die te veel heeft gemaakt, of iemand die op zoek is naar een lekkere en betaalbare maaltijd \u2014 bij Kliekjesclub is iedereen welkom.',
    ],
  },
  howItWorks: {
    heading: 'Hoe het werkt',
    steps: [
      { title: 'Aanbieden', description: 'Heb je eten over? Plaats het in een paar seconden op Kliekjesclub met een foto, beschrijving en ophaaltijd.' },
      { title: 'Ontdekken', description: 'Zoek naar beschikbare gerechten bij jou in de buurt. Filter op dieetvoorkeuren en allergenen.' },
      { title: 'Reserveren', description: 'Reserveer een gerecht en neem contact op met de aanbieder via chat.' },
      { title: 'Ophalen', description: 'Haal je gerecht op bij de aanbieder en geniet! Vergeet niet een beoordeling achter te laten.' },
    ],
  },
  values: {
    heading: 'Onze waarden',
    items: [
      { emoji: '🌍', title: 'Duurzaamheid', description: 'Elke portie die gedeeld wordt, is een portie minder die verspild wordt.' },
      { emoji: '🤝', title: 'Gemeenschap', description: 'Eten verbindt. Via Kliekjesclub leer je je buren kennen.' },
      { emoji: '💚', title: 'Toegankelijkheid', description: 'Iedereen verdient een goede maaltijd. Kliekjesclub is gratis te gebruiken.' },
    ],
  },
  contact: {
    heading: 'Vragen of suggesties?',
    description: 'We horen graag van je! Neem contact met ons op via e-mail.',
    email: 'info@kliekjesclub.nl',
  },
}

export const FAQ_DEFAULTS: FaqContent = {
  seo: {
    metaTitle: 'Veelgestelde vragen - Kliekjesclub',
    metaDescription: 'Antwoorden op veelgestelde vragen over Kliekjesclub. Hoe werkt het, is het gratis, en meer.',
  },
  heading: 'Veelgestelde vragen',
  subheading: 'Alles wat je wilt weten over Kliekjesclub.',
  sections: [
    {
      title: 'Algemeen',
      items: [
        { question: 'Wat is Kliekjesclub?', answer: 'Kliekjesclub is een platform waar je overgebleven maaltijden kunt delen met mensen in de buurt. Of je nu een restaurant bent, een thuiskok of gewoon iemand die te veel eten heeft gemaakt \u2014 iedereen kan meedoen.' },
        { question: 'Is Kliekjesclub gratis?', answer: 'Ja, Kliekjesclub is volledig gratis te gebruiken. Zowel het aanbieden als het reserveren van gerechten kost niets.' },
        { question: 'In welke steden is Kliekjesclub actief?', answer: 'Kliekjesclub is beschikbaar in heel Nederland. Of je nu in een grote stad of een klein dorp woont, je kunt gerechten aanbieden en ontdekken bij jou in de buurt.' },
      ],
    },
    {
      title: 'Eten ophalen',
      items: [
        { question: 'Hoe reserveer ik een gerecht?', answer: 'Zoek een gerecht via de Ontdekken-pagina, kies het gewenste aantal porties en klik op "Reserveren". De aanbieder krijgt je reservering te zien en kan deze bevestigen.' },
        { question: 'Kan ik een reservering annuleren?', answer: 'Ja, zolang je reservering nog niet is opgehaald kun je deze annuleren via de Reserveringen-pagina. De aanbieder wordt hiervan automatisch op de hoogte gesteld.' },
        { question: 'Hoe weet ik wanneer ik het eten kan ophalen?', answer: 'Bij elk gerecht staat een ophaaltijdvenster vermeld. Neem via de chat contact op met de aanbieder als je specifieke afspraken wilt maken.' },
        { question: 'Kan ik filteren op allergenen?', answer: 'Ja, aanbieders vermelden allergenen conform de EU-14 standaard. Je kunt filteren op dieetvoorkeuren (vegetarisch/veganistisch) en allergenen uitsluiten.' },
      ],
    },
    {
      title: 'Eten aanbieden',
      items: [
        { question: 'Hoe bied ik een gerecht aan?', answer: 'Ga naar "Mijn aanbod" en klik op "Nieuw gerecht". Voeg een foto toe, beschrijf je gerecht, stel een ophaaltijd in en publiceer. Zo simpel is het!' },
        { question: 'Moet ik een bedrijf hebben om eten aan te bieden?', answer: 'Nee, iedereen kan eten aanbieden via Kliekjesclub. Of je nu een restaurant hebt of gewoon thuis te veel hebt gekookt \u2014 je bent welkom.' },
        { question: 'Hoe weet ik of iemand mijn gerecht wil ophalen?', answer: 'Wanneer iemand een reservering plaatst, ontvang je een melding. Je kunt de reservering bevestigen of afwijzen via het Reserveringen-overzicht.' },
        { question: 'Kan ik met de ophaler chatten?', answer: 'Ja, zodra iemand interesse toont in je gerecht kunnen jullie via de ingebouwde chat afspraken maken over het ophaalmoment.' },
      ],
    },
    {
      title: 'Beoordelingen',
      items: [
        { question: 'Hoe werken beoordelingen?', answer: 'Na het ophalen van een gerecht kun je een beoordeling achterlaten met 1 tot 5 sterren en een optionele toelichting. Aanbieders kunnen reageren op beoordelingen.' },
        { question: 'Kan ik een beoordeling aanpassen?', answer: 'Op dit moment kun je een beoordeling niet achteraf wijzigen. Neem contact met ons op als je een fout hebt gemaakt.' },
      ],
    },
    {
      title: 'Account & privacy',
      items: [
        { question: 'Hoe maak ik een account aan?', answer: 'Klik op "Aanmelden" en vul je gegevens in. Je kunt ook inloggen met je Google-account voor een snelle registratie.' },
        { question: 'Hoe verwijder ik mijn account?', answer: 'Neem contact met ons op via info@kliekjesclub.nl en we verwijderen je account en alle bijbehorende gegevens.' },
        { question: 'Hoe gaat Kliekjesclub om met mijn gegevens?', answer: 'We bewaren alleen de gegevens die nodig zijn voor het functioneren van het platform. Lees ons privacybeleid voor meer informatie.' },
      ],
    },
  ],
  contact: {
    heading: 'Staat je vraag er niet bij?',
    description: 'Neem gerust contact met ons op. We helpen je graag!',
    buttonLabel: 'Stuur ons een e-mail',
    email: 'info@kliekjesclub.nl',
  },
}
