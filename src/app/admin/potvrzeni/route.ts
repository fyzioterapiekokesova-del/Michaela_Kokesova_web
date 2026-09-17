import { NextResponse, type NextRequest } from "next/server";
import { jeSupabaseNastaveny } from "@/lib/supabase/nastaveni";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Sem vede odkaz z e-mailu na změnu hesla.
 *
 * Výměna jednorázového kódu za přihlášení musí proběhnout tady, v route
 * handleru, ne na stránce — jen tady se dají zapsat cookie s relací.
 *
 * Kód platí krátce a jen jednou. Po vyměnění se přesměruje na formulář
 * s novým heslem, aby kód nezůstal viset v adrese a v historii prohlížeče.
 */
export async function GET(request: NextRequest) {
  const kod = request.nextUrl.searchParams.get("code");
  const cil = new URL("/admin/nove-heslo", request.nextUrl.origin);

  if (!kod || !jeSupabaseNastaveny()) {
    cil.searchParams.set("stav", "neplatny");
    return NextResponse.redirect(cil);
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(kod);

  if (error) {
    // Nejčastěji vypršelá nebo už jednou použitá platnost. Podrobnosti
    // se ven nepouštějí, člověku stačí vědět, že si má říct o nový odkaz.
    console.error("Odkaz na změnu hesla se nepodařilo ověřit.", error);
    cil.searchParams.set("stav", "neplatny");
  }

  return NextResponse.redirect(cil);
}
