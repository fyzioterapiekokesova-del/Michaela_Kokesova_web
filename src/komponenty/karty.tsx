import type { ReactNode } from "react";

/**
 * Karty a štítky. Odlišují se posunem pozadí, ne rámečkem ani stínem.
 */

/* --- Otázka a odpověď ----------------------------------------------------- */

export type Otazka = {
  otazka: string;
  odpoved: string;
};

export function KartaOtazky({ otazka, odpoved }: Otazka) {
  return (
    <div className="bg-povrch rounded-karta-velka px-8 py-8 lg:px-9">
      <h3 className="text-h3 lg:text-h3-pc">{otazka}</h3>
      <p className="text-telo lg:text-telo-pc mt-3 whitespace-pre-line">
        {odpoved}
      </p>
    </div>
  );
}

/* --- Věkové skupiny ------------------------------------------------------- */

export type KartaVeku = {
  nadpis: string;
  text: string;
};

export function KartyVeku({
  polozky,
  pozadiPlocha = false,
}: {
  polozky: readonly KartaVeku[];
  /** Sekce na šedém pozadí — karty pak střídají povrch a plnou šedou. */
  pozadiPlocha?: boolean;
}) {
  if (polozky.length === 0) return null;

  return (
    <ul className="grid list-none grid-cols-2 gap-4 lg:grid-cols-4">
      {polozky.map((karta, poradi) => (
        <li
          key={karta.nadpis}
          className={`rounded-karta p-6 ${
            poradi % 2 === 0
              ? "bg-seda"
              : pozadiPlocha
                ? "bg-povrch"
                : "bg-plocha"
          }`}
        >
          <p className="text-h3 lg:text-h3-pc">{karta.nadpis}</p>
          <p className="text-telo lg:text-telo-pc mt-2">{karta.text}</p>
        </li>
      ))}
    </ul>
  );
}

/* --- Štítek nad nadpisem -------------------------------------------------- */

export function Stitek({ children }: { children: ReactNode }) {
  return (
    <span className="bg-azurova-svetla text-text rounded-stitek inline-flex items-center gap-2 px-4 py-2 text-[0.9375rem] font-bold">
      {children}
    </span>
  );
}

/* --- Uklidňující poznámka ------------------------------------------------- */

export function Poznamka({
  nadpis,
  children,
}: {
  nadpis?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <span
        aria-hidden
        className="bg-azurova-svetla text-text rounded-stitek flex size-11 shrink-0 items-center justify-center text-[1.25rem] font-extrabold"
      >
        ?
      </span>
      <p className="text-telo lg:text-telo-pc">
        {nadpis ? <strong>{nadpis} </strong> : null}
        {children}
      </p>
    </div>
  );
}

/* --- Prázdný stav --------------------------------------------------------- */

/**
 * Prázdné stavy jsou napsané, ne prázdné místo. Když v ceníku nejsou položky
 * nebo nejsou žádné dotazy, člověk se to dozví větou, ne dírou ve stránce.
 */
export function PrazdnyStav({ children }: { children: ReactNode }) {
  return (
    <p className="bg-plocha rounded-karta text-telo lg:text-telo-pc text-text-doplnek px-7 py-6">
      {children}
    </p>
  );
}
