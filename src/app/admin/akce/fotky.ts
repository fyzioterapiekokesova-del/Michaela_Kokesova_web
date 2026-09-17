"use server";

import { overAdmina } from "@/lib/admin/autorizace";
import { najdiSekci } from "@/lib/admin/obsah-schema";
import { MAX_BAJTU, novaCesta, poznejFormat } from "@/lib/admin/obrazky";
import { KOS_FOTKY } from "@/lib/supabase/nastaveni";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Nahrání fotky.
 *
 * Všechny tři kontroly jsou **na serveru**: povolený typ podle obsahu
 * souboru, velikost a jméno, které si server vymyslí sám. Čtvrtou vrstvou
 * je koš v Supabase — má vlastní limit velikosti, seznam povolených typů
 * a policy, která zápis pustí jen administrátorovi.
 *
 * Nahrává se pod přihlášeným uživatelem, ne pod servisním klíčem. Kdyby se
 * použil servisní, obešla by se RLS a zbyla by jediná vrstva ochrany.
 */

export type StavNahrani =
  | { stav: "ok"; cesta: string }
  | { stav: "chyba"; zprava: string };

export async function nahrajFotku(formular: FormData): Promise<StavNahrani> {
  const opravneni = await overAdmina();
  if (opravneni.stav === "chyba") {
    return { stav: "chyba", zprava: opravneni.zprava };
  }

  const klic = String(formular.get("klic") ?? "");
  if (!najdiSekci(klic)) {
    return { stav: "chyba", zprava: "Takovou sekci web nemá." };
  }

  const soubor = formular.get("soubor");
  if (!(soubor instanceof File) || soubor.size === 0) {
    return { stav: "chyba", zprava: "Vyberte prosím soubor s fotkou." };
  }

  if (soubor.size > MAX_BAJTU) {
    const mb = (soubor.size / 1024 / 1024).toFixed(1);
    return {
      stav: "chyba",
      zprava: `Fotka má ${mb} MB, víc než 5 MB nahrát nejde. Zmenšete ji prosím.`,
    };
  }

  const bajty = new Uint8Array(await soubor.arrayBuffer());
  const format = poznejFormat(bajty);
  if (!format) {
    return {
      stav: "chyba",
      zprava: "Nahrát jde jen fotka ve formátu JPG, PNG nebo WEBP.",
    };
  }

  const cesta = novaCesta(klic, format.pripona);
  const supabase = await supabaseServer();

  const { error } = await supabase.storage.from(KOS_FOTKY).upload(cesta, bajty, {
    contentType: format.mime,
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    console.error("Fotku se nepodařilo nahrát.", error);
    return {
      stav: "chyba",
      zprava: "Fotku se nepodařilo nahrát. Zkuste to prosím znovu.",
    };
  }

  return { stav: "ok", cesta };
}
