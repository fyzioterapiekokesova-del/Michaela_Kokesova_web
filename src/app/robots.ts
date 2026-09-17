import type { MetadataRoute } from "next";
import { zakladniAdresa } from "@/lib/obsah/seo";

/**
 * `robots.txt`.
 *
 * **Náhledy nasazení se nesmí indexovat.** Kdyby Google našel preview i ostrý
 * web, měl by dvě kopie téhož obsahu a nevěděl by, která je ta pravá.
 * Proto se všechno kromě produkce zakazuje celé.
 */
export default function robots(): MetadataRoute.Robots {
  const jeProdukce =
    process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === "production";

  if (!jeProdukce) {
    return { rules: { userAgent: "*", disallow: "/" } };
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
