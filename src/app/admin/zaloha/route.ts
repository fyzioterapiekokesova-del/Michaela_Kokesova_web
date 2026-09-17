import { NextResponse } from "next/server";
import { zjistiAdmina } from "@/lib/admin/autorizace";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Stažení zálohy obsahu.
 *
 * Supabase na free tarifu zálohy nemá, takže je tohle jediný způsob, jak si
 * obsah webu odnést. Vyexportuje celý `site_content` do jednoho JSON souboru.
 *
 * Adresa je veřejně dosažitelná, proto se oprávnění ověřuje i tady —
 * nepřihlášený dostane 404, ne obsah.
 */
export async function GET() {
  const admin = await zjistiAdmina();
  if (!admin) {
    return new NextResponse("Nenalezeno", { status: 404 });
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("site_content")
    .select("key, value, updated_at")
    .order("key");

  if (error) {
    console.error("Zálohu obsahu se nepodařilo načíst.", error);
    return new NextResponse("Zálohu se nepodařilo vytvořit.", { status: 500 });
  }

  const den = new Date().toISOString().slice(0, 10);
  const zaloha = {
    web: "fyzioterapiekokesova.cz",
    vytvoreno: new Date().toISOString(),
    sekci: data?.length ?? 0,
    obsah: data ?? [],
  };

  return new NextResponse(JSON.stringify(zaloha, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="obsah-webu-${den}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
