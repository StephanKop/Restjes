import type {
  HomepageContent,
  HowItWorksContent,
  AboutContent,
  FaqContent,
} from '@kliekjesclub/types'
import type { Locale } from '@kliekjesclub/i18n'

// ----------------------------------------------------------------------------
// Homepage
// ----------------------------------------------------------------------------

const HOMEPAGE_NL: HomepageContent = {
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

const HOMEPAGE_EN: HomepageContent = {
  seo: {
    metaTitle: 'Kliekjesclub - Share your leftovers, make someone happy',
    metaDescription: 'Kliekjesclub connects people with leftover food to people who\'ll love it. Together against food waste!',
  },
  hero: {
    heading: 'Share your leftovers,',
    headingHighlight: 'make someone happy',
    subheading:
      'Got food to spare? Don\'t throw it out! On Kliekjesclub you share your leftover meals with people nearby. Together we make fighting food waste a lot more fun.',
    primaryCta: { label: 'See available dishes', href: '/browse' },
    secondaryCta: { label: 'Offer your own leftovers', href: '/aanbieder/dishes' },
  },
}

// ----------------------------------------------------------------------------
// How it works
// ----------------------------------------------------------------------------

const HOW_IT_WORKS_NL: HowItWorksContent = {
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

const HOW_IT_WORKS_EN: HowItWorksContent = {
  seo: {
    metaTitle: 'How does Kliekjesclub work?',
    metaDescription: 'Learn how to share food in four simple steps via Kliekjesclub. Free and no strings attached.',
  },
  section: {
    subtitle: 'It\'s that simple',
    heading: 'How does Kliekjesclub work?',
  },
  stats: [
    { value: 40, prefix: '', suffix: '%', label: 'of food is wasted in the Netherlands' },
    { value: 800, prefix: '€', suffix: '', label: 'an average household throws away per year' },
    { value: 0, prefix: '', suffix: ',-', label: 'it costs nothing to join' },
  ],
  steps: [
    {
      title: 'List a leftover',
      description: 'Got food to spare? Take a photo, add a description, and list it in seconds.',
      detail: 'Free and no strings attached',
    },
    {
      title: 'Discover & reserve',
      description: 'Neighbours see your leftover on the map and can reserve it in one tap.',
      detail: 'Filter by distance, diet, and allergens',
    },
    {
      title: 'Quick chat',
      description: 'Chat with the host to agree on a pickup time that works for both of you.',
      detail: 'Built-in chat — no phone number needed',
    },
    {
      title: 'Pick up & enjoy',
      description: 'Pop around the corner, grab your meal, and enjoy! Leave a review afterwards.',
      detail: 'Together against food waste',
    },
  ],
  community: {
    subtitle: 'More than just sharing food',
    heading: 'Connect with your neighbours',
    description:
      'Kliekjesclub goes beyond fighting food waste. It\'s a way to meet your neighbours, share a chat at the door, and build a tight-knit community together.',
    features: [
      { title: 'Meet your neighbours', description: 'A container of food is the start of a new connection around the corner.' },
      { title: 'Make someone happy', description: 'A warm meal can make someone\'s day.' },
      { title: 'Better for the planet', description: 'Every portion shared is food that isn\'t wasted.' },
    ],
  },
  cta: {
    heading: 'Ready to join?',
    subheading: 'Together we make sure less food ends up in the bin.',
    primaryCta: { label: 'See what\'s on offer', href: '/browse' },
    secondaryCta: { label: 'Create an account', href: '/signup' },
  },
}

// ----------------------------------------------------------------------------
// About
// ----------------------------------------------------------------------------

const ABOUT_NL: AboutContent = {
  seo: {
    metaTitle: 'Over ons - Kliekjesclub',
    metaDescription: 'Leer meer over Kliekjesclub en onze missie om voedselverspilling tegen te gaan door eten te delen met je buren.',
  },
  heading: 'Over Kliekjesclub',
  subheading: 'Samen maken we voedselverspilling een stuk leuker.',
  mission: {
    heading: 'Onze missie',
    paragraphs: [
      'In Nederland gooien we jaarlijks miljoenen kilo’s eten weg. Tegelijkertijd zijn er mensen die moeite hebben om aan een goede maaltijd te komen. Kliekjesclub brengt hier verandering in door een platform te bieden waar iedereen eenvoudig overgebleven maaltijden kan delen met mensen in de buurt.',
      'Of je nu een restaurant bent met porties over, een thuiskok die te veel heeft gemaakt, of iemand die op zoek is naar een lekkere en betaalbare maaltijd — bij Kliekjesclub is iedereen welkom.',
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

const ABOUT_EN: AboutContent = {
  seo: {
    metaTitle: 'About us - Kliekjesclub',
    metaDescription: 'Learn more about Kliekjesclub and our mission to fight food waste by sharing food with your neighbours.',
  },
  heading: 'About Kliekjesclub',
  subheading: 'Together we make fighting food waste a lot more fun.',
  mission: {
    heading: 'Our mission',
    paragraphs: [
      'In the Netherlands we throw away millions of kilos of food every year. At the same time, some people struggle to get a decent meal. Kliekjesclub changes that by offering a platform where anyone can easily share leftover meals with people nearby.',
      'Whether you\'re a restaurant with portions to spare, a home cook who made too much, or someone looking for a tasty, affordable meal — at Kliekjesclub everyone is welcome.',
    ],
  },
  howItWorks: {
    heading: 'How it works',
    steps: [
      { title: 'Offer', description: 'Got food to spare? List it on Kliekjesclub in seconds with a photo, description, and pickup time.' },
      { title: 'Discover', description: 'Search for available dishes near you. Filter by diet preferences and allergens.' },
      { title: 'Reserve', description: 'Reserve a dish and chat with the host.' },
      { title: 'Pick up', description: 'Pick up your dish from the host and enjoy! Don\'t forget to leave a review.' },
    ],
  },
  values: {
    heading: 'Our values',
    items: [
      { emoji: '🌍', title: 'Sustainability', description: 'Every portion shared is one less wasted.' },
      { emoji: '🤝', title: 'Community', description: 'Food brings people together. Kliekjesclub helps you meet your neighbours.' },
      { emoji: '💚', title: 'Accessibility', description: 'Everyone deserves a good meal. Kliekjesclub is free to use.' },
    ],
  },
  contact: {
    heading: 'Questions or suggestions?',
    description: 'We\'d love to hear from you! Get in touch by email.',
    email: 'info@kliekjesclub.nl',
  },
}

// ----------------------------------------------------------------------------
// FAQ
// ----------------------------------------------------------------------------

const FAQ_NL: FaqContent = {
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
        { question: 'Wat is Kliekjesclub?', answer: 'Kliekjesclub is een platform waar je overgebleven maaltijden kunt delen met mensen in de buurt. Of je nu een restaurant bent, een thuiskok of gewoon iemand die te veel eten heeft gemaakt — iedereen kan meedoen.' },
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
        { question: 'Moet ik een bedrijf hebben om eten aan te bieden?', answer: 'Nee, iedereen kan eten aanbieden via Kliekjesclub. Of je nu een restaurant hebt of gewoon thuis te veel hebt gekookt — je bent welkom.' },
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

const FAQ_EN: FaqContent = {
  seo: {
    metaTitle: 'FAQ - Kliekjesclub',
    metaDescription: 'Answers to frequently asked questions about Kliekjesclub. How it works, is it free, and more.',
  },
  heading: 'Frequently asked questions',
  subheading: 'Everything you need to know about Kliekjesclub.',
  sections: [
    {
      title: 'General',
      items: [
        { question: 'What is Kliekjesclub?', answer: 'Kliekjesclub is a platform where you can share leftover meals with people nearby. Whether you\'re a restaurant, a home cook, or just someone who made too much food — anyone can join.' },
        { question: 'Is Kliekjesclub free?', answer: 'Yes, Kliekjesclub is completely free to use. Both listing and reserving dishes cost nothing.' },
        { question: 'Which cities is Kliekjesclub active in?', answer: 'Kliekjesclub is available throughout the Netherlands. Whether you live in a big city or a small town, you can offer and discover dishes near you.' },
      ],
    },
    {
      title: 'Picking up food',
      items: [
        { question: 'How do I reserve a dish?', answer: 'Find a dish on the Discover page, choose the number of portions, and click "Reserve". The host will see your reservation and can confirm it.' },
        { question: 'Can I cancel a reservation?', answer: 'Yes, as long as your reservation hasn\'t been picked up yet you can cancel it from the Reservations page. The host will be notified automatically.' },
        { question: 'How do I know when I can pick up the food?', answer: 'Every dish shows a pickup time window. Chat with the host if you want to arrange something specific.' },
        { question: 'Can I filter by allergens?', answer: 'Yes, hosts list allergens according to the EU-14 standard. You can filter by diet preferences (vegetarian/vegan) and exclude allergens.' },
      ],
    },
    {
      title: 'Offering food',
      items: [
        { question: 'How do I offer a dish?', answer: 'Go to "My listings" and click "New dish". Add a photo, describe your dish, set a pickup time, and publish. It\'s that simple!' },
        { question: 'Do I need to be a business to offer food?', answer: 'No, anyone can offer food on Kliekjesclub. Whether you run a restaurant or just cooked too much at home — you\'re welcome.' },
        { question: 'How do I know if someone wants to pick up my dish?', answer: 'When someone places a reservation, you\'ll get a notification. You can confirm or decline it in the Reservations overview.' },
        { question: 'Can I chat with the person picking up?', answer: 'Yes, as soon as someone shows interest in your dish you can use the built-in chat to arrange pickup details.' },
      ],
    },
    {
      title: 'Reviews',
      items: [
        { question: 'How do reviews work?', answer: 'After picking up a dish you can leave a review from 1 to 5 stars with an optional comment. Hosts can reply to reviews.' },
        { question: 'Can I edit a review?', answer: 'Right now you can\'t edit a review after posting it. Contact us if you made a mistake.' },
      ],
    },
    {
      title: 'Account & privacy',
      items: [
        { question: 'How do I create an account?', answer: 'Click "Sign up" and fill in your details. You can also sign in with your Google account for quick registration.' },
        { question: 'How do I delete my account?', answer: 'Contact us at info@kliekjesclub.nl and we\'ll delete your account and all associated data.' },
        { question: 'How does Kliekjesclub handle my data?', answer: 'We only store the data needed for the platform to work. Read our privacy policy for more information.' },
      ],
    },
  ],
  contact: {
    heading: 'Question not covered here?',
    description: 'Feel free to get in touch. We\'re happy to help!',
    buttonLabel: 'Send us an email',
    email: 'info@kliekjesclub.nl',
  },
}

// ----------------------------------------------------------------------------
// Locale-aware getters
// ----------------------------------------------------------------------------

export function getHomepageDefaults(locale: Locale): HomepageContent {
  return locale === 'en' ? HOMEPAGE_EN : HOMEPAGE_NL
}

export function getHowItWorksDefaults(locale: Locale): HowItWorksContent {
  return locale === 'en' ? HOW_IT_WORKS_EN : HOW_IT_WORKS_NL
}

export function getAboutDefaults(locale: Locale): AboutContent {
  return locale === 'en' ? ABOUT_EN : ABOUT_NL
}

export function getFaqDefaults(locale: Locale): FaqContent {
  return locale === 'en' ? FAQ_EN : FAQ_NL
}

// Legacy exports — still NL for any call sites that haven't been migrated yet.
// These will be removed once every consumer switches to the locale-aware getters.
export const HOMEPAGE_DEFAULTS = HOMEPAGE_NL
export const HOW_IT_WORKS_DEFAULTS = HOW_IT_WORKS_NL
export const ABOUT_DEFAULTS = ABOUT_NL
export const FAQ_DEFAULTS = FAQ_NL
