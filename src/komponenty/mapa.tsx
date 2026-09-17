"use client";

import { useState } from "react";

/**
 * Mapa.
 *
 * **Nenačítá se sama.** Dokud na ni návštěvník neklikne, je na jejím místě
 * jen podklad s tlačítkem a větou o tom, kdo mapu poskytuje. Kdyby se mapa
 * načetla rovnou, připojil by se prohlížeč ke Googlu bez vědomí návštěvníka
 * a odešla by mu jeho IP adresa.
 *
 * Bez souřadnic se nevykreslí vůbec nic.
 */
export function Mapa({
  lat,
  lon,
  adresa,
}: {
  lat?: string;
  lon?: string;
  adresa?: string;
}) {
  const [nacteno, setNacteno] = useState(false);

  if (!lat || !lon) return null;

  const cil = `${lat},${lon}`;
  const nazev = adresa ? `Mapa — ${adresa}` : "Mapa";

  return (
    <figure className="m-0">
      <div className="bg-azurova-svetla rounded-dlazdice relative h-[220px] overflow-hidden lg:h-[460px]">
        {nacteno ? (
          <iframe
            title={nazev}
            src={`https://www.google.com/maps?q=${encodeURIComponent(cil)}&z=16&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="size-full border-0"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-telo lg:text-telo-pc text-text max-w-[52ch]">
              Mapu poskytuje Google. Načtením se připojíte k jeho serverům.
            </p>
            <button
              type="button"
              onClick={() => setNacteno(true)}
              data-akce="zobrazit-mapu"
              className="klik text-tlacitko rounded-tlacitko bg-text text-azurova justify-center px-7 font-extrabold"
            >
              Zobrazit mapu
            </button>
          </div>
        )}
      </div>

      <figcaption className="text-telo text-text-doplnek mt-3">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cil)}`}
          target="_blank"
          rel="noopener noreferrer"
          data-akce="mapa-navigovat"
          className="klik underline"
        >
          Otevřít navigaci v mapách
        </a>
      </figcaption>
    </figure>
  );
}
