/**
 * Kanonický seznam stránek a struktura menu.
 *
 * Pevné stránky (ceník, o mně, dotazy…) jsou vypsané tady. Služby si
 * klientka přidává v administraci, takže se sem dostávají jako parametr
 * — seznam se načte z databáze (`lib/sluzby.ts`) a předá dál.
 *
 * Adresy z databáze se vždycky ověřují proti tomuhle seznamu
 * (`jeZnamaStranka`), takže překlep ani zrušená stránka nevytvoří na webu
 * mrtvý odkaz.
 */

export type Stranka = {
  /** Adresa. Vždy začíná lomítkem. */
  href: string;
  /** Název tak, jak se píše v menu a v patičce. */
  nazev: string;
  /** Popis pod názvem v menu a ve výběru v administraci. */
  popis?: string;
};

/**
 * Služby, se kterými web začínal. Platí, dokud klientka v administraci
 * seznam služeb poprvé neuloží, a drží se jich i výběr stránek u titulků
 * pro vyhledávače, kde už jsou uložené.
 */
export const VYCHOZI_SLUZBY: readonly Stranka[] = [
  {
    href: "/fyzioterapie",
    nazev: "Fyzioterapie",
    popis: "Bolesti zad, kloubů, po úrazu",
  },
  {
    href: "/podologie",
    nazev: "Podologie",
    popis: "Chodidla, nehty, otlaky",
  },
  {
    href: "/detska-fyzioterapie",
    nazev: "Dětská fyzioterapie",
    popis: "Od šestinedělí po školáky",
  },
] as const;

/** Pevné stránky, na které smí vést odkaz ze sekce „Co vás trápí". */
const PEVNE_CILE: readonly Stranka[] = [
  { href: "/cenik", nazev: "Ceník" },
  { href: "/o-mne", nazev: "O mně" },
  { href: "/caste-dotazy", nazev: "Časté dotazy" },
  { href: "/#kontakt", nazev: "Kontakt" },
] as const;

/** Stránky, na které smí vést odkaz ze sekce „Co vás trápí". */
export function cileOdkazu(sluzby: readonly Stranka[]): readonly Stranka[] {
  return [...sluzby, ...PEVNE_CILE];
}

export type PolozkaMenu =
  | { druh: "odkaz"; href: string; nazev: string }
  | { druh: "rozbaleni"; nazev: string; polozky: readonly Stranka[] }
  | { druh: "tlacitko"; href: string; nazev: string };

/**
 * Šest položek. „Služby" nemá vlastní stránku — je to rozcestník, který jen
 * rozbaluje nabídku služeb. Proto je to tlačítko s `aria-expanded`,
 * ne odkaz: klepnutí něco viditelně udělá, což u pouhého spouštěče neplatí.
 *
 * „Kontakt" je tlačítko vedoucí na spodek úvodní stránky. Je to obyčejný
 * odkaz, takže funguje i s vypnutým JavaScriptem.
 */
export function menuWebu(sluzby: readonly Stranka[]): readonly PolozkaMenu[] {
  return [
    { druh: "odkaz", href: "/", nazev: "Úvod" },
    { druh: "rozbaleni", nazev: "Služby", polozky: sluzby },
    { druh: "odkaz", href: "/cenik", nazev: "Ceník" },
    { druh: "odkaz", href: "/o-mne", nazev: "O mně" },
    { druh: "odkaz", href: "/caste-dotazy", nazev: "Časté dotazy" },
    { druh: "tlacitko", href: "/#kontakt", nazev: "Kontakt" },
  ];
}

/** Odkazy v patičce — právní dokumenty. */
export const PRAVNI: readonly Stranka[] = [
  { href: "/zasady-osobnich-udaju", nazev: "Zásady zpracování osobních údajů" },
  { href: "/zasady-cookies", nazev: "Zásady cookies" },
] as const;

/**
 * Adresy, které služba nesmí dostat — patří pevným stránkám webu nebo
 * technice (administrace, obrázky, sitemapa).
 */
export const OBSAZENE_ADRESY: ReadonlySet<string> = new Set([
  "admin",
  "akce",
  "api",
  "cenik",
  "o-mne",
  "caste-dotazy",
  "dekujeme",
  "kontakt",
  "sluzby",
  "uvod",
  "zasady-osobnich-udaju",
  "zasady-cookies",
  "icon",
  "favicon",
  "opengraph-image",
  "robots",
  "sitemap",
]);

/** Ověří, že adresa z databáze skutečně existuje. */
export function jeZnamaStranka(href: string, sluzby: readonly Stranka[]): boolean {
  return (
    href === "/" ||
    href === "/dekujeme" ||
    cileOdkazu(sluzby).some((s) => s.href === href) ||
    PRAVNI.some((s) => s.href === href)
  );
}
