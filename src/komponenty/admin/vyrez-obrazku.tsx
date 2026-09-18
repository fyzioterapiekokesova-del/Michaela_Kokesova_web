"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";

import {
  MAX_ZOOM,
  VYCHOZI_POZICE,
  VYCHOZI_ZOOM,
  rozlozPozici,
  slozPozici,
  stylVyrezu,
  zoomPropStyl,
} from "@/lib/obrazky/pozice";

/*
  Posunutí fotky v rámečku.

  Převzato z projektu Mostecká. Jediný rozdíl je v ukládání: tam měl výřez
  vlastní formulář a vlastní tlačítko, tady se mění rovnou v datech sekce
  a uloží se jejím tlačítkem Uložit — tenhle web má jedno tlačítko na sekci.

  Fotka se do obrazového místa nevejde celá a přebytek se ořízne. Bez tohohle
  se ořezávalo vždy na střed, takže když bylo důležité místo u kraje, ustřihlo
  se — a jediná obrana bylo nahrát jinak oříznutý soubor.

  Náhled je schválně ve stejném poměru stran a se stejným zaoblením jako
  obrazové místo na webu. Bez toho by se nastavovalo naslepo: v jiném poměru
  vypadá výřez jinak.
*/

/** O kolik procent posunou šipky. Ovládat se to musí dát i klávesnicí. */
const KROK = 2;

/**
 * Poměry stran odpovídají obrazovým místům na webu (`obrazove-misto.tsx`)
 * a rozměrům ze zadání. Kde se rozměr na mobilu a na počítači liší, bere se
 * ten počítačový — na užším rámečku se ořízne víc, ne míň.
 */
const POMERY: Record<string, string> = {
  hero: "5 / 7",
  portret: "4 / 5",
  galerie: "4 / 3",
  sdileni: "1200 / 630",
};

