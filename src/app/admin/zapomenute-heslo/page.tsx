import Link from "next/link";
import { posliOdkazNaHeslo } from "@/app/admin/akce/prihlaseni";
import { FormularPrihlaseni } from "@/komponenty/admin/formular-prihlaseni";

/**
 * Zapomenuté heslo.
 *
 * Heslo se e-mailem nikdy neposílá. Odejde jen odkaz s krátkou platností,
 * po kterém si člověk nastaví nové heslo sám.
 */
export const dynamic = "force-dynamic";

export default function ZapomenuteHeslo() {
  return (
    <div className="obal flex flex-1 items-center justify-center py-12">
      <div className="bg-povrch border-linka rounded-karta w-full max-w-[30rem] border p-6 lg:p-8">
        <h1 className="text-h3 lg:text-h3-pc">Zapomenuté heslo</h1>
        <p className="text-text-doplnek mt-3 text-[1.0625rem]">
          Napište svůj e-mail a přijde na něj odkaz, kterým si nastavíte nové
          heslo. Odkaz platí jen krátce, tak ho použijte hned.
        </p>

        <div className="mt-8">
          <FormularPrihlaseni
            akce={posliOdkazNaHeslo}
            sHeslem={false}
            popisTlacitka="Poslat odkaz"
          />
        </div>

        <p className="border-linka mt-6 border-t pt-6">
          <Link href="/admin/prihlaseni" className="klik underline">
            ← Zpátky na přihlášení
          </Link>
        </p>
      </div>
    </div>
  );
}
