import Link from "next/link";
import { vyzadujAdmina } from "@/lib/admin/autorizace";
import { odhlasit } from "@/app/admin/akce/prihlaseni";

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
        <div className="obal flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
          <Link href="/admin" className="klik text-odkaz">
            Správa obsahu
          </Link>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-text-doplnek text-[1.0625rem]">
              {admin.email}
            </span>
            {/*
              Nová karta schválně: rozdělaná úprava v administraci se nesmí
              ztratit jen proto, že se šla majitelka podívat na web.
              `rel="noopener"` proto, že otevřená karta jinak dosáhne přes
              `window.opener` zpátky na administraci.
            */}
            <Link
              href="/"
              target="_blank"
              rel="noopener"
              className="klik text-[1.0625rem] underline"
            >
              Zobrazit web
              <span className="sr-only"> (otevře se v nové kartě)</span>
            </Link>
            <form action={odhlasit}>
              <button type="submit" className="klik text-[1.0625rem] underline">
                Odhlásit se
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="obsah-adminu" className="obal flex-1 py-8 lg:py-12">
        {children}
      </main>
    </>
  );
}
