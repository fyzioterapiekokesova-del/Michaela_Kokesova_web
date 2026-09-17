import type { Metadata } from "next";
import { StrankaSluzby } from "@/komponenty/stranka-sluzby";
import { nactiVice } from "@/lib/obsah";
import { metadataProStranku } from "@/lib/obsah/seo";
import { textNeboNic } from "@/lib/obsah/cteni";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return metadataProStranku("/podologie");
}

export default async function Stranka() {
  const o = await nactiVice(["sluzba-podologie", "kontakt"]);

  return (
    <StrankaSluzby
      obsah={o["sluzba-podologie"]}
      telefon={textNeboNic(o.kontakt, "telefon")}
      aktualni="/podologie"
    />
  );
}
