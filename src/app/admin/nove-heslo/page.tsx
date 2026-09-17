import Link from "next/link";
import { FormularHesla } from "@/komponenty/admin/formular-hesla";
import { jeSupabaseNastaveny } from "@/lib/supabase/nastaveni";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Nastavení nového hesla.
 *
 * Přijde se sem z `/admin/potvrzeni`, kde se jednorázový kód z e-mailu
 * vyměnil za přihlášení. Když relace není, odkaz vypršel nebo už byl použitý
 * a formulář se vůbec nenabídne — jinak by člověk vyplnil heslo a až potom
 * se dozvěděl, že to bylo zbytečné.
 */
export const dynamic = "force-dynamic";

async function jePrihlaseny(): Promise<boolean> {
  if (!jeSupabaseNastaveny()) return false;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Boolean(user);
}

export default async function NoveHeslo() {
  const muze = await jePrihlaseny();

  return (
    <div className="obal flex flex-1 items-center justify-center py-12">
      <div className="bg-povrch border-linka rounded-karta w-full max-w-[30rem] border p-6 lg:p-8">
        <h1 className="text-h3 lg:text-h3-pc">Nové heslo</h1>

        {muze ? (
          <div className="mt-8">
            <FormularHesla />
          </div>
        ) : (
          <>
            <p className="mt-4">
              Odkaz už neplatí. Platí jen krátkou dobu a jde použít jednou.
            </p>
            <p className="text-text-doplnek mt-3 text-[1.0625rem]">
              Nechte si prosím poslat nový a otevřete ho hned, jak dorazí.
            </p>
            <p className="mt-6">
              <Link href="/admin/zapomenute-heslo" className="klik underline">
                Poslat nový odkaz
              </Link>
            </p>
          </>
        )}

        <p className="border-linka mt-6 border-t pt-6">
          <Link href="/admin/prihlaseni" className="klik underline">
            ← Zpátky na přihlášení
          </Link>
        </p>
      </div>
    </div>
  );
}
