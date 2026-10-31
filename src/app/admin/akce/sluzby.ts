"use server";

import { revalidatePath } from "next/cache";
import { overAdmina } from "@/lib/admin/autorizace";
import { VYCHOZI_OBSAH } from "@/lib/obsah/vychozi";
import {
  MAX_SLUZEB,
  chybaAdresy,
  prectiSluzby,
  zapisSluzby,
  type Sluzba,
} from "@/lib/sluzby";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Správa seznamu služeb — přidání, pořadí, názvy, skrytí, smazání.
 *
 * Seznam je jeden záznam `sluzby` v `site_content`; obsah každé služby má
 * vlastní záznam a ten se upravuje běžným formulářem sekce.
 *
 * Adresa služby se nastaví při založení a pak už se nemění — vedou na ni
 * odkazy z Googlu a ze sekce „Co vás trápí".
 *
 * Autorizace je tady, na serveru. Druhá vrstva je RLS: zápis do
 * `site_content` pustí jen administrátora.
 */

export type StavSluzeb =
  | { stav: "prazdno" }
  | { stav: "ulozeno" }
  | { stav: "pridano"; klic: string }
  | { stav: "chyba"; zprava: string; pole?: "nazev" | "slug" };

const MAX_NAZEV = 60;
const MAX_POPIS = 80;

type Supabase = Awaited<ReturnType<typeof supabaseServer>>;

async function nactiSeznam(supabase: Supabase): Promise<Sluzba[] | null> {
  const { data, error } = await supabase
    .from("site_content")
    .select("value")
    .eq("key", "sluzby")
    .maybeSingle();
  if (error) {
    console.error("Seznam služeb se nepodařilo načíst.", error);
    return null;
  }
  return prectiSluzby(data?.value ?? VYCHOZI_OBSAH.sluzby);
}

async function zapisSeznam(supabase: Supabase, sluzby: readonly Sluzba[]) {
  return supabase
    .from("site_content")
    .upsert({ key: "sluzby", value: zapisSluzby(sluzby) }, { onConflict: "key" });
}

function text(x: unknown): string {
  return typeof x === "string" ? x.trim() : "";
}

export async function pridejSluzbu(
  nazevVstup: string,
  slugVstup: string,
): Promise<StavSluzeb> {
  const opravneni = await overAdmina();
  if (opravneni.stav === "chyba") return { stav: "chyba", zprava: opravneni.zprava };

  const nazev = text(nazevVstup);
  const slug = text(slugVstup);
  if (!nazev) return { stav: "chyba", pole: "nazev", zprava: "Napište název služby." };
  if (nazev.length > MAX_NAZEV) {
    return { stav: "chyba", pole: "nazev", zprava: `Název může mít nejvýš ${MAX_NAZEV} znaků.` };
  }

  const supabase = await supabaseServer();
  const sluzby = await nactiSeznam(supabase);
  if (!sluzby) {
    return { stav: "chyba", zprava: "Seznam služeb se nepodařilo načíst. Zkuste to za chvíli." };
  }
  if (sluzby.length >= MAX_SLUZEB) {
    return {
      stav: "chyba",
      zprava: `Služeb může být nejvýš ${MAX_SLUZEB}, víc se jich do menu nevejde.`,
    };
  }
  const chyba = chybaAdresy(slug, sluzby);
  if (chyba) return { stav: "chyba", pole: "slug", zprava: chyba };

  const klic = `sluzba-${slug}`;

  // Obsah stránky. Když záznam s tímhle klíčem už je (služba se stejnou
  // adresou kdysi existovala a byla smazaná), nechá se, jak je.
  const { error: chybaObsahu } = await supabase
    .from("site_content")
    .upsert(
      { key: klic, value: { nadpis: nazev, perex: "", casti: [] } },
      { onConflict: "key", ignoreDuplicates: true },
    );
  if (chybaObsahu) {
    console.error(`Obsah nové služby „${klic}" se nepodařilo založit.`, chybaObsahu);
    return { stav: "chyba", zprava: "Službu se nepodařilo založit. Zkuste to znovu." };
  }

  // Nová služba je skrytá, dokud ji klientka nedoplní a sama nezapne.
  // Jinak by v menu hned visela prázdná stránka.
  const nova: Sluzba = {
    id: globalThis.crypto.randomUUID(),
    slug,
    nazev,
    popis: "",
    klic,
    zobrazit: false,
  };
  const { error } = await zapisSeznam(supabase, [...sluzby, nova]);
  if (error) {
    console.error("Seznam služeb se nepodařilo uložit.", error);
    return { stav: "chyba", zprava: "Službu se nepodařilo založit. Zkuste to znovu." };
  }

  revalidatePath("/", "layout");
  return { stav: "pridano", klic };
}

