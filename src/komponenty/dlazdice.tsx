import Link from "next/link";
import { Sipka } from "./sipka";

/**
 * Dlaždice služby. Celá je odkaz, ne jen nadpis nebo slovo „Zobrazit" —
 * na dotyku se do malého odkazu špatně trefuje.
 *
 * Barvy se šachovnicově střídají: azurová, neutrální, azurová.
 */

export type Dlazdice = {
  href: string;
  nazev: string;
  popis: string;
};

export function DlazdiceSluzby({
  polozky,
}: {
  polozky: readonly Dlazdice[];
}) {
  if (polozky.length === 0) return null;

  return (
    <ul className="grid list-none grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5">
      {polozky.map((polozka, poradi) => {
        const azurova = poradi % 2 === 0;
        return (
          <li key={polozka.href}>
            <Link
              href={polozka.href}
              data-akce={`dlazdice-${polozka.href.replace("/", "")}`}
              className={`rounded-dlazdice flex h-full flex-col p-7 transition-transform duration-150 hover:-translate-y-[3px] lg:p-11 ${
                azurova ? "bg-azurova" : "bg-povrch"
              }`}
            >
              <h3 className="text-h3 lg:text-h3-pc text-text">{polozka.nazev}</h3>
              <p className="text-telo lg:text-telo-pc text-text mt-3 grow">
                {polozka.popis}
              </p>
              <span className="text-odkaz lg:text-odkaz-pc text-text mt-6 inline-flex items-center gap-3 font-extrabold">
                Zobrazit
                <Sipka />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
