import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON, SUPABASE_URL } from "./nastaveni";

/**
 * Klient pro serverovou část webu. Jede pod anonymním klíčem, takže na něj
 * platí RLS — čte obsah a zná přihlášeného uživatele, ale sám o sobě
 * nic měnit nesmí.
 */
export async function supabaseServer() {
  const kosik = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll() {
        return kosik.getAll();
      },
      setAll(cookiesKZapisu) {
        try {
          for (const { name, value, options } of cookiesKZapisu) {
            kosik.set(name, value, options);
          }
        } catch {
          // Ze serverové komponenty se cookie zapsat nedá. Obnovení sezení
          // obstará proxy, takže se tu chyba dá bezpečně přejít.
        }
      },
    },
  });
}
