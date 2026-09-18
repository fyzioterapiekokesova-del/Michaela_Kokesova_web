"use client";

import Image from "next/image";
import { pozicePropStyl, stylPriblizeni } from "@/lib/obrazky/pozice";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Galerie se zvětšením fotky.
 *
 * Otevírá **kliknutí**, ne najetí — na dotykovém zařízení najetí neexistuje.
 * Zavírá křížek, klávesa Esc a kliknutí mimo. Ohnisko zůstává uvnitř, dokud
 * je zvětšení otevřené, a po zavření se vrátí na fotku, ze které se otevřelo.
 *
 * Zobrazí se jen tolik fotek, kolik jich klientka nahrála. Prázdná místa se
 * nedoplňují a bez fotek se nevykreslí vůbec nic.
 */

export type Fotka = {
  src: string;
  /** Popisek. V administraci povinný — bez něj se fotka neuloží. */
  alt: string;
  /** Výřez z administrace. Platí jen pro náhled, ne pro zvětšenou fotku. */
  pozice?: string;
  zoom?: number;
};

export function Galerie({ fotky }: { fotky: readonly Fotka[] }) {
  const [otevrena, setOtevrena] = useState<number | null>(null);
  const spoustece = useRef<(HTMLButtonElement | null)[]>([]);

  const zavrit = useCallback(() => {
    const index = otevrena;
    setOtevrena(null);
    // Ohnisko zpátky na fotku, ze které se zvětšení otevřelo.
    if (index !== null) {
      requestAnimationFrame(() => spoustece.current[index]?.focus());
    }
  }, [otevrena]);

  if (fotky.length === 0) return null;

  return (
    <>
      <ul className="grid list-none grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {fotky.map((fotka, poradi) => (
          <li key={fotka.src}>
            <button
              type="button"
              ref={(el) => {
                spoustece.current[poradi] = el;
              }}
              onClick={() => setOtevrena(poradi)}
              className="rounded-dlazdice relative block aspect-[4/3] w-full overflow-hidden"
            >
              <span className="sr-only">Zvětšit fotku: {fotka.alt}</span>
              {/*
                Přiblížení sedí na obalu, ne na fotce. Fotka má vlastní
                `transform` — při najetí myší se zvětší — a dva transformy na
                jednom prvku nejdou, druhý by ten první přepsal. Na obalu se
                naopak násobí, takže funguje výřez i zvětšení při najetí.
              */}
              <span
                className="absolute inset-0"
                style={stylPriblizeni(fotka.pozice, fotka.zoom)}
              >
                <Image
                  src={fotka.src}
                  alt={fotka.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  className="object-cover transition-transform duration-150 hover:scale-[1.02]"
                  style={{ objectPosition: pozicePropStyl(fotka.pozice) }}
                />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {otevrena !== null ? (
        <Zvetseni fotka={fotky[otevrena]} zavrit={zavrit} />
      ) : null}
    </>
  );
}

function Zvetseni({ fotka, zavrit }: { fotka: Fotka; zavrit: () => void }) {
  const dialog = useRef<HTMLDivElement>(null);
  const krizek = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    krizek.current?.focus();

    // Pozadí se schová před odečítačem, dokud je zvětšení otevřené.
    const koren = document.getElementById("koren-stranky");
    koren?.setAttribute("inert", "");
    const puvodniPretekani = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function naKlavesu(e: KeyboardEvent) {
      if (e.key === "Escape") {
        zavrit();
        return;
      }
      if (e.key !== "Tab") return;

      // Ohnisko nesmí utéct z otevřeného zvětšení.
      const zamerovatelne = dialog.current?.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!zamerovatelne || zamerovatelne.length === 0) return;
      const prvni = zamerovatelne[0];
      const posledni = zamerovatelne[zamerovatelne.length - 1];

      if (e.shiftKey && document.activeElement === prvni) {
        e.preventDefault();
        posledni.focus();
      } else if (!e.shiftKey && document.activeElement === posledni) {
        e.preventDefault();
        prvni.focus();
      }
    }

    document.addEventListener("keydown", naKlavesu);
    return () => {
      document.removeEventListener("keydown", naKlavesu);
      koren?.removeAttribute("inert");
      document.body.style.overflow = puvodniPretekani;
    };
  }, [zavrit]);

  // Zvětšení se vykresluje mimo obsah stránky, aby se zbytek dal označit
  // jako `inert`, aniž by to vyřadilo i samotné zvětšení. Sem se komponenta
  // dostane až po kliknutí, takže `document` vždycky existuje.
  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={fotka.alt}
      onClick={(e) => {
        if (e.target === e.currentTarget) zavrit();
      }}
      className="na-tmavem fixed inset-0 z-100 flex items-center justify-center bg-[rgba(46,48,45,.92)] p-5"
    >
      <button
        ref={krizek}
        type="button"
        onClick={zavrit}
        className="text-povrch rounded-polozka absolute top-4 right-4 flex size-12 items-center justify-center text-[1.75rem] leading-none"
      >
        <span className="sr-only">Zavřít zvětšení</span>
        <span aria-hidden>×</span>
      </button>

      <figure className="max-h-full">
        <Image
          src={fotka.src}
          alt={fotka.alt}
          width={1600}
          height={1200}
          sizes="100vw"
          className="rounded-dlazdice max-h-[80vh] w-auto object-contain"
        />
        <figcaption className="text-povrch text-telo mt-4 text-center">
          {fotka.alt}
        </figcaption>
      </figure>
    </div>,
    document.body,
  );
}
