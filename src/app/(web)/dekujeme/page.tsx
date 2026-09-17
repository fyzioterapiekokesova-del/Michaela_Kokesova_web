import type { Metadata } from "next";
import { Tlacitko } from "@/komponenty/tlacitko";
import { nactiObsah } from "@/lib/obsah";
import { textNeboNic } from "@/lib/obsah/cteni";
import { telHref, telText } from "@/lib/kontakt";

/**
 * Stránka po odeslání formuláře.
 *
 * Existuje kvůli měření — dojít sem znamená, že zpráva opravdu odešla.
 * Do vyhledávače nepatří, proto `noindex`.
 */
export const metadata: Metadata = {
  title: "Zpráva odeslána — Michaela Kokešová",
  robots: { index: false, follow: false },
};

export const revalidate = 60;

export default async function Dekujeme() {
  const kontakt = await nactiObsah("kontakt");
  const telefon = textNeboNic(kontakt, "telefon");

  return (
    <section className="bg-povrch sekce">
      <div className="obal max-w-[62ch]">
        <h1 className="text-h1 lg:text-h1-pc">Zpráva odešla</h1>
        <p className="text-perex lg:text-perex-pc text-text-doplnek mt-5">
          Děkuju. Ozvu se vám, jakmile to půjde. Na potvrzení jsem vám poslala
          e-mail — kdyby nedorazil, mrkněte prosím i do nevyžádané pošty.
        </p>
        <p className="text-telo lg:text-telo-pc mt-5">
          Spěchá to? Zavolejte mi rovnou.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          {telefon ? (
            <Tlacitko
              varianta="primarni"
              href={telHref(telefon)}
              akce="telefon-dekujeme"
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
  );
}
