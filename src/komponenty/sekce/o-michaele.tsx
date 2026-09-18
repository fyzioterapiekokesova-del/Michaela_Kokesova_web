import { Tlacitko } from "@/komponenty/tlacitko";
import { ObrazoveMisto } from "@/komponenty/obrazove-misto";
import { fotka, text, textNeboNic, vyrez } from "@/lib/obsah/cteni";
import type { Obsah } from "@/lib/obsah/vychozi";

/**
 * Blok o Michaele na úvodní stránce. Vlevo jméno, věta o přístupu a tlačítko,
 * vpravo portrét. Bez portrétu se blok vykreslí jen jako text — nevzniká
 * prázdné místo.
 */
export function OMichaele({ obsah }: { obsah: Obsah }) {
  const portret = fotka(obsah, "portret");
  const claim = textNeboNic(obsah, "claim");

  return (
    <section className="bg-plocha border-azurova sekce border-t-[3px]">
      <div
        className={`obal ${
          portret ? "grid items-center gap-10 lg:grid-cols-[1fr_auto]" : ""
        }`}
      >
        <div>
          {claim ? <h2 className="text-h2 lg:text-h2-pc max-w-[18ch]">{claim}</h2> : null}
          <p className="text-perex lg:text-perex-pc text-text-doplnek mt-4">
            {text(obsah, "jmeno")}
          </p>
          <div className="mt-7">
            <Tlacitko varianta="sekundarni" href="/o-mne" akce="o-mne-uvod">
              {text(obsah, "tlacitko") || "Více o mně"}
            </Tlacitko>
          </div>
        </div>

        {portret ? (
          <div className="w-full lg:w-[420px]">
            <ObrazoveMisto
              varianta="portret"
              src={portret}
              alt={text(obsah, "portret_popis")}
              {...vyrez(obsah, "portret")}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
