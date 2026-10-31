import Link from "next/link";
import { MENU_ADMINU } from "@/lib/admin/obsah-schema";

/**
 * Rozcestník administrace.
 *
 * Stejné položky jako menu vlevo, jen s popisem, co v nich je — ať se
 * v tom Michaela vyzná bez vysvětlování.
 */
export default function AdminUvod() {
  return (
    <div className="max-w-[64rem]">
      <h1 className="text-2xl font-bold">Co chcete upravit?</h1>
      <p className="text-text-doplnek mt-1 text-[0.9375rem]">
        Vyberte část webu. Na každé stránce je dole tlačítko Uložit změny.
      </p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {MENU_ADMINU.map((polozka) => (
          <li key={polozka.href}>
            <Link
              href={polozka.href}
              className="border-linka hover:border-text flex h-full flex-col rounded-lg border bg-white p-4 transition-colors duration-150"
            >
              <span className="font-bold">{polozka.nazev}</span>
              <span className="text-text-doplnek mt-1 text-sm">{polozka.popis}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="border-linka mt-8 rounded-lg border bg-white p-4 sm:p-5">
        <h2 className="text-lg font-bold">Záloha obsahu</h2>
        <p className="text-text-doplnek mt-1 max-w-[60ch] text-sm">
          Stáhne všechny texty a odkazy na fotky do jednoho souboru. Hodí se
          udělat pokaždé, než se pustíte do větších změn — kdyby se něco
          pokazilo, je z čeho obsah vrátit zpátky.
        </p>
        <a
          href="/admin/zaloha"
          download
          className="hover:bg-plocha mt-3 inline-flex h-9 items-center rounded-md border border-[#c9cbc5] bg-white px-3 text-sm font-semibold"
          data-akce="admin-zaloha"
        >
          Stáhnout zálohu obsahu
        </a>
      </section>
    </div>
  );
}
