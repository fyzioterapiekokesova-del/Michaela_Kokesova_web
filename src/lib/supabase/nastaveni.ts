/**
 * Nastavení připojení k Supabase.
 *
 * Dokud projekt v Supabase neexistuje, proměnné nejsou vyplněné a web běží
 * na výchozím obsahu ze souboru. Nikde to nesmí spadnout — jen se nečte
 * z databáze.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function jeSupabaseNastaveny(): boolean {
  return SUPABASE_URL !== "" && SUPABASE_ANON !== "";
}

/** Název koše s fotkami. */
export const KOS_FOTKY = "fotky";

/** Veřejná adresa nahrané fotky. */
export function adresaFotky(cesta: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${KOS_FOTKY}/${cesta}`;
}
