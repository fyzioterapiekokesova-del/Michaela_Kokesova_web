/**
 * Kanonický seznam stránek a struktura menu.
 *
 * Tohle je jediné místo, kde jsou adresy webu vypsané. Používá ho hlavička,
 * patička i administrace — v adminu se z něj plní rozbalovací výběr cílové
 * stránky u sekce „Co vás trápí". Klientka nikdy nepíše odkaz ručně.
 *
 * Adresy z databáze se vždycky ověřují proti tomuto seznamu (`jeZnamaStranka`),
 * takže překlep ani zrušená stránka nevytvoří na webu mrtvý odkaz.
 */

export type Stranka = {
  /** Adresa. Vždy začíná lomítkem. */
  href: string;
  /** Název tak, jak se píše v menu a v patičce. */
  nazev: string;
  /** Popis pro výběr v administraci. */
  popis?: string;
};

/** Tři služby. Terapie TMK a stélky Formthotics jsou zrušené. */
export const SLUZBY: readonly Stranka[] = [
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

/** Stránky, na které smí vést odkaz ze sekce „Co vás trápí". */
export const CILE_ODKAZU: readonly Stranka[] = [
  ...SLUZBY,
  { href: "/cenik", nazev: "Ceník" },
  { href: "/o-mne", nazev: "O mně" },
  { href: "/caste-dotazy", nazev: "Časté dotazy" },
  { href: "/#kontakt", nazev: "Kontakt" },
] as const;

export type PolozkaMenu =
  | { druh: "odkaz"; href: string; nazev: string }
  | { druh: "rozbaleni"; nazev: string; polozky: readonly Stranka[] }
  | { druh: "tlacitko"; href: string; nazev: string };

/**
 * Šest položek. „Služby" nemá vlastní stránku — je to rozcestník, který jen
 * rozbaluje nabídku tří služeb. Proto je to tlačítko s `aria-expanded`,
 * ne odkaz: klepnutí něco viditelně udělá, což u pouhého spouštěče neplatí.
 *
 * „Kontakt" je tlačítko vedoucí na spodek úvodní stránky. Je to obyčejný
 * odkaz, takže funguje i s vypnutým JavaScriptem.
 */
export const MENU: readonly PolozkaMenu[] = [
  { druh: "odkaz", href: "/", nazev: "Úvod" },
  { druh: "rozbaleni", nazev: "Služby", polozky: SLUZBY },
  { druh: "odkaz", href: "/cenik", nazev: "Ceník" },
  { druh: "odkaz", href: "/o-mne", nazev: "O mně" },
  { druh: "odkaz", href: "/caste-dotazy", nazev: "Časté dotazy" },
  { druh: "tlacitko", href: "/#kontakt", nazev: "Kontakt" },
] as const;

/** Odkazy v patičce — právní dokumenty. */
export const PRAVNI: readonly Stranka[] = [
  { href: "/zasady-osobnich-udaju", nazev: "Zásady zpracování osobních údajů" },
  { href: "/zasady-cookies", nazev: "Zásady cookies" },
] as const;

const ZNAME_ADRESY = new Set<string>([
  "/",
  ...CILE_ODKAZU.map((s) => s.href),
  ...PRAVNI.map((s) => s.href),
  "/dekujeme",
]);

/** Ověří, že adresa z databáze skutečně existuje. */
export function jeZnamaStranka(href: string): boolean {
  return ZNAME_ADRESY.has(href);
}

/** Název stránky podle adresy — pro výpis v administraci. */
export function nazevStranky(href: string): string | undefined {
  return CILE_ODKAZU.find((s) => s.href === href)?.nazev;
}
