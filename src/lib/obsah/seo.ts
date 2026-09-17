import type { Metadata } from "next";
import { nactiObsah } from "./index";
import { fotka, seznam, text } from "./cteni";

/**
 * Titulek a popis stránky. Obojí si klientka mění v administraci — je to
 * to, co se lidem ukáže ve výsledcích vyhledávání.
 *
 * Náhledy nasazení se nesmí indexovat, jinak by Google našel dvě kopie webu
 * a nevěděl, která je ta pravá.
 */

const JE_NAHLED =
  process.env.VERCEL_ENV !== undefined && process.env.VERCEL_ENV !== "production";

export function zakladniAdresa(): string {
  return process.env.NEXT_PUBLIC_URL ?? "https://www.fyzioterapiekokesova.cz";
}

export async function metadataProStranku(href: string): Promise<Metadata> {
  const seo = await nactiObsah("seo");
  const stranka = seznam(seo, "stranky").find((s) => text(s, "href") === href);

  const titulek = stranka ? text(stranka, "titulek") : "";
  const popis = stranka ? text(stranka, "popis") : "";
  const obrazek = fotka(seo, "sdileni");

  return {
    metadataBase: new URL(zakladniAdresa()),
    title: titulek || undefined,
    description: popis || undefined,
    alternates: { canonical: href },
    robots: JE_NAHLED ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      locale: "cs_CZ",
      url: href,
      title: titulek || undefined,
      description: popis || undefined,
      images: obrazek ? [{ url: obrazek, alt: text(seo, "sdileni_popis") }] : undefined,
    },
  };
}
