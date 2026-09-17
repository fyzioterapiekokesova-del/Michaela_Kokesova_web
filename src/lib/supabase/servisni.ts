import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./nastaveni";

/**
 * Klient se servisním klíčem. **Obchází RLS**, takže smí všechno.
 *
 * Používá se jedině tam, kde to jinak nejde — založení účtu administrátorky
 * (veřejná registrace je vypnutá). Nikdy se nesmí dostat do kódu, který běží
 * v prohlížeči, a nikdy nenahrazuje kontrolu oprávnění: i odsud se nejdřív
 * ověří, kdo volá.
 */
export function supabaseServisni() {
  if (typeof window !== "undefined") {
    throw new Error("Servisní klíč nikdy nesmí do prohlížeče.");
  }

  const klic = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !klic) {
    throw new Error(
      "Chybí SUPABASE_SERVICE_ROLE_KEY nebo NEXT_PUBLIC_SUPABASE_URL v .env.local.",
    );
  }

  return createClient(SUPABASE_URL, klic, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