/**
 * Uloží pořadí, názvy, popisy a viditelnost. Položka, která v seznamu
 * chybí, se smaže — ale jen když byla skrytá. Viditelnou službu je potřeba
 * nejdřív skrýt; smazání jedním kliknutím by mohlo shodit stránku z webu.
 */
export async function ulozSeznamSluzeb(dataJson: string): Promise<StavSluzeb> {
  const opravneni = await overAdmina();
  if (opravneni.stav === "chyba") return { stav: "chyba", zprava: opravneni.zprava };

  let vstup: unknown;
  try {
    vstup = JSON.parse(dataJson);
  } catch {
    return { stav: "chyba", zprava: "Data se nepodařilo přečíst. Zkuste to znovu." };
  }
  if (!Array.isArray(vstup)) {
    return { stav: "chyba", zprava: "Data se nepodařilo přečíst. Zkuste to znovu." };
  }

  const supabase = await supabaseServer();
  const puvodni = await nactiSeznam(supabase);
  if (!puvodni) {
    return { stav: "chyba", zprava: "Seznam služeb se nepodařilo načíst. Zkuste to za chvíli." };
  }
  const podleId = new Map(puvodni.map((s) => [s.id, s]));

  const nove: Sluzba[] = [];
  const videne = new Set<string>();
  for (const polozka of vstup) {
    if (typeof polozka !== "object" || polozka === null) continue;
    const p = polozka as Record<string, unknown>;
    const stara = podleId.get(text(p.id));
    // Neznámá položka — přidávat se dá jen přes `pridejSluzbu`.
    if (!stara || videne.has(stara.id)) continue;
    videne.add(stara.id);

    const nazev = text(p.nazev);
    const popis = text(p.popis);
    if (!nazev) return { stav: "chyba", zprava: "Každá služba musí mít název." };
    if (nazev.length > MAX_NAZEV) {
      return { stav: "chyba", zprava: `Název „${nazev}“ je delší než ${MAX_NAZEV} znaků.` };
    }
    if (popis.length > MAX_POPIS) {
      return {
        stav: "chyba",
        zprava: `Popis u „${nazev}“ je delší než ${MAX_POPIS} znaků.`,
      };
    }

    // Adresa a klíč obsahu se berou z uloženého seznamu, ne z formuláře.
    nove.push({ ...stara, nazev, popis, zobrazit: p.zobrazit === true });
  }

  const smazane = puvodni.filter((s) => !videne.has(s.id));
  const viditelnaSmazana = smazane.find((s) => s.zobrazit);
  if (viditelnaSmazana) {
    return {
      stav: "chyba",
      zprava: `Službu „${viditelnaSmazana.nazev}“ nejdřív skryjte, teprve pak jde smazat.`,
    };
  }

  const { error } = await zapisSeznam(supabase, nove);
  if (error) {
    console.error("Seznam služeb se nepodařilo uložit.", error);
    return { stav: "chyba", zprava: "Uložení se nepovedlo. Zkuste to prosím znovu." };
  }

  revalidatePath("/", "layout");
  return { stav: "ulozeno" };
}
