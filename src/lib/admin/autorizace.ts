import { redirect } from "next/navigation";
import { jeSupabaseNastaveny } from "@/lib/supabase/nastaveni";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Kdo smí do administrace.
 *
 * Rozhoduje se to **na serveru u každé operace zvlášť**, ne v proxy a ne
 * schováním tlačítka. Přihlášený ≠ oprávněný: kdokoli si může založit účet
 * v Supabase jiným kanálem, ale administrátorem je jen ten, kdo má řádek
 * v tabulce `admini`. Ověřuje to funkce `je_admin()` přímo v databázi —
 * stejná, na které stojí i RLS policy.
 *
 * `getUser()` ověřuje token u Supabase. `getSession()` jen přečte cookie,
 * kterou lze podvrhnout — na serveru se na ni spoléhat nesmí.
 */

export type Admin = { id: string; email: string };

export async function zjistiAdmina(): Promise<Admin | null> {
  if (!jeSupabaseNastaveny()) return null;

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: jeAdmin, error } = await supabase.rpc("je_admin");
  if (error || jeAdmin !== true) return null;

  return { id: user.id, email: user.email ?? "" };
}

/**
 * Totéž, ale nepřihlášeného rovnou odveze na přihlášení. Používá se
 * v layoutu administrace i na začátku každé server action, která mění data.
 */
export async function vyzadujAdmina(): Promise<Admin> {
  const admin = await zjistiAdmina();
  if (!admin) redirect("/admin/prihlaseni");
  return admin;
}

/**
 * Varianta pro server actions, které nemají kam přesměrovat — vrátí chybu,
 * kterou formulář vypíše. Přesměrování uvnitř akce by spolklo rozepsaný
 * obsah formuláře.
 */
export async function overAdmina(): Promise<
  { stav: "ok"; admin: Admin } | { stav: "chyba"; zprava: string }
> {
  const admin = await zjistiAdmina();
  if (!admin) {
    return {
      stav: "chyba",
      zprava:
        "Přihlášení vypršelo. Otevřete si administraci znovu a přihlaste se.",
    };
  }
  return { stav: "ok", admin };
}
