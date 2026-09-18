import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON, SUPABASE_URL } from "@/lib/supabase/nastaveni";

/**
 * Obnovení přihlášení a rozdělení domén. V Next 16 se tomu, čemu se dřív
 * říkalo middleware, říká proxy — funguje to stejně.
 *
 * Kromě prodloužení sezení se tu jen **směruje podle domény**. Rozhodnutí,
 * kdo smí do administrace a kdo smí měnit data, patří na server ke každé
 * operaci zvlášť. Tady by to byla jen optimistická kontrola, na kterou se
 * nedá spolehnout.
 */

/**
 * Hostitel požadavku bez portu.
 *
 * Bere se z hlavičky `Host`, ne z `nextUrl.hostname` — `nextUrl` se odvozuje
 * od cílové adresy spojení (lokálně 127.0.0.1), takže by se rozdělení domén
 * nikdy netrefilo. Na Vercelu `Host` odpovídá doméně, přes kterou člověk přišel.
 *
 * Převzato z projektu Mostecká (`proxy.ts`), kde je to odzkoušené.
 */
function hostitel(request: NextRequest): string {
  const host = request.headers.get("host") ?? request.nextUrl.host;
  // IPv6 chodí v hlavičce Host v hranatých závorkách: [::1]:3000
  const bezPortu = host.startsWith("[")
    ? host.slice(0, host.indexOf("]") + 1)
    : host.split(":")[0];
  return bezPortu.toLowerCase();
}

/** Hostitel z proměnné, nebo nic. Nevyplněná proměnná přijde jako prázdno. */
function hostitelZAdresy(adresa: string | undefined): string | undefined {
  const orezano = adresa?.trim();
  if (!orezano) return undefined;
  try {
    return new URL(orezano).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

const ADMIN_PREFIX = "/admin";

export async function proxy(request: NextRequest) {
  const odpoved = NextResponse.next({ request });

  /*
    Poddoména administrace.

    Dokud `ADMIN_URL` není vyplněná, nic z tohohle se neděje
    a administrace zůstává na `/admin` jako dosud — díky tomu tahle změna
    nerozbije náhledové adresy `*.vercel.app`, na kterých se testuje.

    Neznámý hostitel (náhled, apex) se schválně obsluhuje jako web, aby se
    vývoj nezablokoval na nevyplněné proměnné.
  */
  const hostAdmina = hostitelZAdresy(process.env.ADMIN_URL);
  const hostWebu = hostitelZAdresy(process.env.WEB_URL);
  const host = hostitel(request);
  const cesta = request.nextUrl.pathname;
  const miriDoAdmina =
    cesta === ADMIN_PREFIX || cesta.startsWith(`${ADMIN_PREFIX}/`);

  if (hostAdmina && host === hostAdmina && !miriDoAdmina) {
    // Kořen poddomény vede rovnou do administrace, ať fyzioterapeutka
    // nemusí nic dopisovat za adresu.
    const cil = request.nextUrl.clone();
    cil.pathname = `${ADMIN_PREFIX}${cesta === "/" ? "" : cesta}`;
    return NextResponse.redirect(cil);
  }

  if (hostWebu && host === hostWebu && miriDoAdmina && hostAdmina) {
    // Administrace má jednu adresu, ne dvě. Na webové doméně se na ni jen
    // ukáže cesta — obsah se odsud neobsluhuje.
    const cil = new URL(process.env.ADMIN_URL!);
    cil.pathname = cesta;
    return NextResponse.redirect(cil);
  }

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
