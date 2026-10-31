import { SpravaSluzeb } from "@/komponenty/admin/sprava-sluzeb";
import { vyzadujAdmina } from "@/lib/admin/autorizace";
import { nactiSluzby } from "@/lib/obsah";

/**
 * Seznam služeb v administraci. Má přednost před `/admin/[klic]`, protože
 * pevná složka vyhrává nad dynamickou.
 */
export const dynamic = "force-dynamic";

export default async function AdminSluzby() {
  // Ověření na serveru. Nepřihlášený se sem nedostane ani na prázdnou stránku.
  await vyzadujAdmina();
  const sluzby = await nactiSluzby();
  return <SpravaSluzeb sluzby={sluzby} />;
}
