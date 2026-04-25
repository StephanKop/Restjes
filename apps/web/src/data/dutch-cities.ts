// Curated list of Dutch cities and larger villages, used for SEO landing
// pages at /restjes/[slug]. The list emphasizes coverage of every gemeente
// (municipality) so any user-typed city like "Den Haag" / "'s-Hertogenbosch"
// resolves to a canonical slug.
//
// Source: Dutch CBS demographic data (population estimates rounded to 1k).
// Coordinates are gemeente center points; precise enough for "nearby cities"
// proximity ranking via haversine.

export type DutchCity = {
  slug: string
  name: string
  province: DutchProvince
  population: number
  lat: number
  lng: number
  /** Aliases (lowercase, ASCII-folded) that should resolve to this city. */
  aliases?: string[]
}

export type DutchProvince =
  | 'Noord-Holland'
  | 'Zuid-Holland'
  | 'Utrecht'
  | 'Noord-Brabant'
  | 'Gelderland'
  | 'Overijssel'
  | 'Flevoland'
  | 'Friesland'
  | 'Groningen'
  | 'Drenthe'
  | 'Limburg'
  | 'Zeeland'

export const DUTCH_PROVINCES: DutchProvince[] = [
  'Noord-Holland',
  'Zuid-Holland',
  'Utrecht',
  'Noord-Brabant',
  'Gelderland',
  'Overijssel',
  'Flevoland',
  'Friesland',
  'Groningen',
  'Drenthe',
  'Limburg',
  'Zeeland',
]

