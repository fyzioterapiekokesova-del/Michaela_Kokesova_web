import type { Metadata } from "next";
import { Sekce } from "@/komponenty/sekce";
import { Tlacitko } from "@/komponenty/tlacitko";
import { PrazdnyStav } from "@/komponenty/karty";
import { nactiVice } from "@/lib/obsah";
import { metadataProStranku } from "@/lib/obsah/seo";
import { seznam, text, textNeboNic } from "@/lib/obsah/cteni";
import { telHref, telText } from "@/lib/kontakt";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return metadataProStranku("/cenik");
}

export default async function Cenik() {
  const o = await nactiVice(["cenik", "kontakt"]);
  const telefon = textNeboNic(o.kontakt, "telefon");

  const oblasti = seznam(o.cenik, "oblasti")
    .map((oblast) => ({
      nazev: text(oblast, "nazev"),
      polozky: seznam(oblast, "polozky").filter((p) => text(p, "nazev")),
    }))
    .filter((oblast) => oblast.nazev);

  const perex = textNeboNic(o.cenik, "perex");

  return (
    <>
      <section className="bg-povrch pt-8 pb-9 lg:pt-13 lg:pb-16">
        <div className="obal">
          <h1 className="text-h1 lg:text-h1-pc max-w-[16ch]">
            {text(o.cenik, "nadpis") || "Ceník"}
          </h1>
          {perex ? (
            <p className="text-perex lg:text-perex-pc text-text-doplnek mt-5 max-w-[62ch]">
              {perex}
            </p>
          ) : null}
          {telefon ? (
            <div className="mt-8">
              <Tlacitko
                varianta="primarni"
                href={telHref(telefon)}
                akce="telefon-cenik"
              >
                Zavolat {telText(telefon)}
              </Tlacitko>
            </div>
          ) : null}
        </div>
      </section>

      <Sekce plocha>
        {oblasti.length === 0 ? (
          <PrazdnyStav>
            Ceník tu zatím není. Zavolejte mi a cenu vám ráda řeknu.
          </PrazdnyStav>
        ) : (
          <div className="grid gap-5">
            {oblasti.map((oblast) => (
              <section
                key={oblast.nazev}
                className="bg-povrch rounded-dlazdice p-7 lg:p-10"
              >
                <h2 className="text-h3 lg:text-h3-pc">{oblast.nazev}</h2>

                {oblast.polozky.length === 0 ? (
                  <p className="text-telo lg:text-telo-pc text-text-doplnek mt-4">
                    Ceny tady doplním. Zatím je řeknu po telefonu.
                  </p>
                ) : (
                  <ul className="mt-5 list-none">
                    {oblast.polozky.map((polozka) => {
                      const delka = text(polozka, "delka");
                      const cena = text(polozka, "cena");
                      const poznamka = text(polozka, "poznamka");

                      return (
                        <li
                          key={text(polozka, "nazev")}
                          className="border-linka border-t py-5 first:border-t-0 first:pt-0"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                            <p className="text-telo lg:text-telo-pc font-bold">
                              {text(polozka, "nazev")}
                            </p>
                            {cena ? (
                              <p className="text-odkaz lg:text-odkaz-pc shrink-0">
                                {cena}
                              </p>
                            ) : null}
                          </div>

                          {delka ? (
                            <p className="text-telo text-text-doplnek mt-1">
                              {delka}
                            </p>
                          ) : null}

                          {/* Řádek s poznámkou se ukáže, jen když je vyplněná. */}
                          {poznamka ? (
                            <p className="text-telo text-text-doplnek mt-2">
                              {poznamka}
                            </p>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </Sekce>
    </>
  );
}
