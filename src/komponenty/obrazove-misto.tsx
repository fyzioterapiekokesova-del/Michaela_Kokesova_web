import Image from "next/image";

import { stylVyrezu } from "@/lib/obrazky/pozice";

/**
 * Obrazové místo.
 *
 * Když fotka není, komponenta **na ostrém webu nevykreslí nic**. Tři šedé
 * obdélníky na spuštěném webu nevypadají jako čekání na fotky, ale jako
 * nedodělaný web — a v akceptačních kritériích stojí, že na ostré adrese
 * nesmí být ani jedna zástupná fotka.
 *
 * Šedý zástupný obdélník s popiskem se ukáže jen v náhledu v administraci
 * (`nahled`), aby klientka viděla, co kam patří a v jakém poměru stran.
 */

type Varianta = "hero" | "portret" | "galerie" | "mapa";

const VARIANTY: Record<Varianta, { obal: string; pozice?: string; popis: string }> =
  {
    hero: {
      obal: "h-[300px] w-full lg:h-auto lg:aspect-[5/7]",
      pozice: "50% 12%",
      popis: "Úvodní fotka — poměr 5:7",
    },
    portret: {
      obal: "h-[380px] w-full lg:h-[520px]",
      popis: "Portrét — poměr 1:1 až 4:5",
    },
    galerie: {
      obal: "aspect-[4/3] w-full",
      popis: "Fotka ordinace — poměr 4:3",
    },
    mapa: {
      obal: "h-[220px] w-full lg:h-[460px]",
      popis: "Mapa",
    },
  };

type Vlastnosti = {
  varianta: Varianta;
  /**
   * Jak se obrázek chová v obrazovém místě.
   *  - `orez` — vyplní celou plochu a přebytek se ořízne. Pro fotky.
   *  - `cele` — vejde se celý, bez zaoblení a bez podkladu. Pro logo
   *    a kresby, kterým ořez usekne půlku a kolem kterých nemá být rámeček.
   */
  vyplneni?: "orez" | "cele";
  /** Cesta k fotce. Bez ní se nevykreslí nic (nebo náhled v adminu). */
  src?: string;
  /** Popisek fotky. Bez něj se v adminu fotka neuloží, takže tady vždycky je. */
  alt?: string;
  /** Náhled v administraci — ukáže šedou plochu s popiskem místo prázdna. */
  nahled?: boolean;
  /**
   * Výřez nastavený v administraci — ohnisko ve tvaru `"50% 30%"`.
   * Když chybí, použije se výchozí ohnisko varianty (hero má `50% 12%`).
   */
  pozice?: string;
  /** Přiblížení z administrace, 1 = beze změny. */
  zoom?: number;
  /** Fotka nad prvním ohybem se načítá přednostně, ostatní odloženě. */
  priorita?: boolean;
  /** Vlastní text do šedé plochy v náhledu. */
  popisPrazdneho?: string;
};

export function ObrazoveMisto({
  varianta,
  vyplneni = "orez",
  src,
  alt,
  nahled = false,
  pozice,
  zoom,
  priorita = false,
  popisPrazdneho,
}: Vlastnosti) {
  const nastaveni = VARIANTY[varianta];
  const cele = vyplneni === "cele";

  if (!src) {
    if (!nahled) return null;

    return (
      <div
        className={`bg-seda rounded-dlazdice text-text-doplnek flex items-center justify-center p-6 text-center ${nastaveni.obal}`}
      >
        <span className="text-telo">
          {popisPrazdneho ?? nastaveni.popis}
          <br />
          <span className="text-[0.9375rem]">zde bude vaše fotka</span>
        </span>
      </div>
    );
  }

  // Bez zaoblení a bez podkladu — cokoli z toho by kolem loga udělalo rámeček.
  const obal = cele ? "h-[220px] w-full lg:h-[420px]" : nastaveni.obal;

  return (
    <div
      className={`relative ${cele ? "" : "rounded-dlazdice overflow-hidden"} ${obal}`}
    >
      <Image
        src={src}
        alt={alt ?? ""}
        fill
        priority={priorita}
        loading={priorita ? undefined : "lazy"}
        sizes="(max-width: 1023px) 100vw, 50vw"
        className={cele ? "object-contain" : "object-cover"}
        /*
          Výřez z administrace. Když ho klientka nenastavila, zůstává výchozí
          ohnisko varianty — u hero je to `50% 12%`, aby se z portrétu na výšku
          neuřízla hlava. U `cele` se nic neořezává, takže ani nastavovat není co.
        */
        style={
          cele ? undefined : stylVyrezu(pozice ?? nastaveni.pozice, zoom)
        }
      />
    </div>
  );
}