// Sorted roughly by population (largest first). Slugs are kebab-case ASCII;
// display names preserve diacritics and apostrophes. Aliases let user-typed
// city names (with prefix articles, capitalization, etc.) resolve cleanly.
export const DUTCH_CITIES: DutchCity[] = [
  // ── Tier 1: Top 30 cities (G4 + major regional) ────────────────────────
  { slug: 'amsterdam', name: 'Amsterdam', province: 'Noord-Holland', population: 921402, lat: 52.3676, lng: 4.9041 },
  { slug: 'rotterdam', name: 'Rotterdam', province: 'Zuid-Holland', population: 663900, lat: 51.9244, lng: 4.4777 },
  { slug: 'den-haag', name: 'Den Haag', province: 'Zuid-Holland', population: 565679, lat: 52.0705, lng: 4.3007, aliases: ['s-gravenhage', 'gravenhage', 'the hague'] },
  { slug: 'utrecht', name: 'Utrecht', province: 'Utrecht', population: 367984, lat: 52.0907, lng: 5.1214 },
  { slug: 'eindhoven', name: 'Eindhoven', province: 'Noord-Brabant', population: 246326, lat: 51.4416, lng: 5.4697 },
  { slug: 'groningen', name: 'Groningen', province: 'Groningen', population: 239100, lat: 53.2194, lng: 6.5665 },
  { slug: 'tilburg', name: 'Tilburg', province: 'Noord-Brabant', population: 229000, lat: 51.5555, lng: 5.0913 },
  { slug: 'almere', name: 'Almere', province: 'Flevoland', population: 224800, lat: 52.3508, lng: 5.2647 },
  { slug: 'breda', name: 'Breda', province: 'Noord-Brabant', population: 187000, lat: 51.5719, lng: 4.7683 },
  { slug: 'nijmegen', name: 'Nijmegen', province: 'Gelderland', population: 184000, lat: 51.8126, lng: 5.8372 },
  { slug: 'apeldoorn', name: 'Apeldoorn', province: 'Gelderland', population: 168000, lat: 52.2112, lng: 5.9699 },
  { slug: 'arnhem', name: 'Arnhem', province: 'Gelderland', population: 165000, lat: 51.9851, lng: 5.8987 },
  { slug: 'haarlem', name: 'Haarlem', province: 'Noord-Holland', population: 165000, lat: 52.3874, lng: 4.6462 },
  { slug: 'enschede', name: 'Enschede', province: 'Overijssel', population: 161000, lat: 52.2215, lng: 6.8937 },
  { slug: 'amersfoort', name: 'Amersfoort', province: 'Utrecht', population: 161000, lat: 52.1561, lng: 5.3878 },
  { slug: 'zaanstad', name: 'Zaanstad', province: 'Noord-Holland', population: 161000, lat: 52.4575, lng: 4.8060 },
  { slug: 'haarlemmermeer', name: 'Haarlemmermeer', province: 'Noord-Holland', population: 161000, lat: 52.2989, lng: 4.6700, aliases: ['hoofddorp'] },
  { slug: 'den-bosch', name: '’s-Hertogenbosch', province: 'Noord-Brabant', population: 158000, lat: 51.6978, lng: 5.3037, aliases: ['s-hertogenbosch', 'den-bosch', 'hertogenbosch'] },
  { slug: 'zwolle', name: 'Zwolle', province: 'Overijssel', population: 134000, lat: 52.5168, lng: 6.0830 },
  { slug: 'zoetermeer', name: 'Zoetermeer', province: 'Zuid-Holland', population: 127000, lat: 52.0605, lng: 4.4940 },
  { slug: 'leeuwarden', name: 'Leeuwarden', province: 'Friesland', population: 127000, lat: 53.2014, lng: 5.7999 },
  { slug: 'leiden', name: 'Leiden', province: 'Zuid-Holland', population: 127000, lat: 52.1601, lng: 4.4970 },
  { slug: 'maastricht', name: 'Maastricht', province: 'Limburg', population: 122000, lat: 50.8514, lng: 5.6909 },
  { slug: 'dordrecht', name: 'Dordrecht', province: 'Zuid-Holland', population: 121000, lat: 51.8133, lng: 4.6900 },
  { slug: 'ede', name: 'Ede', province: 'Gelderland', population: 119000, lat: 52.0337, lng: 5.6646 },
  { slug: 'alphen-aan-den-rijn', name: 'Alphen aan den Rijn', province: 'Zuid-Holland', population: 114000, lat: 52.1247, lng: 4.6580 },
  { slug: 'westland', name: 'Westland', province: 'Zuid-Holland', population: 113000, lat: 51.9921, lng: 4.2009, aliases: ['naaldwijk'] },
  { slug: 'alkmaar', name: 'Alkmaar', province: 'Noord-Holland', population: 110000, lat: 52.6324, lng: 4.7534 },
  { slug: 'emmen', name: 'Emmen', province: 'Drenthe', population: 107000, lat: 52.7794, lng: 6.9067 },
  { slug: 'delft', name: 'Delft', province: 'Zuid-Holland', population: 107000, lat: 52.0116, lng: 4.3571 },
  { slug: 'venlo', name: 'Venlo', province: 'Limburg', population: 102000, lat: 51.3704, lng: 6.1724 },

  // ── Tier 2: Cities 30-80 (medium-large) ───────────────────────────────
  { slug: 'deventer', name: 'Deventer', province: 'Overijssel', population: 102000, lat: 52.2552, lng: 6.1639 },
  { slug: 'sittard-geleen', name: 'Sittard-Geleen', province: 'Limburg', population: 92000, lat: 50.9999, lng: 5.8665, aliases: ['sittard', 'geleen'] },
  { slug: 'helmond', name: 'Helmond', province: 'Noord-Brabant', population: 96000, lat: 51.4793, lng: 5.6570 },
  { slug: 'oss', name: 'Oss', province: 'Noord-Brabant', population: 93000, lat: 51.7649, lng: 5.5235 },
  { slug: 'amstelveen', name: 'Amstelveen', province: 'Noord-Holland', population: 93000, lat: 52.3081, lng: 4.8656 },
  { slug: 'hilversum', name: 'Hilversum', province: 'Noord-Holland', population: 91000, lat: 52.2292, lng: 5.1669 },
  { slug: 'heerlen', name: 'Heerlen', province: 'Limburg', population: 86000, lat: 50.8882, lng: 5.9795 },
  { slug: 'lelystad', name: 'Lelystad', province: 'Flevoland', population: 81000, lat: 52.5185, lng: 5.4714 },
  { slug: 'meppel', name: 'Meppel', province: 'Drenthe', population: 35000, lat: 52.6960, lng: 6.1928 },
  { slug: 'gouda', name: 'Gouda', province: 'Zuid-Holland', population: 76000, lat: 52.0115, lng: 4.7105 },
  { slug: 'spijkenisse', name: 'Spijkenisse', province: 'Zuid-Holland', population: 73000, lat: 51.8451, lng: 4.3289 },
  { slug: 'hengelo', name: 'Hengelo', province: 'Overijssel', population: 81000, lat: 52.2659, lng: 6.7930 },
  { slug: 'purmerend', name: 'Purmerend', province: 'Noord-Holland', population: 92000, lat: 52.5051, lng: 4.9596 },
  { slug: 'roosendaal', name: 'Roosendaal', province: 'Noord-Brabant', population: 78000, lat: 51.5308, lng: 4.4653 },
  { slug: 'schiedam', name: 'Schiedam', province: 'Zuid-Holland', population: 80000, lat: 51.9192, lng: 4.3886 },
  { slug: 'leidschendam-voorburg', name: 'Leidschendam-Voorburg', province: 'Zuid-Holland', population: 78000, lat: 52.0853, lng: 4.4088, aliases: ['leidschendam', 'voorburg'] },
  { slug: 'vlaardingen', name: 'Vlaardingen', province: 'Zuid-Holland', population: 76000, lat: 51.9123, lng: 4.3415 },
  { slug: 'almelo', name: 'Almelo', province: 'Overijssel', population: 73000, lat: 52.3508, lng: 6.6683 },
  { slug: 'gorinchem', name: 'Gorinchem', province: 'Zuid-Holland', population: 38000, lat: 51.8311, lng: 4.9772 },
  { slug: 'capelle-aan-den-ijssel', name: 'Capelle aan den IJssel', province: 'Zuid-Holland', population: 67000, lat: 51.9296, lng: 4.5780 },
  { slug: 'nieuwegein', name: 'Nieuwegein', province: 'Utrecht', population: 65000, lat: 52.0307, lng: 5.0876 },
  { slug: 'roermond', name: 'Roermond', province: 'Limburg', population: 60000, lat: 51.1942, lng: 5.9870 },
  { slug: 'venray', name: 'Venray', province: 'Limburg', population: 44000, lat: 51.5260, lng: 5.9750 },
  { slug: 'middelburg', name: 'Middelburg', province: 'Zeeland', population: 49000, lat: 51.4988, lng: 3.6109 },
  { slug: 'vlissingen', name: 'Vlissingen', province: 'Zeeland', population: 44000, lat: 51.4426, lng: 3.5736 },
  { slug: 'goes', name: 'Goes', province: 'Zeeland', population: 38000, lat: 51.5042, lng: 3.8884 },
  { slug: 'terneuzen', name: 'Terneuzen', province: 'Zeeland', population: 54000, lat: 51.3358, lng: 3.8267 },
  { slug: 'zeist', name: 'Zeist', province: 'Utrecht', population: 65000, lat: 52.0907, lng: 5.2326 },
  { slug: 'veenendaal', name: 'Veenendaal', province: 'Utrecht', population: 67000, lat: 52.0286, lng: 5.5589 },
  { slug: 'woerden', name: 'Woerden', province: 'Utrecht', population: 53000, lat: 52.0853, lng: 4.8835 },
  { slug: 'houten', name: 'Houten', province: 'Utrecht', population: 51000, lat: 52.0353, lng: 5.1681 },
  { slug: 'culemborg', name: 'Culemborg', province: 'Gelderland', population: 30000, lat: 51.9554, lng: 5.2257 },
  { slug: 'doetinchem', name: 'Doetinchem', province: 'Gelderland', population: 58000, lat: 51.9651, lng: 6.2884 },
  { slug: 'tiel', name: 'Tiel', province: 'Gelderland', population: 42000, lat: 51.8865, lng: 5.4292 },
  { slug: 'zutphen', name: 'Zutphen', province: 'Gelderland', population: 48000, lat: 52.1414, lng: 6.1962 },
  { slug: 'ermelo', name: 'Ermelo', province: 'Gelderland', population: 27000, lat: 52.2961, lng: 5.6253 },
  { slug: 'harderwijk', name: 'Harderwijk', province: 'Gelderland', population: 49000, lat: 52.3415, lng: 5.6206 },
  { slug: 'wageningen', name: 'Wageningen', province: 'Gelderland', population: 40000, lat: 51.9692, lng: 5.6654 },
  { slug: 'bergen-op-zoom', name: 'Bergen op Zoom', province: 'Noord-Brabant', population: 67000, lat: 51.4945, lng: 4.2880 },
  { slug: 'waalwijk', name: 'Waalwijk', province: 'Noord-Brabant', population: 49000, lat: 51.6889, lng: 5.0681 },
  { slug: 'veldhoven', name: 'Veldhoven', province: 'Noord-Brabant', population: 46000, lat: 51.4119, lng: 5.3992 },
  { slug: 'uden', name: 'Uden', province: 'Noord-Brabant', population: 42000, lat: 51.6618, lng: 5.6164 },
  { slug: 'best', name: 'Best', province: 'Noord-Brabant', population: 30000, lat: 51.5102, lng: 5.3914 },
  { slug: 'cuijk', name: 'Cuijk', province: 'Noord-Brabant', population: 25000, lat: 51.7280, lng: 5.8769 },
  { slug: 'meierijstad', name: 'Meierijstad', province: 'Noord-Brabant', population: 81000, lat: 51.6128, lng: 5.5319, aliases: ['veghel', 'sint-oedenrode', 'schijndel'] },
  { slug: 'kampen', name: 'Kampen', province: 'Overijssel', population: 54000, lat: 52.5550, lng: 5.9114 },
  { slug: 'hardenberg', name: 'Hardenberg', province: 'Overijssel', population: 62000, lat: 52.5752, lng: 6.6207 },
  { slug: 'raalte', name: 'Raalte', province: 'Overijssel', population: 38000, lat: 52.3856, lng: 6.2773 },
  { slug: 'oldenzaal', name: 'Oldenzaal', province: 'Overijssel', population: 33000, lat: 52.3133, lng: 6.9342 },
  { slug: 'hoogeveen', name: 'Hoogeveen', province: 'Drenthe', population: 56000, lat: 52.7220, lng: 6.4789 },
  { slug: 'assen', name: 'Assen', province: 'Drenthe', population: 69000, lat: 52.9929, lng: 6.5640 },
  { slug: 'coevorden', name: 'Coevorden', province: 'Drenthe', population: 35000, lat: 52.6622, lng: 6.7407 },
  { slug: 'sneek', name: 'Sneek', province: 'Friesland', population: 33000, lat: 53.0331, lng: 5.6586 },
  { slug: 'drachten', name: 'Drachten', province: 'Friesland', population: 45000, lat: 53.1075, lng: 6.1019 },
  { slug: 'heerenveen', name: 'Heerenveen', province: 'Friesland', population: 50000, lat: 52.9601, lng: 5.9230 },
  { slug: 'harlingen', name: 'Harlingen', province: 'Friesland', population: 16000, lat: 53.1738, lng: 5.4216 },
  { slug: 'dokkum', name: 'Dokkum', province: 'Friesland', population: 13000, lat: 53.3258, lng: 5.9985 },
  { slug: 'winschoten', name: 'Winschoten', province: 'Groningen', population: 19000, lat: 53.1442, lng: 7.0344 },
  { slug: 'delfzijl', name: 'Delfzijl', province: 'Groningen', population: 25000, lat: 53.3263, lng: 6.9203 },
  { slug: 'veendam', name: 'Veendam', province: 'Groningen', population: 27000, lat: 53.1043, lng: 6.8770 },
  { slug: 'stadskanaal', name: 'Stadskanaal', province: 'Groningen', population: 32000, lat: 52.9889, lng: 6.9544 },
  { slug: 'hoogezand', name: 'Hoogezand', province: 'Groningen', population: 20000, lat: 53.1623, lng: 6.7595 },
  { slug: 'weert', name: 'Weert', province: 'Limburg', population: 50000, lat: 51.2510, lng: 5.7064 },
  { slug: 'kerkrade', name: 'Kerkrade', province: 'Limburg', population: 45000, lat: 50.8650, lng: 6.0628 },
  { slug: 'brunssum', name: 'Brunssum', province: 'Limburg', population: 27000, lat: 50.9447, lng: 5.9710 },
  { slug: 'beek', name: 'Beek', province: 'Limburg', population: 16000, lat: 50.9404, lng: 5.8111 },
  { slug: 'echt-susteren', name: 'Echt-Susteren', province: 'Limburg', population: 32000, lat: 51.1031, lng: 5.8753, aliases: ['echt', 'susteren'] },
  { slug: 'horst-aan-de-maas', name: 'Horst aan de Maas', province: 'Limburg', population: 42000, lat: 51.4519, lng: 6.0498, aliases: ['horst'] },
  { slug: 'peel-en-maas', name: 'Peel en Maas', province: 'Limburg', population: 44000, lat: 51.3556, lng: 5.9742, aliases: ['panningen'] },
  { slug: 'nederweert', name: 'Nederweert', province: 'Limburg', population: 17000, lat: 51.2867, lng: 5.7438 },
  { slug: 'leusden', name: 'Leusden', province: 'Utrecht', population: 31000, lat: 52.1300, lng: 5.4326 },
  { slug: 'soest', name: 'Soest', province: 'Utrecht', population: 47000, lat: 52.1736, lng: 5.2906 },
  { slug: 'baarn', name: 'Baarn', province: 'Utrecht', population: 25000, lat: 52.2128, lng: 5.2880 },
  { slug: 'bussum', name: 'Bussum', province: 'Noord-Holland', population: 33000, lat: 52.2767, lng: 5.1606, aliases: ['gooise-meren'] },
  { slug: 'hoorn', name: 'Hoorn', province: 'Noord-Holland', population: 75000, lat: 52.6425, lng: 5.0597 },
  { slug: 'heerhugowaard', name: 'Heerhugowaard', province: 'Noord-Holland', population: 58000, lat: 52.6705, lng: 4.8274, aliases: ['dijk-en-waard'] },
  { slug: 'enkhuizen', name: 'Enkhuizen', province: 'Noord-Holland', population: 19000, lat: 52.7028, lng: 5.2916 },
  { slug: 'medemblik', name: 'Medemblik', province: 'Noord-Holland', population: 45000, lat: 52.7717, lng: 5.1058 },
  { slug: 'den-helder', name: 'Den Helder', province: 'Noord-Holland', population: 56000, lat: 52.9594, lng: 4.7600 },
  { slug: 'volendam', name: 'Volendam', province: 'Noord-Holland', population: 23000, lat: 52.4933, lng: 5.0742, aliases: ['edam-volendam', 'edam'] },
  { slug: 'zandvoort', name: 'Zandvoort', province: 'Noord-Holland', population: 17000, lat: 52.3712, lng: 4.5333 },
  { slug: 'beverwijk', name: 'Beverwijk', province: 'Noord-Holland', population: 42000, lat: 52.4854, lng: 4.6571 },
  { slug: 'velsen', name: 'Velsen', province: 'Noord-Holland', population: 68000, lat: 52.4628, lng: 4.6592, aliases: ['ijmuiden'] },
  { slug: 'waddinxveen', name: 'Waddinxveen', province: 'Zuid-Holland', population: 32000, lat: 52.0454, lng: 4.6526 },
  { slug: 'oegstgeest', name: 'Oegstgeest', province: 'Zuid-Holland', population: 25000, lat: 52.1837, lng: 4.4716 },
  { slug: 'katwijk', name: 'Katwijk', province: 'Zuid-Holland', population: 67000, lat: 52.2039, lng: 4.4051 },
  { slug: 'lisse', name: 'Lisse', province: 'Zuid-Holland', population: 23000, lat: 52.2606, lng: 4.5572 },
  { slug: 'noordwijk', name: 'Noordwijk', province: 'Zuid-Holland', population: 45000, lat: 52.2380, lng: 4.4495 },
  { slug: 'pijnacker-nootdorp', name: 'Pijnacker-Nootdorp', province: 'Zuid-Holland', population: 64000, lat: 52.0186, lng: 4.4252, aliases: ['pijnacker', 'nootdorp'] },
  { slug: 'rijswijk', name: 'Rijswijk', province: 'Zuid-Holland', population: 56000, lat: 52.0367, lng: 4.3258 },
  { slug: 'wassenaar', name: 'Wassenaar', province: 'Zuid-Holland', population: 26000, lat: 52.1414, lng: 4.4014 },
  { slug: 'zwijndrecht', name: 'Zwijndrecht', province: 'Zuid-Holland', population: 45000, lat: 51.8189, lng: 4.6403 },
  { slug: 'ridderkerk', name: 'Ridderkerk', province: 'Zuid-Holland', population: 47000, lat: 51.8714, lng: 4.6019 },
  { slug: 'barendrecht', name: 'Barendrecht', province: 'Zuid-Holland', population: 50000, lat: 51.8569, lng: 4.5402 },
  { slug: 'krimpen-aan-den-ijssel', name: 'Krimpen aan den IJssel', province: 'Zuid-Holland', population: 30000, lat: 51.9095, lng: 4.5972 },
  { slug: 'hellevoetsluis', name: 'Hellevoetsluis', province: 'Zuid-Holland', population: 41000, lat: 51.8222, lng: 4.1342 },
  { slug: 'voorne-aan-zee', name: 'Voorne aan Zee', province: 'Zuid-Holland', population: 76000, lat: 51.8889, lng: 4.0500, aliases: ['brielle', 'westvoorne', 'rockanje'] },
]

