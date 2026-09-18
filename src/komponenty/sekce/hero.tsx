import { Tlacitko } from "@/komponenty/tlacitko";
import { ObrazoveMisto } from "@/komponenty/obrazove-misto";
import { Poznamka } from "@/komponenty/karty";
import { telHref, telText } from "@/lib/kontakt";
import { fotka, text, textNeboNic, vyrez } from "@/lib/obsah/cteni";
import type { Obsah } from "@/lib/obsah/vychozi";

/**
 * Úvodní blok. Jediný `H1` na stránce.
 *
 * Rozvržení se přepíná v administraci. Dokud fotka není, jede jeden sloupec —
 * dvousloupcové rozvržení bez fotky by nechalo vpravo prázdné místo.
 */
export function Hero({ obsah, telefon }: { obsah: Obsah; telefon?: string }) {
  const obrazek = fotka(obsah, "fotka");
  const dvaSloupce = text(obsah, "rozvrzeni") === "dva-sloupce" && Boolean(obrazek);
  // Logo a kresby se zobrazují celé, bez zaoblení a bez podkladu — jinak
  // je kolem nich vidět rámeček. Fotky se ořezávají do plochy.
  const cele = text(obsah, "vyplneni") === "cele";

  const stitek = textNeboNic(obsah, "stitek");
  const perex = textNeboNic(obsah, "perex");
  const poznamka = textNeboNic(obsah, "poznamka");
  const tlacitko1 = text(obsah, "tlacitko_1") || "Zavolat";
  const tlacitko2 = textNeboNic(obsah, "tlacitko_2");

  return (
    <section className="bg-povrch pt-8 pb-9 lg:pt-13 lg:pb-21">
      <div
        className={`obal ${
          dvaSloupce ? "grid items-center gap-10 lg:grid-cols-[1fr_auto]" : ""
        }`}
      >
        <div className={dvaSloupce ? "" : "max-w-[26ch] lg:max-w-none"}>
          {stitek ? (
            <p className="text-stitek lg:text-stitek-pc text-text-doplnek uppercase">
              {stitek}
            </p>
          ) : null}

          <h1 className="text-h1 lg:text-h1-pc mt-3 max-w-[16ch]">
            {text(obsah, "nadpis")}
          </h1>

          {perex ? (
            <p className="text-perex lg:text-perex-pc text-text-doplnek mt-5 max-w-[58ch]">
              {perex}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            {telefon ? (
              <Tlacitko
                varianta="primarni"
                href={telHref(telefon)}
                akce="telefon-hero"
              >
                {tlacitko1} {telText(telefon)}
              </Tlacitko>
            ) : null}
            {tlacitko2 ? (
              <Tlacitko varianta="sekundarni" href="/#kontakt" akce="zprava-hero">
                {tlacitko2}
              </Tlacitko>
            ) : null}
          </div>

          {poznamka ? (
            <div className="mt-8 max-w-[52ch]">
              <Poznamka>{poznamka}</Poznamka>
            </div>
          ) : null}
        </div>

        {dvaSloupce ? (
          <div className={cele ? "w-full lg:w-[440px]" : "w-full lg:w-[380px]"}>
            <ObrazoveMisto
              varianta="hero"
              vyplneni={cele ? "cele" : "orez"}
              src={obrazek}
              alt={text(obsah, "fotka_popis")}
              {...vyrez(obsah, "fotka")}
              priorita
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
