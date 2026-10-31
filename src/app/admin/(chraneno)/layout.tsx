import Link from "next/link";
import { vyzadujAdmina } from "@/lib/admin/autorizace";
import { odhlasit } from "@/app/admin/akce/prihlaseni";
import { adresaWebu } from "@/lib/admin/adresa-webu";
import { MenuAdminu } from "@/komponenty/admin/menu";

/**
 * Layout přihlášené části administrace.
 *
 * Ověření je **na serveru**: nepřihlášený se sem vůbec nedostane, nedostane
 * ani prázdnou stránku — rovnou ho to odveze na přihlášení. Skrytí obsahu
 * v prohlížeči by ochrana nebyla, HTML by se stejně stáhlo.
 *
 * Každá server action si oprávnění ověřuje znovu. Tenhle layout je pohodlí,
 * ne ochrana.
 */
export default async function ChranenyLayout({
  children,
}: LayoutProps<"/admin">) {
  const admin = await vyzadujAdmina();

  return (
    <>
      <header className="border-linka bg-povrch border-b">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2">
          <Link href="/admin" className="py-2 font-bold">
            Správa obsahu webu
          </Link>

          <div className="flex flex-wrap items-center gap-x-5 text-[0.9375rem]">
            <span className="text-text-doplnek hidden sm:inline">{admin.email}</span>
            {/*
              Nová karta schválně: rozdělaná úprava v administraci se nesmí
              ztratit jen proto, že se šla majitelka podívat na web.
              `rel="noopener"` proto, že otevřená karta jinak dosáhne přes
              `window.opener` zpátky na administraci.
            */}
            <a
              href={adresaWebu()}
              target="_blank"
              rel="noopener"
              className="py-2 underline"
            >
              Zobrazit web
              <span className="sr-only"> (otevře se v nové kartě)</span>
            </a>
            <form action={odhlasit}>
              <button type="submit" className="py-2 underline">
                Odhlásit se
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <MenuAdminu />
        <main id="obsah-adminu" className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </>
  );
}
