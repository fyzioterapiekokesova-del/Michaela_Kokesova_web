import Link from "next/link";
import { redirect } from "next/navigation";
import { prihlasit } from "@/app/admin/akce/prihlaseni";
import { FormularPrihlaseni } from "@/komponenty/admin/formular-prihlaseni";
import { zjistiAdmina } from "@/lib/admin/autorizace";

/**
 * Přihlášení do administrace.
 *
 * Veřejná registrace je vypnutá — účet zakládá správce webu. Proto tu není
 * žádný odkaz „vytvořit účet".
 */
export const dynamic = "force-dynamic";

export default async function Prihlaseni() {
  // Kdo už je přihlášený, nemá co koukat na přihlašovací formulář.
  const admin = await zjistiAdmina();
  if (admin) redirect("/admin");

  return (
    <div className="obal flex flex-1 items-center justify-center py-12">
      <div className="bg-povrch border-linka rounded-karta w-full max-w-[30rem] border p-6 lg:p-8">
        <h1 className="text-h3 lg:text-h3-pc">Správa obsahu</h1>
        <p className="text-text-doplnek mt-3 text-[1.0625rem]">
          Přihlaste se e-mailem a heslem, které jste dostala od správce webu.
        </p>

        <div className="mt-8">
          <FormularPrihlaseni
            akce={prihlasit}
            sHeslem
            popisTlacitka="Přihlásit se"
          />
        </div>

        <p className="mt-6">
          <Link href="/admin/zapomenute-heslo" className="klik underline">
            Zapomněla jsem heslo
          </Link>
        </p>

        <p className="border-linka mt-6 border-t pt-6">
          <Link href="/" className="klik underline">
            ← Zpátky na web
          </Link>
        </p>
      </div>
    </div>
  );
}
