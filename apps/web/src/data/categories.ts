// SEO category landing pages. Each category drives a /categorie/[slug] page
// targeting "{categorie} restjes" and "{categorie} eten" queries. Filters
// map to columns/relations that already exist in the dish schema — no
// migration needed.

export type CategoryType = 'diet' | 'freeFrom' | 'meal' | 'dish'

export type CategoryFilter =
  | { kind: 'boolean'; column: 'is_vegetarian' | 'is_vegan' | 'is_frozen'; value: boolean }
  | { kind: 'keyword'; query: string }
  // 'allergenFree' is post-filtered in JS — Supabase PostgREST can't easily
  // express "NOT EXISTS related row matching". Mirrors existing /browse flow.
  | { kind: 'allergenFree'; allergens: readonly string[] }

export type Category = {
  slug: string
  /** Display name in Dutch (the primary content language). */
  name: string
  /** English label, surfaced in og locale alternates. */
  nameEn: string
  type: CategoryType
  /** SEO meta description (Dutch). */
  description: string
  /** First paragraph of body copy — substantive, not boilerplate. */
  intro: string
  filter: CategoryFilter
}

export const CATEGORY_TYPE_LABEL: Record<CategoryType, { nl: string; en: string }> = {
  diet: { nl: 'Dieet & voorkeur', en: 'Diet & preference' },
  freeFrom: { nl: 'Allergeenvrij', en: 'Allergen-free' },
  meal: { nl: 'Maaltijden', en: 'Meals' },
  dish: { nl: 'Gerechten', en: 'Dishes' },
}