// ── Lookup helpers ──────────────────────────────────────────────────────

const slugifyKey = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ‘’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Map every alias and the canonical slug to its city object. */
const cityIndex: Map<string, DutchCity> = (() => {
  const index = new Map<string, DutchCity>()
  for (const city of DUTCH_CITIES) {
    index.set(city.slug, city)
    index.set(slugifyKey(city.name), city)
    for (const alias of city.aliases ?? []) {
      index.set(slugifyKey(alias), city)
    }
  }
  return index
})()

/** Resolve any user-supplied city string (slug, display name, alias) to a known city. */
export function findCity(input: string | null | undefined): DutchCity | null {
  if (!input) return null
  return cityIndex.get(slugifyKey(input)) ?? null
}

/** Haversine distance between two cities in km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Return the n nearest cities to the given one, excluding itself. */
export function nearestCities(city: DutchCity, n = 6): DutchCity[] {
  return DUTCH_CITIES
    .filter((c) => c.slug !== city.slug)
    .map((c) => ({ city: c, d: distanceKm(city, c) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.city)
}

/** Group cities by province, sorted by population within each group. */
export function citiesByProvince(): Record<DutchProvince, DutchCity[]> {
  const groups = {} as Record<DutchProvince, DutchCity[]>
  for (const p of DUTCH_PROVINCES) groups[p] = []
  for (const c of DUTCH_CITIES) groups[c.province].push(c)
  for (const p of DUTCH_PROVINCES) {
    groups[p].sort((a, b) => b.population - a.population)
  }
  return groups
}
