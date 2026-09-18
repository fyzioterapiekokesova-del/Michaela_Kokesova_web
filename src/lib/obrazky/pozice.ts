/*
  Ohnisko výřezu fotky — sdílené mezi webem a administrací.

  Převzato z projektu Mostecká, kde se to už osvědčilo. Beze změny zůstal
  celý výpočet; vynechaná je jen práce s otočením, tu tenhle web nepotřebuje.

  Fotka se do obrazového místa nevejde celá; přebytek se ořízne. Ohnisko říká,
  který bod fotky má zůstat uprostřed rámečku — je to přesně to, co v CSS umí
  `object-position`, takže se ukládá rovnou v jeho tvaru: `"50% 30%"`.

  Ukládá se ohnisko, ne oříznutá fotka, a má to dva důvody. Rámeček má na
  mobilu jiný poměr stran než na počítači, takže jeden natvrdo oříznutý soubor
  by seděl vždy jen na jednom z nich. A originál zůstává nedotčený, takže jde
  výřez kdykoliv přenastavit, aniž by se fotka nahrávala znovu.
*/

/** Střed — tak se fotky ořezávaly, než ohnisko existovalo. */
export const VYCHOZI_POZICE = "50% 50%";

/**
 * Dvě procenta oddělená mezerou.
 *
 * Hodnota se vypisuje do stylu stránky, takže se nesmí jen tak převzít
 * z formuláře — text od klientky se jinam než do textu nedostane.
 */
const TVAR = /^(100|\d{1,2})% (100|\d{1,2})%$/;

export function jePozice(hodnota: unknown): hodnota is string {
  return typeof hodnota === "string" && TVAR.test(hodnota);
}

/** Hodnota k vykreslení: co nesedí na tvar, nahradí střed. */
export function pozicePropStyl(hodnota: unknown): string {
  return jePozice(hodnota) ? hodnota : VYCHOZI_POZICE;
}

/** Složí ohnisko z čísel a zaokrouhlí je do povoleného rozsahu. */
export function slozPozici(x: number, y: number): string {
  return `${omez(x)}% ${omez(y)}%`;
}

/** Rozloží ohnisko na čísla — pro tažení myší a pro šipky. */
export function rozlozPozici(hodnota: unknown): { x: number; y: number } {
  const [x, y] = pozicePropStyl(hodnota).split(" ").map(parseFloat);
  return { x: x ?? 50, y: y ?? 50 };
}

function omez(hodnota: number): number {
  if (!Number.isFinite(hodnota)) return 50;
  return Math.min(100, Math.max(0, Math.round(hodnota)));
}

/* -------------------------------------------------------------------------- */
/* Přiblížení                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Beze změny velikosti.
 *
 * Zmenšit pod jedničku nejde schválně: fotka je při 1 zvětšená přesně tak,
 * aby rámeček pokryla celý. Cokoliv menšího by znamenalo prázdné pruhy
 * po stranách.
 */
export const VYCHOZI_ZOOM = 1;

/** Čtyřnásobek stačí i na výřez obličeje ze skupinové fotky; víc už je kaše. */
export const MAX_ZOOM = 4;

/** Použitelné přiblížení — cokoliv jiného znamená „nepřibližovat". */
export function zoomPropStyl(hodnota: unknown): number {
  const cislo = typeof hodnota === "string" ? parseFloat(hodnota) : hodnota;

  if (typeof cislo !== "number" || !Number.isFinite(cislo)) return VYCHOZI_ZOOM;

  return Math.min(MAX_ZOOM, Math.max(VYCHOZI_ZOOM, Math.round(cislo * 100) / 100));
}

/**
 * Styl výřezu — jeden zdroj pravdy pro web i pro náhled v administraci.
 *
 * `objectPosition` vybere, který bod fotky zůstane v rámečku, a `scale` fotku
 * zvětší. Střed zvětšování je schválně tentýž bod: `object-position: 30% 70%`
 * znamená, že bod 30/70 fotky leží na 30/70 rámečku — když se kolem něj
 * zvětšuje, zůstane fotka „přišpendlená" tam, kam ji uživatelka posunula.
 * S výchozím středem zvětšování by jí při přiblížení ujela.
 */
export function stylVyrezu(
  pozice: unknown,
  zoom: unknown,
): { objectPosition: string; transform?: string; transformOrigin: string } {
  return {
    objectPosition: pozicePropStyl(pozice),
    ...stylPriblizeni(pozice, zoom),
  };
}

/**
 * Jen přiblížení, k položení na obal fotky.
 *
 * Hodí se tam, kde má fotka vlastní `transform` — v galerii se při najetí
 * myší zvětšuje. Dva transformy na jednom prvku nejdou, druhý by ten první
 * přepsal; na obalu se naopak násobí, takže obojí funguje zároveň.
 */
export function stylPriblizeni(
  pozice: unknown,
  zoom: unknown,
): { transform?: string; transformOrigin: string } {
  const meritko = zoomPropStyl(zoom);

  return {
    transform: meritko > VYCHOZI_ZOOM ? `scale(${meritko})` : undefined,
    transformOrigin: pozicePropStyl(pozice),
  };
}
