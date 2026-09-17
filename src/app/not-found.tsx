import type { Metadata } from "next";
import Link from "next/link";
import { RamWebu } from "@/komponenty/ram-webu";
import { Tlacitko } from "@/komponenty/tlacitko";
import { Sipka } from "@/komponenty/sipka";
import { SLUZBY } from "@/lib/navigace";
import { nactiObsah } from "@/lib/obsah";
import { textNeboNic } from "@/lib/obsah/cteni";
import { telHref, telText } from "@/lib/kontakt";

/**
 * Stránka 404. Vypadá jako součást webu a nabídne cestu dál — člověk,
 * který se sem dostal, obvykle něco hledá a nemá se kde odrazit.
 *
 * Musí ležet přímo v `app/`, ne ve skupině `(web)`. Ve skupině by zachytila
 * jen `notFound()` z jejích vlastních stránek, ale neznámou adresu ne —
 * ta by spadla na vestavěnou chybovou stránku Nextu. Rám webu si proto
 * vykresluje sama.
 */
export const metadata: Metadata = {
  title: "Stránka nenalezena — Michaela Kokešová",
  robots: { index: false, follow: false },
};

const ODKAZ =
  "klik text-odkaz lg:text-odkaz-pc border-linka w-full justify-between gap-4 border-b";

export default async function Nenalezeno() {
  const kontakt = await nactiObsah("kontakt");
  const telefon = textNeboNic(kontakt, "telefon");

  return (
    <RamWebu>
      <section className="bg-povrch sekce">
        <div className="obal max-w-[62ch]">
          <h1 className="text-h1 lg:text-h1-pc">Tuhle stránku tu nemám</h1>
          <p className="text-perex lg:text-perex-pc text-text-doplnek mt-5">
            Nejspíš se změnila adresa, nebo se do odkazu vloudil překlep.
            Zkuste to odsud.
          </p>

          <ul className="mt-8 list-none">
            {SLUZBY.map((sluzba) => (
              <li key={sluzba.href}>
                <Link href={sluzba.href} className={ODKAZ}>
                  {sluzba.nazev}
                  <Sipka />
                </Link>
              </li>
            ))}
            <li>
              <Link href="/cenik" className={ODKAZ}>
                Ceník
                <Sipka />
              </Link>
            </li>
            <li>
              <Link href="/caste-dotazy" className={ODKAZ}>
                Časté dotazy
                <Sipka />
              </Link>
            </li>
          </ul>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            {telefon ? (
              <Tlacitko
                varianta="primarni"
                href={telHref(telefon)}
                akce="telefon-404"
              >
                Zavolat {telText(telefon)}
              </Tlacitko>
            ) : null}
            <Tlacitko varianta="sekundarni" href="/">
              Zpátky na úvod
            </Tlacitko>
          </div>
        </div>
      </section>
    </RamWebu>
  );
}
