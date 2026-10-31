import { OBSAZENE_ADRESY, type Stranka } from "./navigace.ts";

/**
 * Seznam služeb, které si klientka spravuje v administraci.
 *
 * Seznam je jeden záznam `sluzby` v `site_content`. Každá služba v něm má
 * adresu, název do menu a odkaz na vlastní záznam s obsahem stránky
 * (`klic`, např. `sluzba-podologie`). Obsah zůstává v samostatném záznamu,
 * takže stránka služby se v administraci upravuje stejně jako každá jiná.
 *
 * Tenhle soubor je čistý — žádná databáze — aby ho mohla použít
 * administrace v prohlížeči i kontrolní skripty.
 */

export type Sluzba = {
  /** Stálý identifikátor položky. Nemění se ani při přejmenování. */
  id: string;
  /** Adresa bez lomítka. Po vytvoření se nemění — vedou na ni odkazy. */
  slug: string;
  nazev: string;
  /** Krátký popis pod názvem v menu. */
  popis: string;
  /** Klíč záznamu s obsahem stránky v `site_content`. */
  klic: string;
  /** Skrytá služba na webu není, ale její obsah zůstává. */
  zobrazit: boolean;
};

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const KLIC_SLUZBY = /^sluzba-[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Víc se jich do rozbalovací nabídky v menu rozumně nevejde. */
export const MAX_SLUZEB = 8;

function retezec(x: unknown): string {
  return typeof x === "string" ? x.trim() : "";
}

/**
 * Přečte seznam služeb z obsahu. Cokoli rozbitého (chybí adresa, adresa
 * se opakuje) se vynechá — web nesmí spadnout kvůli jedné vadné položce.
 */
export function prectiSluzby(obsah: unknown): Sluzba[] {
  const seznam =
    typeof obsah === "object" && obsah !== null && "seznam" in obsah
      ? (obsah as { seznam: unknown }).seznam
      : [];
  if (!Array.isArray(seznam)) return [];

  const videne = new Set<string>();
  const vysledek: Sluzba[] = [];
  for (const polozka of seznam) {
    if (typeof polozka !== "object" || polozka === null) continue;
    const p = polozka as Record<string, unknown>;
    const slug = retezec(p.slug);
    const klic = retezec(p.klic);
    const nazev = retezec(p.nazev);
    if (!SLUG.test(slug) || !KLIC_SLUZBY.test(klic) || !nazev) continue;
    if (videne.has(slug) || videne.has(klic)) continue;
    videne.add(slug).add(klic);
    vysledek.push({
      id: retezec(p._id) || slug,
      slug,
      nazev,
      popis: retezec(p.popis),
      klic,
      zobrazit: p.zobrazit !== false,
    });
  }
  return vysledek;
}

/** Zpátky do tvaru, jak se ukládá do databáze. */
export function zapisSluzby(sluzby: readonly Sluzba[]) {
  return {
    seznam: sluzby.map((s) => ({
      _id: s.id,
      slug: s.slug,
      nazev: s.nazev,
      popis: s.popis,
      klic: s.klic,
      zobrazit: s.zobrazit,
    })),
  };
}

/** Služby, které jsou na webu vidět, jako stránky pro menu a odkazy. */
export function viditelneStranky(sluzby: readonly Sluzba[]): Stranka[] {
  return sluzby
    .filter((s) => s.zobrazit)
    .map((s) => ({ href: `/${s.slug}`, nazev: s.nazev, popis: s.popis || undefined }));
}

/** Adresa z názvu: „Lymfodrenáž rukou“ → `lymfodrenaz-rukou`. */
export function vytvorSlug(nazev: string): string {
  return nazev
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

/** Proč adresa nejde použít, nebo nic, když je v pořádku. */
export function chybaAdresy(slug: string, sluzby: readonly Sluzba[]): string | undefined {
  if (!slug) return "Napište adresu stránky.";
  if (slug.length > 60) return "Adresa může mít nejvýš 60 znaků.";
  if (!SLUG.test(slug)) {
    return "Adresa smí obsahovat jen malá písmena bez háčků, číslice a pomlčky.";
  }
  if (OBSAZENE_ADRESY.has(slug)) return "Tuhle adresu už používá jiná stránka webu.";
  if (sluzby.some((s) => s.slug === slug || s.klic === `sluzba-${slug}`)) {
    return "Služba s touhle adresou už existuje.";
  }
  return undefined;
}
