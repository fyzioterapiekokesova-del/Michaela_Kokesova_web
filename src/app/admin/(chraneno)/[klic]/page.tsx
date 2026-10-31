import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FormularStranky } from "@/komponenty/admin/formular-stranky";
import { adresaWebu } from "@/lib/admin/adresa-webu";
import { vyzadujAdmina } from "@/lib/admin/autorizace";
import {
  najdiSekci,
  najdiStrankuAdminu,
  sekceSluzby,
  strankaSeSekci,
} from "@/lib/admin/obsah-schema";
import { sluzbyJakoStranky } from "@/lib/admin/sekce";
import { cileOdkazu } from "@/lib/navigace";
import { nactiSluzby, nactiVice } from "@/lib/obsah";

/**
 * Stránka administrace: buď jedna ze stránek v menu (úvodní stránka,
 * ceník…), nebo stránka služby (`/admin/sluzba-podologie`).
 *
 * Staré adresy jednotlivých sekcí (`/admin/hero`) přesměrují na stránku,
 * kde sekce teď je, a dorolují na ni.
 *
 * Nic se tu necachuje — administrace musí vždycky ukazovat to, co je
 * opravdu v databázi. Kdyby se stránka servírovala z cache, viděla by
 * klientka po uložení pořád starý text a myslela by si, že se změna
 * neuložila.
 */
export const dynamic = "force-dynamic";

export default async function AdminStranka({
  params,
}: PageProps<"/admin/[klic]">) {
  // Ověření na serveru. Nepřihlášený se sem nedostane ani na prázdnou stránku.
  await vyzadujAdmina();

  const { klic } = await params;
  const sluzby = await nactiSluzby();
  const cile = cileOdkazu(sluzbyJakoStranky(sluzby));

  const stranka = najdiStrankuAdminu(klic);
  if (stranka) {
    const sekce = stranka.sekce.map((k) => najdiSekci(k)).filter((s) => s !== undefined);
    const hodnoty = await nactiVice(stranka.sekce);
    return (
      <FormularStranky
        nazev={stranka.nazev}
        popis={stranka.popis}
        sekce={sekce}
        vychozi={hodnoty}
        naWebu={adresaWebu(stranka.naWebu)}
        cile={cile}
      />
    );
  }

  const sluzba = sluzby.find((s) => s.klic === klic);
  if (sluzba) {
    const hodnoty = await nactiVice([sluzba.klic]);
    return (
      <FormularStranky
        nazev={sluzba.nazev}
        upozorneni={
          sluzba.zobrazit ? null : (
            <p className="bg-azurova-svetla mt-3 rounded-md px-3 py-2 text-[0.9375rem]">
              Služba je zatím <strong>skrytá</strong> — na webu není. Až budete mít
              texty hotové, zapněte ji v{" "}
              <Link href="/admin/sluzby" className="underline">
                seznamu služeb
              </Link>
              .
            </p>
          )
        }
        sekce={[sekceSluzby(sluzba.klic, sluzba.nazev, sluzba.slug)]}
        vychozi={hodnoty}
        naWebu={adresaWebu(`/${sluzba.slug}`)}
        cile={cile}
      />
    );
  }

  const puvodni = strankaSeSekci(klic);
  if (puvodni) redirect(`/admin/${puvodni.id}#${klic}`);

  notFound();
}
