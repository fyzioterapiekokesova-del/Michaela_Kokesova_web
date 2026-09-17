import Link from "next/link";
import { Sipka } from "./sipka";
import { telHref } from "@/lib/kontakt";

/**
 * Rozcestník „Co vás trápí".
 *
 * Mluví příznaky, ne odbornými názvy — člověk, kterého bolí pata, nehledá
 * „plantární fasciitidu". Odborné názvy jsou až uvnitř stránek.
 *
 * Poslední položka je vždycky „Nevím — radši zavolám" v azurové a vede na
 * `tel:`. To je pro toho, kdo si ze seznamu nevybral.
 */

export type Potiz = {
  text: string;
  /** Adresa vybraná v adminu ze seznamu stránek, ne volně psaný odkaz. */
  href: string;
};

const TRIDA_POLOZKY =
  "klik rounded-karta text-odkaz-velky w-full justify-between gap-4 px-8 py-7 " +
  "transition-colors duration-150";

export function CoVasTrapi({
  polozky,
  telefon,
  textTelefonu = "Nevím — radši zavolám",
}: {
  polozky: readonly Potiz[];
  telefon?: string;
  textTelefonu?: string;
}) {
  if (polozky.length === 0 && !telefon) return null;

  return (
    <ul className="grid list-none grid-cols-1 gap-4 lg:grid-cols-3">
      {polozky.map((polozka) => (
        <li key={`${polozka.href}-${polozka.text}`}>
          <Link
            href={polozka.href}
            className={`${TRIDA_POLOZKY} bg-plocha hover:bg-seda`}
          >
            {polozka.text}
            <Sipka />
          </Link>
        </li>
      ))}

      {telefon ? (
        <li>
          <a
            href={telHref(telefon)}
            data-akce="telefon-co-vas-trapi"
            className={`${TRIDA_POLOZKY} bg-azurova text-text hover:bg-text hover:text-azurova font-extrabold`}
          >
            {textTelefonu}
            <Sipka />
          </a>
        </li>
      ) : null}
    </ul>
  );
}
