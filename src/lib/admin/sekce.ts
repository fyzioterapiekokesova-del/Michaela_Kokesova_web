import { nactiSluzby } from "@/lib/obsah";
import type { Stranka } from "@/lib/navigace";
import type { Sluzba } from "@/lib/sluzby";
import { najdiSekci, sekceSluzby, type Sekce } from "./obsah-schema";

/**
 * Sekce podle klíče — pevné ze schématu i sekce služeb, které si klientka
 * přidala. Služby jsou v databázi, proto je to asynchronní a jen pro server.
 *
 * Klíč, který není ani ve schématu, ani v seznamu služeb, neexistuje.
 * Díky tomu se přes uložení ani nahrání fotky nedá založit libovolný
 * záznam v `site_content`.
 */
export async function sekcePodleKlice(
  klic: string,
): Promise<{ sekce: Sekce; sluzby: Sluzba[] } | undefined> {
  const sluzby = await nactiSluzby();
  const pevna = najdiSekci(klic);
  if (pevna) return { sekce: pevna, sluzby };

  const sluzba = sluzby.find((s) => s.klic === klic);
  if (!sluzba) return undefined;
  return { sekce: sekceSluzby(sluzba.klic, sluzba.nazev, sluzba.slug), sluzby };
}

/**
 * Všechny služby jako cíle odkazů — i skryté. Odkaz na skrytou službu
 * se smí uložit (služba se může zase zapnout), web ho jen nevykreslí.
 */
export function sluzbyJakoStranky(sluzby: readonly Sluzba[]): Stranka[] {
  return sluzby.map((s) => ({
    href: `/${s.slug}`,
    nazev: s.zobrazit ? s.nazev : `${s.nazev} (skrytá)`,
    popis: s.popis || undefined,
  }));
}
