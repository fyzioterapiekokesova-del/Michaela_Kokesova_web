/**
 * Založí účet administrátorky.  Spuštění:  npm run admin
 *
 * Veřejná registrace je v Supabase vypnutá, takže účet nejde vytvořit
 * z webu — zakládá se odsud, pod servisním klíčem.
 *
 * **Heslo se nikde nevypisuje a nikam neposílá.** Účet vznikne s náhodným
 * heslem, které nikdo nezná, a Michaele odejde e-mail s odkazem, kterým si
 * nastaví vlastní. Odkaz platí krátce a dá se použít jednou.
 *
 * Skript se dá pustit opakovaně: když účet už existuje, jen doplní řádek
 * v tabulce `admini` a pošle nový odkaz.
 */

import { createClient } from "@supabase/supabase-js";

const URL_PROJEKTU = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVISNI_KLIC = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = process.env.ADMIN_EMAIL;
const ADRESA_WEBU = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

function konec(zprava: string): never {
  console.error(zprava);
  process.exit(1);
}

if (!URL_PROJEKTU || !SERVISNI_KLIC) {
  konec(
    "Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Spouštějte přes `npm run admin`, ať se načte .env.local.",
  );
}

if (!EMAIL) {
  konec("Chybí ADMIN_EMAIL v .env.local — doplňte e-mail administrátorky.");
}

const supabase = createClient(URL_PROJEKTU, SERVISNI_KLIC, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Náhodné heslo, které se nikde nevypíše. Michaela si nastaví vlastní. */
function docasneHeslo(): string {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(24)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function najdiPodleEmailu(email: string): Promise<string | undefined> {
  // Stránkuje se po sto, účtů tu nikdy nebude víc než pár.
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 100 });
  if (error) konec(`Seznam účtů se nepodařilo načíst: ${error.message}`);
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
}

async function main() {
  const email = EMAIL!.trim();

  let id = await najdiPodleEmailu(email);

  if (id) {
    console.log(`Účet ${email} už existuje, zakládat ho znovu netřeba.`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: docasneHeslo(),
      // Adresu potvrzovat nemusí — účet zakládá správce, ne návštěvník.
      email_confirm: true,
    });
    if (error || !data.user) {
      konec(`Účet se nepodařilo založit: ${error?.message ?? "neznámá chyba"}`);
    }
    id = data.user.id;
    console.log(`Účet ${email} založen.`);
  }

  // Bez řádku v `admini` se do administrace nedostane ani přihlášený člověk.
  const { error: chybaAdmina } = await supabase
    .from("admini")
    .upsert({ user_id: id, poznamka: "administrátorka webu" }, { onConflict: "user_id" });

  if (chybaAdmina) {
    konec(
      `Účet vznikl, ale oprávnění se nepodařilo zapsat: ${chybaAdmina.message}\n` +
        "Zkontrolujte, jestli proběhly migrace 0001 a 0004.",
    );
  }
  console.log("Oprávnění administrátorky zapsáno.");

  // Odkaz na nastavení hesla. Heslo samo neodchází nikdy.
  const { error: chybaOdkazu } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${ADRESA_WEBU}/admin/potvrzeni`,
  });

  if (chybaOdkazu) {
    console.error(
      `Účet i oprávnění jsou hotové, ale e-mail s odkazem neodešel: ${chybaOdkazu.message}`,
    );
    console.error(
      "Michaela si o odkaz může říct sama na /admin/zapomenute-heslo.",
    );
    return;
  }

  console.log(`Na ${email} odešel odkaz na nastavení hesla. Platí krátce.`);
}

main();
