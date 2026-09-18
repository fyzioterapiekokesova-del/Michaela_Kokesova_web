import { adresaFotky, jeSupabaseNastaveny } from "@/lib/supabase/nastaveni";
import type { Obsah } from "./vychozi";

/**
 * Bezpečné čtení hodnot z JSONu s obsahem.
 *
 * Obsah přichází z databáze jako `unknown`, takže se nikde nesmí předpokládat
 * tvar. Když pole chybí nebo má jiný typ, vrátí se prázdno a stránka se
 * vykreslí bez něj — nikdy nespadne a nikdy nenapíše „undefined".
 */

export function text(obsah: Obsah, klic: string): string {
  const h = obsah[klic];
  return typeof h === "string" ? h.trim() : "";
}

/** Text, nebo `undefined`, když je prázdný — pro nepovinné části stránky. */
export function textNeboNic(obsah: Obsah, klic: string): string | undefined {
  const h = text(obsah, klic);
  return h === "" ? undefined : h;
}

export function prepinac(obsah: Obsah, klic: string): boolean {
  return obsah[klic] === true;
}

export function seznam(obsah: Obsah, klic: string): Obsah[] {
  const h = obsah[klic];
  if (!Array.isArray(h)) return [];
  return h.filter(
    (p): p is Obsah => typeof p === "object" && p !== null && !Array.isArray(p),
  );
}

/**
 * Adresa nahrané fotky, nebo `undefined`.
 *
 * Bez nastavené databáze se fotka nevykreslí — a to je správně: na ostrém
 * webu nesmí být ani jedna zástupná fotka.
 */
export function fotka(obsah: Obsah, klic: string): string | undefined {
  const cesta = text(obsah, klic);
  if (cesta === "") return undefined;

  // Dokud projekt v Supabase neexistuje, berou se fotky z `public/`.
  // Až bude, začnou se číst z úložiště a tenhle větev přestane platit.
  if (!jeSupabaseNastaveny()) return `/${cesta}`;

  return adresaFotky(cesta);
}

/**
 * Výřez fotky nastavený v administraci.
 *
 * Jména polí drží pomocník `obrazek()` v `obsah-schema.ts`: k fotce `portret`
 * patří `portret_pozice` a `portret_zoom`. Hodnoty se tady nekontrolují —
 * dělá to `pozicePropStyl` a `zoomPropStyl` až při skládání stylu, takže
 * rozbitá hodnota skončí na středu a fotka se vždycky ukáže.
 */
export function vyrez(
  obsah: Obsah,
  klic: string,
): { pozice?: string; zoom?: number } {
  const pozice = obsah[`${klic}_pozice`];
  const zoom = obsah[`${klic}_zoom`];
  return {
    pozice: typeof pozice === "string" ? pozice : undefined,
    zoom: typeof zoom === "number" ? zoom : undefined,
  };
}

/** Fotky ze seznamu — vrátí jen ty, které opravdu mají cestu i popisek. */
export function fotkyZeSeznamu(
  polozky: readonly Obsah[],
): { src: string; alt: string; pozice?: string; zoom?: number }[] {
  return polozky
    .map((p) => ({
      src: fotka(p, "cesta"),
      alt: text(p, "popis"),
      ...vyrez(p, "cesta"),
    }))
    .filter((p): p is { src: string; alt: string; pozice?: string; zoom?: number } =>
      Boolean(p.src && p.alt),
    );
}
