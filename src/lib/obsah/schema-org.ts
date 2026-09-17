import { SLUZBY } from "@/lib/navigace";
import { telHref } from "@/lib/kontakt";
import { fotka, seznam, text, textNeboNic } from "./cteni";
import { prevedOtviraciDobu } from "./otviraci-doba";
import { zakladniAdresa } from "./seo";
import type { Obsah } from "./vychozi";

/**
 * Popis ordinace pro vyhledávače.
 *
 * `Physiotherapy` je v schema.org podtyp místní zdravotní služby, takže
 * z toho Google pozná, že jde o ordinaci v konkrétním městě, ne o e-shop.
 *
 * Adresa ani otevírací doba se nevymýšlí — dokud je klientka nedodá,
 * prostě v datech nejsou.
 */
export function ordinaceJsonLd(kontakt: Obsah, seo: Obsah) {
  const zaklad = zakladniAdresa();
  const telefon = textNeboNic(kontakt, "telefon");
  const email = textNeboNic(kontakt, "email");
  const adresa = textNeboNic(kontakt, "adresa");
  const lat = textNeboNic(kontakt, "mapa_lat");
  const lon = textNeboNic(kontakt, "mapa_lon");
  const doba = prevedOtviraciDobu(textNeboNic(kontakt, "otviraci_doba"));
  const obrazek = fotka(seo, "sdileni");

  const site: string[] = [];
  for (const klic of ["instagram", "facebook"] as const) {
    const odkaz = textNeboNic(kontakt, klic);
    if (odkaz) site.push(odkaz);
  }

  return {
    "@context": "https://schema.org",
    "@type": "Physiotherapy",
    "@id": `${zaklad}/#ordinace`,
    name: "Fyzioterapie Mgr. Michaela Kokešová",
    url: zaklad,
    ...(telefon ? { telephone: telHref(telefon).replace("tel:", "") } : {}),
    ...(email ? { email } : {}),
    ...(obrazek ? { image: obrazek } : {}),
    ...(site.length > 0 ? { sameAs: site } : {}),

    // Adresa se vyplní, až ji klientka dodá. Město je jisté už teď.
    address: {
      "@type": "PostalAddress",
      addressLocality: "České Budějovice",
      addressCountry: "CZ",
      ...(adresa ? { streetAddress: adresa.replace(/\n/g, ", ") } : {}),
    },
    areaServed: { "@type": "City", name: "České Budějovice" },

    ...(lat && lon
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: lat,
            longitude: lon,
          },
        }
      : {}),

    ...(doba.length > 0 ? { openingHoursSpecification: doba } : {}),

    medicalSpecialty: "PhysicalTherapy",
    availableService: SLUZBY.map((s) => ({
      "@type": "MedicalTherapy",
      name: s.nazev,
      url: `${zaklad}${s.href}`,
    })),
  };
}

/**
 * Otázky a odpovědi. Google je umí ukázat rovnou ve výsledku vyhledávání
 * a AI asistenti si přesně takové úseky berou, když někomu odpovídají.
 */
export function faqJsonLd(faq: Obsah) {
  const otazky = seznam(faq, "otazky")
    .map((z) => ({ otazka: text(z, "otazka"), odpoved: text(z, "odpoved") }))
    .filter((z) => z.otazka && z.odpoved);

  if (otazky.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: otazky.map((z) => ({
      "@type": "Question",
      name: z.otazka,
      acceptedAnswer: { "@type": "Answer", text: z.odpoved },
    })),
  };
}
