import type { Metadata } from "next";
import Link from "next/link";
import { Sekce } from "@/komponenty/sekce";
import { Hero } from "@/komponenty/sekce/hero";
import { OMichaele } from "@/komponenty/sekce/o-michaele";
import { SekceKontakt } from "@/komponenty/sekce/kontakt";
import { CoVasTrapi } from "@/komponenty/radkovy-odkaz";
import { Kroky } from "@/komponenty/kroky";
import { KartyVeku } from "@/komponenty/karty";
import { Galerie } from "@/komponenty/galerie";
import { Sipka } from "@/komponenty/sipka";
import { FormularKontakt } from "@/komponenty/formular-kontakt";
import { Mapa } from "@/komponenty/mapa";
import { StrukturovanaData } from "@/komponenty/strukturovana-data";
import { ordinaceJsonLd } from "@/lib/obsah/schema-org";
import { nactiVice } from "@/lib/obsah";
import { metadataProStranku } from "@/lib/obsah/seo";
import {
  fotkyZeSeznamu,
  prepinac,
  seznam,
  text,
  textNeboNic,
} from "@/lib/obsah/cteni";

/**
 * Úvodní stránka.
 *
 * Obsah se čte při požadavku s krátkou revalidací — Supabase na free tarifu
 * projekt po týdnu nízké aktivity uspí a stránka postavená při buildu by
 * zamrzla na starém obsahu.
 */
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return metadataProStranku("/");
}

export default async function Uvod() {
  const o = await nactiVice([
    "hero",
    "potize",
    "postup",
    "vek",
    "o-mne-uvod",
    "ordinace",
    "kontakt",
    "seo",
  ]);

  const telefon = textNeboNic(o.kontakt, "telefon");
  const potize = seznam(o.potize, "polozky")
    .map((p) => ({ text: text(p, "text"), href: text(p, "href") }))
    .filter((p) => p.text && p.href);

  const kroky = seznam(o.postup, "kroky")
    .map((k) => ({ nadpis: text(k, "nadpis"), text: text(k, "text") }))
    .filter((k) => k.nadpis);

  const vek = seznam(o.vek, "karty")
    .map((k) => ({ nadpis: text(k, "nadpis"), text: text(k, "text") }))
    .filter((k) => k.nadpis);

  // Sekce Ordinace se ukáže, jen když je zapnutá **a** jsou v ní fotky.
  const fotkyOrdinace = prepinac(o.ordinace, "zobrazit")
    ? fotkyZeSeznamu(seznam(o.ordinace, "fotky"))
    : [];

  return (
    <>
      {/* Popis ordinace pro vyhledávače — adresa a otevírací doba se doplní
          samy, jakmile je klientka vyplní v administraci. */}
      <StrukturovanaData data={ordinaceJsonLd(o.kontakt, o.seo)} />

      <Hero obsah={o.hero} telefon={telefon} />

      <Sekce
        plocha
        nadpis="Co vás trápí"
        perex="Vyberte, co vás k fyzioterapeutovi přivádí. Ukážu vám, čím se to dá řešit."
      >
        <CoVasTrapi
          polozky={potize}
          telefon={telefon}
          textTelefonu={text(o.potize, "telefon_text") || "Nevím — radši zavolám"}
        />
      </Sekce>

      <Sekce nadpis="Jak to u mě probíhá">
        <Kroky polozky={kroky} />
      </Sekce>

      <Sekce plocha nadpis="Pomůžu každému věku">
        <KartyVeku polozky={vek} pozadiPlocha />
        <p className="mt-8">
          <Link
            href="/caste-dotazy"
            className="klik text-odkaz lg:text-odkaz-pc inline-flex items-center gap-3 underline"
          >
            Časté dotazy před první návštěvou
            <Sipka />
          </Link>
        </p>
      </Sekce>

      <OMichaele obsah={o["o-mne-uvod"]} />

      {fotkyOrdinace.length > 0 ? (
        <Sekce nadpis={text(o.ordinace, "nadpis") || "Ordinace"}>
          <Galerie fotky={fotkyOrdinace} />
        </Sekce>
      ) : null}

      <SekceKontakt
        obsah={o.kontakt}
        formular={<FormularKontakt />}
        mapa={
          <Mapa
            lat={textNeboNic(o.kontakt, "mapa_lat")}
            lon={textNeboNic(o.kontakt, "mapa_lon")}
            adresa={textNeboNic(o.kontakt, "adresa")}
          />
        }
      />
    </>
  );
}
