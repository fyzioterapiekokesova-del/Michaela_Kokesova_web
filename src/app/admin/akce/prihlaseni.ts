"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { zkusPusit } from "@/lib/formular/omezeni";
import { jeSupabaseNastaveny } from "@/lib/supabase/nastaveni";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Přihlášení do administrace.
 *
 * Dvě věci, které se tu nesmí porušit:
 *
 * 1. **Chybová hláška nikdy neprozradí, jestli účet existuje.** Špatné heslo,
 *    neexistující e-mail i účet bez oprávnění vrací doslova stejnou větu.
 *    Jinak by se dal seznam účtů zjistit hádáním.
 *
 * 2. **Omezení frekvence.** Pět pokusů z jedné adresy za čtvrt hodiny.
 *    Heslo se hádat nedá donekonečna.
 *
 * Přihlášený ≠ oprávněný: po úspěšném přihlášení se ještě ověří, že člověk
 * má řádek v tabulce `admini`. Kdo ho nemá, je hned odhlášen.
 */

export type StavPrihlaseni = {
  stav: "prazdno" | "chyba";
  zprava?: string;
  email?: string;
};

/** Jediná věta pro všechny neúspěchy. Nesmí se rozvětvit. */
const NEPOVEDLO_SE =
  "Přihlášení se nepovedlo. Zkontrolujte e-mail a heslo a zkuste to znovu.";

async function adresaVolajiciho(): Promise<string> {
  const hlavicky = await headers();
  return (
    hlavicky.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hlavicky.get("x-real-ip") ||
    "neznama"
  );
}

export async function prihlasit(
  _predchozi: StavPrihlaseni,
  formular: FormData,
): Promise<StavPrihlaseni> {
  const email = String(formular.get("email") ?? "").trim();
  const heslo = String(formular.get("heslo") ?? "");

  if (!jeSupabaseNastaveny()) {
    return {
      stav: "chyba",
      zprava:
        "Administrace zatím není propojená s databází. Ozvěte se prosím správci webu.",
      email,
    };
  }

  if (email === "" || heslo === "") {
    return { stav: "chyba", zprava: "Vyplňte e-mail i heslo.", email };
  }

  const ip = await adresaVolajiciho();
  const pusteno = zkusPusit(`prihlaseni:${ip}`, 5, 15 * 60 * 1000);
  if (!pusteno.pusti) {
    const minut = Math.ceil(pusteno.zaSekund / 60);
    return {
      stav: "chyba",
      zprava: `Pokusů o přihlášení bylo moc. Zkuste to prosím za ${minut} min.`,
      email,
    };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: heslo,
  });

  if (error) {
    return { stav: "chyba", zprava: NEPOVEDLO_SE, email };
  }

  // Přihlášený ≠ oprávněný. Rozhoduje řádek v `admini`, ne to, že se někdo
  // dokázal přihlásit.
  const { data: jeAdmin, error: chybaOpravneni } = await supabase.rpc("je_admin");
  if (chybaOpravneni || jeAdmin !== true) {
    await supabase.auth.signOut();
    return { stav: "chyba", zprava: NEPOVEDLO_SE, email };
  }

  redirect("/admin");
}

export async function odhlasit(): Promise<void> {
  if (jeSupabaseNastaveny()) {
    const supabase = await supabaseServer();
    await supabase.auth.signOut();
  }
  redirect("/admin/prihlaseni");
}

/**
 * Odeslání odkazu na změnu hesla.
 *
 * Heslo se nikdy neposílá e-mailem. Odejde jen odkaz s krátkou platností,
 * po kterém si člověk nastaví nové heslo sám.
 *
 * Odpověď je vždycky stejná, i když účet neexistuje — jinak by šlo přes
 * tenhle formulář zjistit, které adresy jsou v systému.
 */
export async function posliOdkazNaHeslo(
  _predchozi: StavPrihlaseni,
  formular: FormData,
): Promise<StavPrihlaseni> {
  const email = String(formular.get("email") ?? "").trim();

  const odpoved: StavPrihlaseni = {
    stav: "prazdno",
    zprava:
      "Pokud k té adrese patří účet, přišel na ni odkaz na změnu hesla. Platí krátce, tak ho použijte hned.",
  };

  if (email === "" || !jeSupabaseNastaveny()) return odpoved;

  const ip = await adresaVolajiciho();
  const pusteno = zkusPusit(`heslo:${ip}`, 3, 15 * 60 * 1000);
  if (!pusteno.pusti) return odpoved;

  // Odkaz vede na route handler, ne rovnou na stránku — jednorázový kód se
  // dá na přihlášení vyměnit jedině tam, kde jdou zapsat cookie.
  const zaklad = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${zaklad}/admin/potvrzeni`,
  });

  // Chyba se zaloguje, ale ven se nepustí — odpověď musí být pořád stejná.
  if (error) console.error("Odkaz na změnu hesla se nepodařilo odeslat.", error);

  return odpoved;
}

/* -------------------------------------------------------------------------- */
/*  Nastavení nového hesla                                                     */
/* -------------------------------------------------------------------------- */

export type StavHesla = { stav: "prazdno" | "chyba"; zprava?: string };

/** Dvanáct znaků. Delší heslo je jediná ochrana, která vydrží hádání. */
const NEJKRATSI_HESLO = 12;

export async function nastavNoveHeslo(
  _predchozi: StavHesla,
  formular: FormData,
): Promise<StavHesla> {
  const heslo = String(formular.get("heslo") ?? "");
  const znovu = String(formular.get("heslo_znovu") ?? "");

  if (heslo.length < NEJKRATSI_HESLO) {
    return {
      stav: "chyba",
      zprava: `Heslo musí mít aspoň ${NEJKRATSI_HESLO} znaků. Klidně napište krátkou větu, tu si zapamatujete snáz než změť znaků.`,
    };
  }

  if (heslo !== znovu) {
    return { stav: "chyba", zprava: "Hesla se neshodují. Napište je prosím znovu." };
  }

  const supabase = await supabaseServer();

  // Relace vznikla vyměněním jednorázového kódu z e-mailu. Bez ní se heslo
  // změnit nedá — jinak by si ho mohl přepsat kdokoli.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      stav: "chyba",
      zprava:
        "Platnost odkazu vypršela. Nechte si prosím poslat nový a použijte ho hned.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: heslo });
  if (error) {
    console.error("Heslo se nepodařilo změnit.", error);
    return {
      stav: "chyba",
      zprava: "Heslo se nepodařilo změnit. Zkuste to prosím znovu.",
    };
  }

  redirect("/admin");
}
