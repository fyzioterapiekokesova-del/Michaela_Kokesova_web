import { jeSupabaseNastaveny } from "@/lib/supabase/nastaveni";
import { supabaseServer } from "@/lib/supabase/server";
import type { UdajeKontakt } from "@/komponenty/patka";
import { VYCHOZI_OBSAH, type Obsah } from "./vychozi";

/**
 * Čtení obsahu webu.
 *
 * Obsah se čte z databáze **při požadavku**, ne jednorázově při buildu:
 * Supabase na free tarifu projekt po týdnu nízké aktivity uspí a stránky
 * postavené při buildu by pak zamrzly na starém obsahu. Krátká revalidace
 * je nastavená na jednotlivých stránkách.
 *
 * Když databáze není nastavená nebo dotaz selže, web běží na výchozím obsahu
 * ze souboru. Nikdy nespadne a nikdy neukáže prázdnou stránku.
 */

function slucSVychozim(klic: string, zDatabaze: unknown): Obsah {
  const vychozi = VYCHOZI_OBSAH[klic] ?? {};
  if (typeof zDatabaze !== "object" || zDatabaze === null || Array.isArray(zDatabaze)) {
    return vychozi;
  }
  // Mělké sloučení: co je v databázi, vyhrává. Pole se nahrazují celá.
  // Pole, která do schématu přibyla později, se doplní z výchozího obsahu.
  return { ...vychozi, ...(zDatabaze as Obsah) };
}

export async function nactiObsah(klic: string): Promise<Obsah> {
  if (!jeSupabaseNastaveny()) return VYCHOZI_OBSAH[klic] ?? {};

  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", klic)
      .maybeSingle();

    if (error) throw error;
    return slucSVychozim(klic, data?.value);
  } catch (chyba) {
    console.error(`Obsah „${klic}" se nepodařilo načíst, jedu na výchozím.`, chyba);
    return VYCHOZI_OBSAH[klic] ?? {};
  }
}

/** Načte víc sekcí najednou — jeden dotaz místo pěti. */
export async function nactiVice(klice: readonly string[]): Promise<Record<string, Obsah>> {
  if (!jeSupabaseNastaveny()) {
    return Object.fromEntries(klice.map((k) => [k, VYCHOZI_OBSAH[k] ?? {}]));
  }

  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from("site_content")
      .select("key, value")
      .in("key", klice as string[]);

    if (error) throw error;

    const podleKlice = new Map<string, unknown>(
      (data ?? []).map((r) => [r.key as string, r.value]),
    );
    return Object.fromEntries(
      klice.map((k) => [k, slucSVychozim(k, podleKlice.get(k))]),
    );
  } catch (chyba) {
    console.error("Obsah se nepodařilo načíst, jedu na výchozím.", chyba);
    return Object.fromEntries(klice.map((k) => [k, VYCHOZI_OBSAH[k] ?? {}]));
  }
}

/* -------------------------------------------------------------------------- */
/*  Kontakt — používá ho hlavička i patička na každé stránce                   */
/* -------------------------------------------------------------------------- */

function retezec(x: unknown): string | undefined {
  const s = typeof x === "string" ? x.trim() : "";
  return s === "" ? undefined : s;
}

export async function nactiKontakt(): Promise<UdajeKontakt> {
  const k = await nactiObsah("kontakt");
  return {
    ico: retezec(k.ico),
    adresa: retezec(k.adresa),
    telefon: retezec(k.telefon),
    email: retezec(k.email),
    otviraciDoba: retezec(k.otviraci_doba),
    instagram: retezec(k.instagram),
    facebook: retezec(k.facebook),
  };
}
