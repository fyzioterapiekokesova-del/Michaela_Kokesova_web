import type { Metadata } from "next";
import { Sekce } from "@/komponenty/sekce";
import { Tlacitko } from "@/komponenty/tlacitko";
import { KartaOtazky, PrazdnyStav } from "@/komponenty/karty";
import { nactiVice } from "@/lib/obsah";
import { metadataProStranku } from "@/lib/obsah/seo";
import { seznam, text, textNeboNic } from "@/lib/obsah/cteni";
import { telHref, telText } from "@/lib/kontakt";
import { StrukturovanaData } from "@/komponenty/strukturovana-data";
import { faqJsonLd } from "@/lib/obsah/schema-org";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return metadataProStranku("/caste-dotazy");
}

export default async function CasteDotazy() {
  const o = await nactiVice(["faq", "kontakt"]);
  const telefon = textNeboNic(o.kontakt, "telefon");

  // Pořadí otázek je pořadí v seznamu — mění se šipkami v administraci.
  const otazky = seznam(o.faq, "otazky")
    .map((z) => ({ otazka: text(z, "otazka"), odpoved: text(z, "odpoved") }))
    .filter((z) => z.otazka && z.odpoved);

  const perex = textNeboNic(o.faq, "perex");
  const jsonLd = faqJsonLd(o.faq);

  return (
    <>
      {/* Otázky a odpovědi pro vyhledávače. Google je umí ukázat rovnou
          ve výsledku a AI asistenti si přesně takové úseky berou. */}
      {jsonLd ? <StrukturovanaData data={jsonLd} /> : null}

      <section className="bg-povrch pt-8 pb-9 lg:pt-13 lg:pb-16">
        <div className="obal">
          <h1 className="text-h1 lg:text-h1-pc max-w-[16ch]">
            {text(o.faq, "nadpis") || "Časté dotazy"}
          </h1>
          {perex ? (
            <p className="text-perex lg:text-perex-pc text-text-doplnek mt-5 max-w-[62ch]">
              {perex}
            </p>
          ) : null}
        </div>
      </section>

      <Sekce plocha>
        {otazky.length === 0 ? (
          <PrazdnyStav>
            Otázky sem teprve doplním. Když vás něco zajímá, zavolejte mi.
          </PrazdnyStav>
        ) : (
          <div className="grid gap-4">
            {otazky.map((z) => (
              <KartaOtazky key={z.otazka} otazka={z.otazka} odpoved={z.odpoved} />
            ))}
          </div>
        )}
      </Sekce>

      {telefon ? (
        <Sekce
          nadpis="Nenašli jste odpověď?"
          perex="Zavolejte mi. Ráda vám všechno vysvětlím po telefonu."
        >
          <Tlacitko varianta="primarni" href={telHref(telefon)} akce="telefon-faq">
            Zavolat {telText(telefon)}
          </Tlacitko>
        </Sekce>
      ) : null}
    </>
  );
}