export function VyrezObrazku({
  src,
  varianta,
  pozice,
  zoom,
  zmen,
  poziceJmeno,
  zoomJmeno,
}: {
  /** Veřejná adresa nahrané fotky. */
  src: string;
  varianta: string;
  /** Uložené ohnisko ve tvaru `"50% 30%"`. */
  pozice: unknown;
  /** Uložené přiblížení, 1 = beze změny. */
  zoom: unknown;
  /** Zápis zpátky do dat sekce. */
  zmen: (jmeno: string, hodnota: unknown) => void;
  poziceJmeno: string;
  zoomJmeno: string;
}) {
  const id = useId();
  const [{ x, y }, nastav] = useState(() => rozlozPozici(pozice));
  const [priblizeni, nastavPriblizeni] = useState(() => zoomPropStyl(zoom));
  const [tahne, nastavTahne] = useState(false);
  const ramecek = useRef<HTMLDivElement>(null);
  const pomerFotky = useRef<number | null>(null);

  const aktualni = slozPozici(x, y);
  const naStredu = aktualni === VYCHOZI_POZICE && priblizeni === VYCHOZI_ZOOM;

  function ulozPozici(dalsi: { x: number; y: number }) {
    nastav(dalsi);
    zmen(poziceJmeno, slozPozici(dalsi.x, dalsi.y));
  }

  function ulozZoom(hodnota: number) {
    const meritko = zoomPropStyl(hodnota);
    nastavPriblizeni(meritko);
    zmen(zoomJmeno, meritko);
  }

  function naStred() {
    const stred = rozlozPozici(VYCHOZI_POZICE);
    nastav(stred);
    nastavPriblizeni(VYCHOZI_ZOOM);
    zmen(poziceJmeno, VYCHOZI_POZICE);
    zmen(zoomJmeno, VYCHOZI_ZOOM);
  }

  /*
    Přepočet posunu myši na procenta.

    `object-fit: cover` fotku zvětší tak, aby rámeček pokryla, a přebytek
    schová. Ohnisko 0–100 % rozděluje právě ten přebytek, takže posun o pixel
    znamená jiný počet procent u každé fotky — u skoro čtvercové je přebytek
    malý a tažení citlivější než u panoramatu. Bez přepočtu by fotka pod
    prstem „ujížděla".
  */
  function posun(dx: number, dy: number) {
    const box = ramecek.current?.getBoundingClientRect();
    const pomerObrazku = pomerFotky.current;
    if (!box || !pomerObrazku) return;

    const pomerRamecku = box.width / box.height;

    // Kolik pixelů fotky přesahuje rámeček — jen v ose, kde je co posouvat.
    const zobrazenaSirka =
      pomerObrazku > pomerRamecku ? box.height * pomerObrazku : box.width;
    const zobrazenaVyska =
      pomerObrazku > pomerRamecku ? box.height : box.width / pomerObrazku;

    // Přiblížení přesah zvětšuje — při dvojnásobku je fotka dvakrát tak velká
    // a stejný posun prstem znamená polovinu procent.
    const presahX = zobrazenaSirka * priblizeni - box.width;
    const presahY = zobrazenaVyska * priblizeni - box.height;

    // Tažení doprava má fotku posunout doprava, tedy ukázat její levější
    // část — proto minus.
    ulozPozici({
      x: presahX > 1 ? omez(x - (dx / presahX) * 100) : x,
      y: presahY > 1 ? omez(y - (dy / presahY) * 100) : y,
    });
  }

  return (
    <div className="mt-4">
      <p className="font-bold">Výřez — co z fotky bude na webu vidět</p>

      <div
        ref={ramecek}
        role="slider"
        tabIndex={0}
        aria-label="Výřez fotky — chyťte ji a táhněte, nebo posouvejte šipkami"
        aria-valuetext={`vodorovně ${x} %, svisle ${y} %`}
        aria-valuenow={x}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`rounded-dlazdice bg-seda relative mt-2 w-full max-w-[320px] touch-none overflow-hidden select-none ${
          tahne ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ aspectRatio: POMERY[varianta] ?? "4 / 3" }}
        onPointerDown={(e) => {
          // Zachycení ukazatele: tažení pokračuje, i když kurzor vyjede ven.
          e.currentTarget.setPointerCapture(e.pointerId);
          nastavTahne(true);
        }}
        onPointerMove={(e) => {
          if (!tahne) return;
          posun(e.movementX, e.movementY);
        }}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          nastavTahne(false);
        }}
        onPointerCancel={() => nastavTahne(false)}
        onKeyDown={(e) => {
          const smer: Record<string, [number, number]> = {
            ArrowLeft: [-KROK, 0],
            ArrowRight: [KROK, 0],
            ArrowUp: [0, -KROK],
            ArrowDown: [0, KROK],
          };
          const krok = smer[e.key];
          if (!krok) return;

          e.preventDefault();
          // Šipky posouvají ohnisko přímo v procentech — přepočet přes pixely
          // by u klávesnice nedával smysl.
          ulozPozici({ x: omez(x + krok[0]), y: omez(y + krok[1]) });
        }}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="320px"
          className="pointer-events-none object-cover"
          // Stejný výpočet jako na webu, aby náhled souhlasil s výsledkem.
          style={stylVyrezu(aktualni, priblizeni)}
          onLoad={(e) => {
            const img = e.currentTarget;
            pomerFotky.current = img.naturalWidth / img.naturalHeight;
          }}
        />
      </div>

      <p className="text-text-doplnek mt-2 text-[1.0625rem]">
        Chyťte fotku a posuňte ji, kam potřebujete; jde to i šipkami na
        klávesnici. Ukládá se jen výřez — samotná fotka zůstává celá.
      </p>

      <div className="mt-4 max-w-[320px]">
        <label htmlFor={id} className="flex items-baseline justify-between font-bold">
          <span>Přiblížení</span>
          <span className="text-text-doplnek text-[1.0625rem]">
            {priblizeni === VYCHOZI_ZOOM ? "beze změny" : `${priblizeni.toFixed(1)}×`}
          </span>
        </label>
        <input
          id={id}
          type="range"
          min={VYCHOZI_ZOOM}
          max={MAX_ZOOM}
          step={0.05}
          value={priblizeni}
          onChange={(e) => ulozZoom(parseFloat(e.target.value))}
          className="accent-azurova mt-2 w-full"
        />
        <p className="text-text-doplnek mt-1 text-[1.0625rem]">
          Vlevo je fotka tak, jak se do rámečku vejde — menší už být nemůže,
          jinak by po stranách zbylo prázdné místo.
        </p>
      </div>

      {!naStredu ? (
        <button
          type="button"
          onClick={naStred}
          className="klik rounded-tlacitko bg-linka hover:bg-seda mt-3 px-5 text-[1.0625rem] font-bold transition-colors duration-150"
        >
          Vrátit na střed
        </button>
      ) : null}
    </div>
  );
}

function omez(hodnota: number): number {
  return Math.min(100, Math.max(0, Math.round(hodnota)));
}
