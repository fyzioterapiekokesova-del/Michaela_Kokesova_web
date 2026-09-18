import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { zakladniAdresa } from "@/lib/obsah/seo";

/**
 * `robots.txt`.
 *
 * **Náhledy nasazení se nesmí indexovat.** Kdyby Google našel preview i ostrý
 * web, měl by dvě kopie téhož obsahu a nevěděl by, která je ta pravá.
 * Proto se všechno kromě produkce zakazuje celé.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const jeProdukce =
    process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === "production";

  if (!jeProdukce) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  /*
    Poddoména administrace se nesmí indexovat celá. Samotné `Disallow: /admin`
    níž tu nestačí — na poddoméně je administrace v kořeni, takže by se
    to pravidlo minulo cílem.
  */
  const hostAdmina = process.env.ADMIN_URL?.trim();
  if (hostAdmina) {
    const host = (await headers()).get("host")?.split(":")[0]?.toLowerCase();
    try {
      if (host && host === new URL(hostAdmina).hostname.toLowerCase()) {
        return { rules: { userAgent: "*", disallow: "/" } };
      }
    } catch {
      // Rozbitá adresa v proměnné nesmí shodit robots.txt celého webu.
    }
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Administrace a děkovací stránka do vyhledávače nepatří.
      disallow: ["/admin", "/admin/", "/dekujeme"],
    },
    sitemap: `${zakladniAdresa()}/sitemap.xml`,
    host: zakladniAdresa(),
  };
}
