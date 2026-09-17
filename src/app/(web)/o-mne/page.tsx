import type { Metadata } from "next";
import { Sekce } from "@/komponenty/sekce";
import { Tlacitko } from "@/komponenty/tlacitko";
import { ObrazoveMisto } from "@/komponenty/obrazove-misto";
import { Galerie } from "@/komponenty/galerie";
import { PrazdnyStav } from "@/komponenty/karty";
import { nactiVice } from "@/lib/obsah";
import { metadataProStranku } from "@/lib/obsah/seo";
import {
  fotka,
  fotkyZeSeznamu,
  prepinac,
  seznam,
  text,
  textNeboNic,
} from "@/lib/obsah/cteni";
import { telHref, telText } from "@/lib/kontakt";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return metadataProStranku("/o-mne");
}

export default async function OMne() {
  const o = await nactiVice(["o-mne", "kontakt"]);
  const telefon = textNeboNic(o.kontakt, "telefon");

  const portret = fotka(o["o-mne"], "portret");
  const text_ = textNeboNic(o["o-mne"], "text");

  const vzdelani = seznam(o["o-mne"], "vzdelani")
    .map((v) => ({
      rok: text(v, "rok"),
      nazev: text(v, "nazev"),
      poradatel: text(v, "poradatel"),
    }))
    .filter((v) => v.nazev);

  // Galerie se ukáže, jen když je zapnutá a jsou v ní fotky.
  const galerie = prepinac(o["o-mne"], "galerie_zobrazit")
    ? fotkyZeSeznamu(seznam(o["o-mne"], "galerie"))
    : [];

  return (
    <>
      <section className="bg-povrch pt-8 pb-9 lg:pt-13 lg:pb-16">
        <div
          className={`obal ${
            portret ? "grid items-start gap-10 lg:grid-cols-[1fr_auto]" : ""
          }`}
        >
          <div>
            <h1 className="text-h1 lg:text-h1-pc max-w-[16ch]">
              {text(o["o-mne"], "nadpis")}
            </h1>
            {text_ ? (
              <div className="text-telo lg:text-telo-pc mt-6 max-w-[65ch] space-y-4">
                {text_.split(/\n{2,}/).map((odstavec, i) => (
                  <p key={i}>{odstavec}</p>
                ))}
              </div>
            ) : null}
            {telefon ? (
              <div className="mt-8">
                <Tlacitko
                  varianta="primarni"
                  href={telHref(telefon)}
                  akce="telefon-o-mne"
                >
                  Zavolat {telText(telefon)}
                </Tlacitko>
              </div>
            ) : null}
          </div>

          {portret ? (
            <div className="w-full lg:w-[420px]">
              <ObrazoveMisto
                varianta="portret"
                src={portret}
                alt={text(o["o-mne"], "portret_popis")}
                priorita
              />
            </div>
          ) : null}
        </div>
      </section>

      <Sekce plocha nadpis="Vzdělání a kurzy">
        {vzdelani.length === 0 ? (
          <PrazdnyStav>Seznam kurzů sem teprve doplním.</PrazdnyStav>
        ) : (
          <ul className="bg-povrch rounded-dlazdice list-none p-7 lg:p-10">
            {vzdelani.map((v) => (
              <li
                key={`${v.rok}-${v.nazev}`}
                className="border-linka flex flex-col gap-1 border-t py-5 first:border-t-0 first:pt-0 sm:flex-row sm:gap-6"
              >
                <span className="text-odkaz lg:text-odkaz-pc shrink-0 sm:w-24">
                  {v.rok}
                </span>
                <span>
                  <span className="text-telo lg:text-telo-pc block font-bold">
                    {v.nazev}
                  </span>
                  {v.poradatel ? (
                    <span className="text-telo text-text-doplnek block">
                      {v.poradatel}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Sekce>

      {galerie.length > 0 ? (
        <Sekce nadpis="Fotky">
          <Galerie fotky={galerie} />
        </Sekce>
      ) : null}
    </>
  );
}
