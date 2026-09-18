import { Sekce } from "@/komponenty/sekce";
import { Tlacitko } from "@/komponenty/tlacitko";
import { DlazdiceSluzby } from "@/komponenty/dlazdice";
import { ObrazoveMisto } from "@/komponenty/obrazove-misto";
import { PrazdnyStav } from "@/komponenty/karty";
import { SLUZBY } from "@/lib/navigace";
import { telHref, telText } from "@/lib/kontakt";
import { fotka, seznam, text, textNeboNic, vyrez } from "@/lib/obsah/cteni";
import type { Obsah } from "@/lib/obsah/vychozi";

/**
 * Společná stavba všech tří stránek služeb. Liší se jen obsahem, ne
 * rozvržením — kdyby měla každá vlastní kód, rozjely by se.
 *
 * Na konci je rozcestník na zbylé dvě služby. Rozbalovací nabídka Služeb
 * je jen v hlavičce, tohle je pro toho, kdo doroloval dolů.
 */
export function StrankaSluzby({
  obsah,
  telefon,
  aktualni,
}: {
  obsah: Obsah;
  telefon?: string;
  /** Adresa téhle služby — vyřadí ji z rozcestníku na konci. */
  aktualni: string;
}) {
  const casti = seznam(obsah, "casti").filter((c) => text(c, "nadpis"));
  const obrazek = fotka(obsah, "fotka");
  const perex = textNeboNic(obsah, "perex");
  const dalsi = SLUZBY.filter((s) => s.href !== aktualni);

  return (
    <>
      <section className="bg-povrch pt-8 pb-9 lg:pt-13 lg:pb-16">
        <div className="obal">
          <h1 className="text-h1 lg:text-h1-pc max-w-[18ch]">
            {text(obsah, "nadpis")}
          </h1>
          {perex ? (
            <p className="text-perex lg:text-perex-pc text-text-doplnek mt-5 max-w-[62ch]">
              {perex}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            {telefon ? (
              <Tlacitko
                varianta="primarni"
                href={telHref(telefon)}
                akce="telefon-sluzba"
              >
                Zavolat {telText(telefon)}
              </Tlacitko>
            ) : null}
            <Tlacitko varianta="sekundarni" href="/cenik" akce="cenik-ze-sluzby">
              Ceník
            </Tlacitko>
          </div>
        </div>
      </section>

      {obrazek ? (
        <div className="obal pb-9">
          <ObrazoveMisto
            varianta="galerie"
            src={obrazek}
            alt={text(obsah, "fotka_popis")}
            {...vyrez(obsah, "fotka")}
            priorita
          />
        </div>
      ) : null}

      <Sekce plocha nadpis="Co konkrétně dělám">
        {casti.length > 0 ? (
          <div className="grid gap-3.5 md:grid-cols-2 md:gap-5">
            {casti.map((cast) => (
              <div
                key={text(cast, "nadpis")}
                className="bg-povrch rounded-dlazdice p-7 lg:p-10"
              >
                <h2 className="text-h3 lg:text-h3-pc">{text(cast, "nadpis")}</h2>
                <p className="text-telo lg:text-telo-pc mt-3 whitespace-pre-line">
                  {text(cast, "text")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <PrazdnyStav>
            Podrobnosti sem teprve doplním. Zavolejte mi a ráda vám všechno řeknu.
          </PrazdnyStav>
        )}
      </Sekce>

      <Sekce nadpis="Co ještě dělám">
        <DlazdiceSluzby
          polozky={dalsi.map((s) => ({
            href: s.href,
            nazev: s.nazev,
            popis: s.popis ?? "",
          }))}
        />
      </Sekce>
    </>
  );
}
