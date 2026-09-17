import { notFound } from "next/navigation";
import { FormularSekce } from "@/komponenty/admin/formular-sekce";
import { vyzadujAdmina } from "@/lib/admin/autorizace";
import { najdiSekci } from "@/lib/admin/obsah-schema";
import { nactiObsah } from "@/lib/obsah";

/**
 * Formulář jedné sekce obsahu.
 *
 * Nic se tu necachuje — administrace musí vždycky ukazovat to, co je
 * opravdu v databázi. Kdyby se stránka servírovala z cache, viděla by
 * klientka po uložení pořád starý text a myslela by si, že se změna
 * neuložila.
 */
export const dynamic = "force-dynamic";

export default async function AdminSekce({
  params,
}: PageProps<"/admin/[klic]">) {
  // Ověření na serveru. Nepřihlášený se sem nedostane ani na prázdnou stránku.
  await vyzadujAdmina();

  const { klic } = await params;
  const sekce = najdiSekci(klic);
  if (!sekce) notFound();

  const hodnoty = await nactiObsah(klic);

  return <FormularSekce sekce={sekce} vychozi={hodnoty} />;
}
