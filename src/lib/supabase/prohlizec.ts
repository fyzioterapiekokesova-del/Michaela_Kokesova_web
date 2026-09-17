"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON, SUPABASE_URL } from "./nastaveni";

/**
 * Klient pro prohlížeč. Používá se jen k přihlášení a odhlášení —
 * obsah se čte na serveru.
 *
 * Jede pod anonymním klíčem, který je veřejný. To je v pořádku: co s ním
 * jde dělat, rozhoduje RLS v databázi, ne to, jestli je klíč vidět.
 */
export function supabaseProhlizec() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON);
}
