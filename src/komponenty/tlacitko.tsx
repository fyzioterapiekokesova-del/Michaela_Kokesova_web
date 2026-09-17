import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Tlačítko. Tři varianty, nic dalšího.
 *
 * Minimální klikací výška je 48 px u všech, na mobilu jdou přes celou šířku.
 * Pohyb je jen změna barvy za 150 ms — žádné zvětšování ani posun.
 */

type Varianta =
  /** Jediná hlavní akce na obrazovce. Azurová výplň, tmavý text. */
  | "primarni"
  /** Vedlejší akce. Šedá výplň. */
  | "sekundarni"
  /** Hlavní akce na azurové ploše — azurová by na azurové zanikla. */
  | "primarni-na-azurove"
  /** Vedlejší akce na azurové ploše. */
  | "sekundarni-na-azurove";

type Vlastnosti = {
  varianta?: Varianta;
  /** Adresa. `tel:`, `mailto:` a cizí weby se vykreslí jako obyčejné `<a>`. */
  href?: string;
  /** Bez `href` vznikne `<button>`. */
  typ?: "button" | "submit";
  onClick?: () => void;
  /** Zablokované tlačítko — používá se ve stavu „odesílá se". */
  zablokovano?: boolean;
  plnaSirka?: boolean;
  /** Stabilní identifikátor pro pozdější měření. Přežije úpravu vzhledu. */
  akce?: string;
  children: ReactNode;
};

const ZAKLAD =
  "klik justify-center rounded-tlacitko text-center transition-colors duration-150 " +
  "disabled:cursor-not-allowed disabled:opacity-70";

const VARIANTY: Record<Varianta, string> = {
  primarni:
    "bg-azurova text-text text-tlacitko lg:text-tlacitko-pc px-10 py-5.5 " +
    "hover:bg-text hover:text-azurova",
  sekundarni:
    "bg-linka text-text text-tlacitko-2 lg:text-tlacitko-2-pc px-8 py-5.5 " +
    "hover:bg-seda",
  "primarni-na-azurove":
    "bg-text text-azurova text-tlacitko lg:text-tlacitko-pc px-10 py-5.5 " +
    "hover:bg-povrch hover:text-text",
  "sekundarni-na-azurove":
    "bg-povrch text-text text-tlacitko-2 lg:text-tlacitko-2-pc px-8 py-5.5 " +
    "hover:bg-linka",
};

function jeVnejsi(href: string): boolean {
  return /^(tel:|mailto:|https?:)/.test(href);
}

export function Tlacitko({
  varianta = "primarni",
  href,
  typ = "button",
  onClick,
  zablokovano = false,
  plnaSirka = false,
  akce,
  children,
}: Vlastnosti) {
  const trida = [
    ZAKLAD,
    VARIANTY[varianta],
    plnaSirka ? "w-full" : "w-full sm:w-auto",
  ].join(" ");

  if (href && !zablokovano) {
    if (jeVnejsi(href)) {
      return (
        <a href={href} className={trida} data-akce={akce}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={trida} data-akce={akce}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={typ}
      onClick={onClick}
      disabled={zablokovano}
      className={trida}
      data-akce={akce}
    >
      {children}
    </button>
  );
}
