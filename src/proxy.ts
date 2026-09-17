import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON, SUPABASE_URL } from "@/lib/supabase/nastaveni";

/**
 * Obnovení přihlášení. V Next 16 se tomu, čemu se dřív říkalo middleware,
 * říká proxy — funguje to stejně.
 *
 * Dělá se tu **jen** prodloužení sezení, nic víc. Rozhodnutí, kdo smí do
 * administrace a kdo smí měnit data, patří na server ke každé operaci zvlášť.
 * Tady by to byla jen optimistická kontrola, na kterou se nedá spolehnout.
 */
export async function proxy(request: NextRequest) {
  const odpoved = NextResponse.next({ request });

  // Dokud projekt v Supabase neexistuje, není co obnovovat.
  if (!SUPABASE_URL || !SUPABASE_ANON) return odpoved;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesKZapisu) {
        for (const { name, value, options } of cookiesKZapisu) {
          odpoved.cookies.set(name, value, options);
        }
      },
    },
  });

  // `getUser` ověřuje token u Supabase. `getSession` jen přečte cookie,
  // které se dá podvrhnout — na serveru se na něj spoléhat nesmí.
  await supabase.auth.getUser();

  return odpoved;
}

export const config = {
  matcher: [
    // Statické soubory a obrázky přeskočíme — sezení tam nikdo nepotřebuje.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
