"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_ADMINU } from "@/lib/admin/obsah-schema";

/**
 * Menu administrace — všechny části webu pořád po ruce.
 *
 * Bez něj se mezi sekcemi chodilo přes přehled a zpátky. Na počítači je
 * menu sloupec vlevo, na mobilu sbalené pod tlačítkem nad obsahem.
 * Pod Službami jsou rovnou jednotlivé služby, ať se k textům jedné z nich
 * nemusí chodit přes seznam.
 */

type SluzbaVMenu = { klic: string; nazev: string; zobrazit: boolean };

const ODKAZ =
  "hover:bg-plocha aria-[current=page]:bg-azurova block rounded-md px-3 aria-[current=page]:font-semibold";

export function MenuAdminu({ sluzby }: { sluzby: readonly SluzbaVMenu[] }) {
  const cesta = usePathname();

  const seznam = (
    <nav aria-label="Části webu" className="text-[0.9375rem]">
      <ul>
        <li>
          <Link
            href="/admin"
            aria-current={cesta === "/admin" ? "page" : undefined}
            className={`${ODKAZ} py-2 font-semibold`}
          >
            Přehled
          </Link>
        </li>
        {MENU_ADMINU.map((polozka) => (
          <li key={polozka.href} className="mt-0.5">
            <Link
              href={polozka.href}
              aria-current={cesta === polozka.href ? "page" : undefined}
              className={`${ODKAZ} py-1.5`}
            >
              {polozka.nazev}
            </Link>
            {polozka.href === "/admin/sluzby" && sluzby.length > 0 ? (
              <ul className="border-linka mt-0.5 mb-1 ml-3 border-l pl-1 text-sm">
                {sluzby.map((s) => {
                  const href = `/admin/${s.klic}`;
                  return (
                    <li key={s.klic}>
                      <Link
                        href={href}
                        aria-current={cesta === href ? "page" : undefined}
                        className={`${ODKAZ} py-1`}
                      >
                        {s.nazev}
                        {s.zobrazit ? null : (
                          <span className="text-text-doplnek"> (skrytá)</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      <aside className="border-linka bg-povrch hidden w-56 shrink-0 border-r p-3 md:block">
        <div className="sticky top-3">{seznam}</div>
      </aside>

      {/* `key` podle adresy: po přechodu na jinou stránku se menu samo zavře. */}
      <details key={cesta} className="border-linka bg-povrch border-b px-4 py-2 md:hidden">
        <summary className="cursor-pointer py-2 font-semibold">Části webu</summary>
        <div className="pb-2">{seznam}</div>
      </details>
    </>
  );
}
