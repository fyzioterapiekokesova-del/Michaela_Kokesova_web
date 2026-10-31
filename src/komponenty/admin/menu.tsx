"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU, najdiSekci } from "@/lib/admin/obsah-schema";

/**
 * Menu administrace — všechny sekce pořád po ruce.
 *
 * Bez něj se mezi sekcemi chodilo přes přehled a zpátky. Na počítači je
 * menu sloupec vlevo, na mobilu sbalené pod tlačítkem nad obsahem.
 */
export function MenuAdminu() {
  const cesta = usePathname();

  const seznam = (
    <nav aria-label="Sekce webu" className="text-[0.9375rem]">
      <Link
        href="/admin"
        aria-current={cesta === "/admin" ? "page" : undefined}
        className="hover:bg-plocha aria-[current=page]:bg-azurova block rounded-md px-3 py-2 font-semibold"
      >
        Přehled
      </Link>
      {MENU.map((skupina) => (
        <div key={skupina.nazev} className="mt-4">
          <p className="text-text-doplnek px-3 text-xs font-bold tracking-wide uppercase">
            {skupina.nazev}
          </p>
          <ul className="mt-1">
            {skupina.klice.map((klic) => {
              const sekce = najdiSekci(klic);
              if (!sekce) return null;
              const href = `/admin/${klic}`;
              return (
                <li key={klic}>
                  <Link
                    href={href}
                    aria-current={cesta === href ? "page" : undefined}
                    className="hover:bg-plocha aria-[current=page]:bg-azurova block rounded-md px-3 py-1.5 aria-[current=page]:font-semibold"
                  >
                    {sekce.kratce ?? sekce.nazev}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <aside className="border-linka bg-povrch hidden w-56 shrink-0 border-r p-3 md:block">
        <div className="sticky top-3">{seznam}</div>
      </aside>

      {/* `key` podle adresy: po přechodu na jinou sekci se menu samo zavře. */}
      <details key={cesta} className="border-linka bg-povrch border-b px-4 py-2 md:hidden">
        <summary className="cursor-pointer py-2 font-semibold">Sekce webu</summary>
        <div className="pb-2">{seznam}</div>
      </details>
    </>
  );
}
