"use server";

import { revalidatePath } from "next/cache";
import { overAdmina } from "@/lib/admin/autorizace";
import { najdiSekci } from "@/lib/admin/obsah-schema";
import { zvalidujASluc, type Chyba } from "@/lib/admin/slucovani";
import { VYCHOZI_OBSAH } from "@/lib/obsah/vychozi";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Uložení jedné sekce obsahu.
 *
 * Každá sekce má vlastní tlačítko Uložit, takže se ukládá vždycky jen ta
 * jedna. Zapíšou se **jen pole, která zná schéma** — cokoli navíc se zahodí
 * a chybějící klíč znamená „nesahat", ne „vymazat". Díky tomu uložení textů
 * nikdy nepřepíše cesty k nahraným fotkám.
 *
 * Autorizace je tady, na serveru, a ne jen ve skrytém tlačítku. Druhá vrstva
 * je RLS v databázi: zápis do `site_content` policy pustí jen administrátorovi.
 */

export type StavUlozeni =
  | { stav: "prazdno" }
  | { stav: "ulozeno"; kdy: number }
  | { stav: "chyba"; zprava?: string; chyby?: Chyba[] };

export async function ulozSekci(
  klic: string,
  dataJson: string,
): Promise<StavUlozeni> {
  const opravneni = await overAdmina();
  if (opravneni.stav === "chyba") {
    return { stav: "chyba", zprava: opravneni.zprava };
  }

  const sekce = najdiSekci(klic);
  if (!sekce) {
    return { stav: "chyba", zprava: "Takovou sekci web nemá." };
  }

  let nove: unknown;
  try {
    nove = JSON.parse(dataJson);
  } catch {
    return { stav: "chyba", zprava: "Data se nepodařilo přečíst. Zkuste to znovu." };
  }

  const supabase = await supabaseServer();

  // Původní hodnota z databáze. Když řádek ještě neexistuje, bere se výchozí
  // obsah ze souboru — jinak by první uložení vymazalo, co web zatím ukazuje.
  const { data: radek, error: chybaCteni } = await supabase
    .from("site_content")
    .select("value")
    .eq("key", klic)
    .maybeSingle();

  if (chybaCteni) {
    console.error(`Sekci „${klic}" se nepodařilo načíst před uložením.`, chybaCteni);
    return {
      stav: "chyba",
      zprava: "Obsah se nepodařilo načíst. Zkuste to prosím za chvíli.",
    };
  }

  const puvodni = radek?.value ?? VYCHOZI_OBSAH[klic] ?? {};
  const vysledek = zvalidujASluc(sekce, nove, puvodni);

  if (vysledek.stav === "chyba") {
    return { stav: "chyba", chyby: vysledek.chyby };
  }

  const { error: chybaZapisu } = await supabase
    .from("site_content")
    .upsert({ key: klic, value: vysledek.hodnota }, { onConflict: "key" });

  if (chybaZapisu) {
    console.error(`Sekci „${klic}" se nepodařilo uložit.`, chybaZapisu);
    return {
      stav: "chyba",
      zprava: "Uložení se nepovedlo. Zkuste to prosím znovu.",
    };
  }

  // Stránky, kterých se sekce týká, se musí přegenerovat — jinak by změna
  // byla vidět až po vypršení revalidace.
  for (const adresa of sekce.obnovit) revalidatePath(adresa);
  revalidatePath("/admin", "layout");

  return { stav: "ulozeno", kdy: Date.now() };
}
