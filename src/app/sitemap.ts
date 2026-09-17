import type { MetadataRoute } from "next";
import { PRAVNI, SLUZBY } from "@/lib/navigace";
import { zakladniAdresa } from "@/lib/obsah/seo";

/**
 * `sitemap.xml`.
 *
 * Jsou tu jen stránky, které mají být ve vyhledávači. Děkovací stránka
 * a administrace ne.
 *
 * Podologie má nejvyšší prioritu — je to jediná služba, kde je v Budějovicích
 * slabá konkurence, a na ní stojí celá dohledatelnost.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const zaklad = zakladniAdresa();
  const ted = new Date();

  const stranky: { cesta: string; priorita: number; zmena: "weekly" | "monthly" | "yearly" }[] = [
    { cesta: "/", priorita: 1, zmena: "weekly" },
    ...SLUZBY.map((s) => ({
      cesta: s.href,
      priorita: s.href === "/podologie" ? 0.9 : 0.8,
      zmena: "monthly" as const,
    })),
    { cesta: "/cenik", priorita: 0.8, zmena: "monthly" },
    { cesta: "/o-mne", priorita: 0.7, zmena: "monthly" },
    { cesta: "/caste-dotazy", priorita: 0.7, zmena: "monthly" },
    ...PRAVNI.map((p) => ({
      cesta: p.href,
      priorita: 0.2,
      zmena: "yearly" as const,
    })),
  ];

  return stranky.map((s) => ({
    url: `${zaklad}${s.cesta === "/" ? "" : s.cesta}`,
    lastModified: ted,
    changeFrequency: s.zmena,
    priority: s.priorita,
  }));
}