export const CATEGORIES: Category[] = [
  // ── Diet & preference ────────────────────────────────────────────
  {
    slug: 'vegetarisch',
    name: 'Vegetarische restjes',
    nameEn: 'Vegetarian leftovers',
    type: 'diet',
    description:
      'Vind gratis vegetarische kliekjes en restjes bij jou in de buurt. Vleesvrije gerechten van lokale aanbieders die anders zouden worden weggegooid.',
    intro:
      'Vegetarisch eten zonder verspilling. Op Kliekjesclub vind je vegetarische restjes en kliekjes van lokale aanbieders — van pastaschotels tot groenteovenschotels en alles ertussenin.',
    filter: { kind: 'boolean', column: 'is_vegetarian', value: true },
  },
  {
    slug: 'vegan',
    name: 'Vegan restjes',
    nameEn: 'Vegan leftovers',
    type: 'diet',
    description:
      'Veganistische kliekjes en restjes ophalen bij jou in de buurt. 100% plantaardig en gratis.',
    intro:
      'Plantaardig eten en voedselverspilling tegengaan in één. Vind hier 100% veganistische restjes van lokale aanbieders — zonder dierlijke producten, zonder voedselverspilling.',
    filter: { kind: 'boolean', column: 'is_vegan', value: true },
  },
  {
    slug: 'ingevroren',
    name: 'Ingevroren maaltijden',
    nameEn: 'Frozen meals',
    type: 'diet',
    description:
      'Gratis ingevroren maaltijden ophalen. Klaar om mee te nemen, lang houdbaar en perfect om in te vriezen voor later.',
    intro:
      'Ingevroren restjes zijn perfect voor drukke dagen — neem ze mee, leg ze in de vriezer en ontdooi wanneer het uitkomt. Zo redt je eten en heb je altijd een maaltijd achter de hand.',
    filter: { kind: 'boolean', column: 'is_frozen', value: true },
  },
  {
    slug: 'verse-maaltijden',
    name: 'Verse maaltijden',
    nameEn: 'Fresh meals',
    type: 'diet',
    description:
      'Verse kliekjes en gerechten van vandaag of gisteren. Direct ophalen en opwarmen of koud eten.',
    intro:
      'Verse restjes — vandaag bereid, vandaag ophalen. Ideaal als je vanavond of morgen niet wilt koken en gewoon iets lekkers wilt opwarmen.',
    filter: { kind: 'boolean', column: 'is_frozen', value: false },
  },

  // ── Allergen-free ─────────────────────────────────────────────────
  {
    slug: 'glutenvrij',
    name: 'Glutenvrije restjes',
    nameEn: 'Gluten-free leftovers',
    type: 'freeFrom',
    description:
      'Glutenvrije kliekjes en gerechten bij jou in de buurt. Geen tarwe, gerst of rogge — perfect bij coeliakie of glutenintolerantie.',
    intro:
      'Glutenvrij eten op basis van wat over is. Onze aanbieders geven aan welke gerechten gluten bevatten — op deze pagina vind je alleen restjes zonder gluten.',
    filter: { kind: 'allergenFree', allergens: ['gluten'] },
  },
  {
    slug: 'lactosevrij',
    name: 'Lactosevrije restjes',
    nameEn: 'Lactose-free leftovers',
    type: 'freeFrom',
    description:
      'Lactosevrije gerechten van lokale aanbieders. Zonder zuivel, ideaal bij lactose-intolerantie of een zuivelvrij dieet.',
    intro:
      'Restjes zonder zuivel. Geen melk, kaas of yoghurt — geschikt voor mensen met een lactose-intolerantie of die om andere redenen geen zuivel eten.',
    filter: { kind: 'allergenFree', allergens: ['milk'] },
  },
  {
    slug: 'notenvrij',
    name: 'Notenvrije restjes',
    nameEn: 'Nut-free leftovers',
    type: 'freeFrom',
    description:
      'Notenvrije kliekjes — zonder noten of pinda&apos;s. Veilig voor mensen met een noten- of pinda-allergie.',
    intro:
      'Notenvrije restjes voor wie allergisch is voor noten of pinda&apos;s. Aanbieders moeten beide allergenen melden, dus deze pagina bevat alleen gerechten zonder noten én zonder pinda&apos;s.',
    filter: { kind: 'allergenFree', allergens: ['nuts', 'peanuts'] },
  },

  // ── Meal types ────────────────────────────────────────────────────
  {
    slug: 'ontbijt',
    name: 'Ontbijt restjes',
    nameEn: 'Breakfast leftovers',
    type: 'meal',
    description:
      'Ontbijtgerechten en bakkerij-restjes voor de ochtend. Brood, broodjes, yoghurt, granola — gratis ophalen.',
    intro:
      'Ontbijt zonder verspilling. Bakkerijen, lunchrooms en cafés zetten hier hun ochtend-overschot — van croissants en broodjes tot yoghurt-bowls en granola.',
    filter: { kind: 'keyword', query: 'ontbijt OR brood OR croissant OR yoghurt OR granola OR muesli' },
  },
  {
    slug: 'lunch',
    name: 'Lunch restjes',
    nameEn: 'Lunch leftovers',
    type: 'meal',
    description:
      'Lunchgerechten van lokale aanbieders — broodjes, salades, soepen en wraps. Gratis ophalen tijdens lunchpauze.',
    intro:
      'Lunch zonder verspilling. Lunchrooms, broodjeszaken en café&apos;s delen hier hun lunchaanbod dat anders zou worden weggegooid — broodjes, salades, soepen, wraps.',
    filter: { kind: 'keyword', query: 'lunch OR broodje OR sandwich OR wrap OR salade' },
  },
  {
    slug: 'avondeten',
    name: 'Avondeten restjes',
    nameEn: 'Dinner leftovers',
    type: 'meal',
    description:
      'Warme maaltijden voor &apos;s avonds — pasta, rijstgerechten, ovenschotels en soepen. Gratis bij jou in de buurt.',
    intro:
      'Vanavond koken? Dat hoeft niet. Hier vind je warme maaltijden van lokale restaurants en mensen die te veel hebben gekookt — klaar om mee te nemen en op te warmen.',
    filter: { kind: 'keyword', query: 'avondeten OR pasta OR rijst OR ovenschotel OR stoofpot OR curry' },
  },

  // ── Common dishes ─────────────────────────────────────────────────
  {
    slug: 'pasta',
    name: 'Pasta restjes',
    nameEn: 'Pasta leftovers',
    type: 'dish',
    description:
      'Pastagerechten — lasagne, spaghetti, penne, pasta pesto en meer. Gratis kliekjes van lokale aanbieders.',
    intro:
      'Italiaans eten zonder verspilling. Van klassieke spaghetti bolognese en lasagne tot vegetarische pastasalades — vind hier pastarestjes bij jou in de buurt.',
    filter: { kind: 'keyword', query: 'pasta OR lasagne OR spaghetti OR penne OR macaroni OR ravioli OR carbonara' },
  },
  {
    slug: 'pizza',
    name: 'Pizza restjes',
    nameEn: 'Pizza leftovers',
    type: 'dish',
    description:
      'Pizza-restjes en hele pizza&apos;s die anders zouden worden weggegooid. Gratis ophalen bij pizzeria&apos;s en buren in de buurt.',
    intro:
      'Pizza redden — letterlijk. Pizzeria&apos;s aan het eind van de avond, mensen die te veel hebben besteld, of overgebleven plakken: hier vind je gratis pizza in jouw buurt.',
    filter: { kind: 'keyword', query: 'pizza OR pizze OR margherita' },
  },
  {
    slug: 'soep',
    name: 'Soep restjes',
    nameEn: 'Soup leftovers',
    type: 'dish',
    description:
      'Verse soep en soeprestjes van lokale aanbieders. Tomatensoep, kippensoep, groentesoep en meer.',
    intro:
      'Soep is bij uitstek een voedselverspillings-redder: meestal gemaakt van groentes die anders zouden worden weggegooid. Hier vind je verse soep en restjes van lokale keukens.',
    filter: { kind: 'keyword', query: 'soep OR bouillon OR borscht' },
  },
  {
    slug: 'brood',
    name: 'Brood en bakkerij',
    nameEn: 'Bread & bakery',
    type: 'dish',
    description:
      'Vers brood, broodjes en bakkerij-restjes aan het eind van de dag. Gratis ophalen bij lokale bakkerijen.',
    intro:
      'Bakkerijen gooien dagelijks ongelooflijk veel brood weg. Hier zie je welke lokale bakkers hun overschot delen — van stokbroden en zuurdesem tot croissants en gevulde broodjes.',
    filter: { kind: 'keyword', query: 'brood OR broodje OR baguette OR croissant OR ciabatta OR focaccia OR bagel' },
  },
  {
    slug: 'salade',
    name: 'Salade restjes',
    nameEn: 'Salad leftovers',
    type: 'dish',
    description:
      'Verse salades — lunchsalades, maaltijdsalades en bijgerechten. Gratis kliekjes bij jou in de buurt.',
    intro:
      'Salades zijn lekker, gezond en helaas vaak verspilling als ze niet op tijd worden verkocht. Hier vind je verse salades van lunchrooms en café&apos;s in jouw buurt.',
    filter: { kind: 'keyword', query: 'salade OR salad' },
  },
]

const slugifyKey = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const categoryIndex = new Map<string, Category>(
  CATEGORIES.flatMap((c) => [
    [c.slug, c],
    [slugifyKey(c.name), c],
  ]),
)

export function findCategory(input: string | null | undefined): Category | null {
  if (!input) return null
  return categoryIndex.get(slugifyKey(input)) ?? null
}

export function categoriesByType(): Record<CategoryType, Category[]> {
  const groups = { diet: [], freeFrom: [], meal: [], dish: [] } as Record<CategoryType, Category[]>
  for (const c of CATEGORIES) groups[c.type].push(c)
  return groups
}

/** Three "related" categories — same type if possible, otherwise neighbors. */
export function relatedCategories(category: Category, n = 3): Category[] {
  const sameType = CATEGORIES.filter((c) => c.type === category.type && c.slug !== category.slug)
  if (sameType.length >= n) return sameType.slice(0, n)
  const others = CATEGORIES.filter((c) => c.type !== category.type)
  return [...sameType, ...others].slice(0, n)
}
