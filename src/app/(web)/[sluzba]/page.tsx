import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StrankaSluzby } from "@/komponenty/stranka-sluzby";
import { nactiSluzby, nactiVice } from "@/lib/obsah";
import { metadataProStranku } from "@/lib/obsah/seo";
import { textNeboNic } from "@/lib/obsah/cteni";
import { viditelneStranky } from "@/lib/sluzby";

/**
 * Stránka služby — jedna pro všechny služby, i ty, které si klientka
 * přidá v administraci.
 *
 * Adresy jsou krátké (`/podologie`), stejně jako dřív, aby nepřestaly platit
 * odkazy z Googlu. Pevné stránky (`/cenik`, `/o-mne`…) mají vlastní složky
 * a Next je obslouží dřív než tuhle, takže je služba nepřekryje. Adresy,
 * které by s nimi kolidovaly, administrace ani nedovolí založit.
 *
 * Skrytá nebo neexistující služba vrátí 404.
 */
export const revalidate = 60;

async function najdi(slug: string) {
  const sluzby = await nactiSluzby();
  const sluzba = sluzby.find((s) => s.slug === slug && s.zobrazit);
  return { sluzba, sluzby };
}

export async function generateMetadata({
  params,
}: PageProps<"/[sluzba]">): Promise<Metadata> {
  const { sluzba: slug } = await params;
  const { sluzba } = await najdi(slug);
  if (!sluzba) return {};

  const o = await nactiVice([sluzba.klic]);
  return metadataProStranku(`/${sluzba.slug}`, {
    titulek: textNeboNic(o[sluzba.klic], "seo_titulek"),
    popis: textNeboNic(o[sluzba.klic], "seo_popis"),
    nahradniTitulek: `${sluzba.nazev} České Budějovice — Michaela Kokešová`,
  });
}

export default async function Stranka({ params }: PageProps<"/[sluzba]">) {
  const { sluzba: slug } = await params;
  const { sluzba, sluzby } = await najdi(slug);
  if (!sluzba) notFound();

  const o = await nactiVice([sluzba.klic, "kontakt"]);

  return (
    <StrankaSluzby
      obsah={o[sluzba.klic]}
      telefon={textNeboNic(o.kontakt, "telefon")}
      aktualni={`/${sluzba.slug}`}
      sluzby={viditelneStranky(sluzby)}
    />
  );
}
