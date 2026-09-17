import Link from "next/link";
import { SCHEMA } from "@/lib/admin/obsah-schema";

/**
 * Rozcestník administrace.
 *
 * Sekce jsou v pořadí, v jakém jdou na webu, aby se v tom Michaela vyznala
 * bez vysvětlování. Každá se ukládá zvlášť.
 */
export default function AdminUvod() {
  return (
    <>
      <h1 className="text-h2 lg:text-h2-pc">Co chcete upravit?</h1>
      <p className="text-perex lg:text-perex-pc text-text-doplnek mt-4 max-w-[52ch]">
        Sekce jsou seřazené tak, jak jdou na webu. Každou uložíte zvlášť —
        rozdělaná práce v jedné sekci se do jiné nepromítne.
      </p>

      <ul className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SCHEMA.map((sekce) => (
          <li key={sekce.klic}>
            <Link
              href={`/admin/${sekce.klic}`}
              className="border-linka bg-povrch rounded-karta hover:border-text flex h-full flex-col p-5 transition-colors duration-150"
            >
              <span className="text-odkaz">{sekce.nazev}</span>
              {sekce.popis ? (
                <span className="text-text-doplnek mt-2 text-[1.0625rem]">
                  {sekce.popis}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      <section className="border-linka bg-povrch rounded-karta mt-12 p-6">
        <h2 className="text-h3">Záloha obsahu</h2>
        <p className="text-text-doplnek mt-3 max-w-[60ch] text-[1.0625rem]">
          Stáhne všechny texty a odkazy na fotky do jednoho souboru. Hodí se
          udělat pokaždé, než se pustíte do větších změn — kdyby se něco
          pokazilo, je z čeho obsah vrátit zpátky.
        </p>
        <a
          href="/admin/zaloha"
          download
          className="klik rounded-tlacitko bg-linka hover:bg-seda mt-5 justify-center px-6 text-[1.0625rem] font-bold transition-colors duration-150"
          data-akce="admin-zaloha"
        >
          Stáhnout zálohu obsahu
        </a>
      </section>
    </>
  );
}
