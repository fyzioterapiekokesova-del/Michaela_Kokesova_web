"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { MENU, type PolozkaMenu } from "@/lib/navigace";
import { telHref, telText } from "@/lib/kontakt";

/**
 * Hlavička a navigace.
 *
 * Telefon je hlavní akce celého webu, proto je hlavička přilepená nahoře
 * a na mobilu je pod ní pruh se Zavolat, který zůstává i po otevření menu.
 *
 * „Služby" nemají vlastní stránku, takže to není odkaz, ale tlačítko
 * s `aria-expanded`. Klepnutí něco viditelně udělá — u pouhého spouštěče,
 * který se rozbalí a hned sbalí, člověk neví, co se stalo.
 */

type Vlastnosti = {
  /** Telefon z obsahu. Bez něj se pruh ani odkaz nevykreslí. */
  telefon?: string;
};

export function Hlavicka({ telefon }: Vlastnosti) {
  const cesta = usePathname();
  const [menuOtevrene, setMenuOtevrene] = useState(false);

  // Přechod na jinou stránku zavře menu, aby nezůstalo viset přes obsah.
  // Dopočítává se při vykreslení, ne v efektu — jinak by stránka nejdřív
  // problikla s otevřeným menu a teprve pak ho zavřela.
  const [predchoziCesta, setPredchoziCesta] = useState(cesta);
  if (cesta !== predchoziCesta) {
    setPredchoziCesta(cesta);
    setMenuOtevrene(false);
  }

  return (
    <header className="border-azurova sticky top-0 z-50 border-b-[3px]">
      <div className="bg-povrch">
        <div className="obal flex min-h-[88px] items-center justify-between gap-6 py-3">
          <Znacka />

          {/* Počítač */}
          <div className="hidden items-center gap-8 lg:flex">
            <nav aria-label="Hlavní nabídka">
              <ul className="flex list-none items-center gap-1">
                {MENU.map((polozka) => (
                  <li key={polozka.nazev}>
                    <PolozkaPocitac polozka={polozka} cesta={cesta} />
                  </li>
                ))}
              </ul>
            </nav>
            {telefon ? (
              <a
                href={telHref(telefon)}
                data-akce="telefon-hlavicka"
                className="klik text-odkaz-pc shrink-0 font-extrabold"
              >
                {telText(telefon)}
              </a>
            ) : null}
          </div>

          {/* Mobil a tablet */}
          <button
            type="button"
            aria-expanded={menuOtevrene}
            aria-controls="hlavni-menu"
            onClick={() => setMenuOtevrene((o) => !o)}
            className="rounded-polozka -mr-2 flex size-12 shrink-0 items-center justify-center lg:hidden"
          >
            <span className="sr-only">
              {menuOtevrene ? "Zavřít nabídku" : "Otevřít nabídku"}
            </span>
            <Hamburger otevrene={menuOtevrene} />
          </button>
        </div>
      </div>

      {/* Pruh s telefonem — nejdůležitější prvek celého webu.
          Bez rádiusu, přes celou šířku, zůstává i po otevření menu. */}
      {telefon ? (
        <a
          href={telHref(telefon)}
          data-akce="telefon-pruh"
          className="bg-azurova text-text text-tlacitko flex min-h-[var(--spacing-klik)] items-center justify-center py-3 text-center font-extrabold lg:hidden"
        >
          Zavolat {telText(telefon)}
        </a>
      ) : null}

      {menuOtevrene ? (
        <MenuMobil cesta={cesta} zavrit={() => setMenuOtevrene(false)} />
      ) : null}
    </header>
  );
}

function Znacka() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-3 leading-tight"
      aria-label="Úvodní stránka"
    >
      {/* Z loga se bere jen značka. Jméno je uvnitř obrázku vysázené tak
          drobně, že by v hlavičce vyšlo na osm pixelů — proto se sází
          písmem webu a zůstane ostré. */}
      <Image
        src="/logo/znacka.webp"
        alt=""
        aria-hidden
        width={298}
        height={200}
        priority
        className="h-11 w-auto lg:h-14"
      />
      <span>
        <span className="text-h3 lg:text-h3-pc block">Michaela Kokešová</span>
        <span className="text-stitek lg:text-stitek-pc text-text-doplnek block uppercase">
          fyzioterapie · podologie
        </span>
      </span>
    </Link>
  );
}

function Hamburger({ otevrene }: { otevrene: boolean }) {
  return (
    <span aria-hidden className="relative block h-[15px] w-6">
      <span
        className={`bg-text absolute left-0 block h-[3px] w-6 transition-all duration-150 ${
          otevrene ? "top-1.5 rotate-45" : "top-0"
        }`}
      />
      <span
        className={`bg-text absolute top-1.5 left-0 block h-[3px] w-6 transition-opacity duration-150 ${
          otevrene ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`bg-text absolute left-0 block h-[3px] w-6 transition-all duration-150 ${
          otevrene ? "top-1.5 -rotate-45" : "top-3"
        }`}
      />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Počítač                                                                    */
/* -------------------------------------------------------------------------- */

function PolozkaPocitac({
  polozka,
  cesta,
}: {
  polozka: PolozkaMenu;
  cesta: string;
}) {
  if (polozka.druh === "rozbaleni") {
    return <Rozbaleni polozka={polozka} cesta={cesta} />;
  }

  if (polozka.druh === "tlacitko") {
    return (
      <Link
        href={polozka.href}
        data-akce="kontakt-menu"
        className="bg-azurova border-azurova text-text klik text-odkaz-pc rounded-tlacitko ml-2 border-2 px-5 font-extrabold transition-colors duration-150 hover:bg-transparent"
      >
        {polozka.nazev}
      </Link>
    );
  }

  const aktivni = cesta === polozka.href;
  return (
    <Link
      href={polozka.href}
      aria-current={aktivni ? "page" : undefined}
      className={`klik text-odkaz-pc rounded-polozka px-3 transition-colors duration-150 ${
        aktivni
          ? "border-azurova border-b-[3px] font-extrabold"
          : "hover:bg-plocha font-bold"
      }`}
    >
      {polozka.nazev}
    </Link>
  );
}

function Rozbaleni({
  polozka,
  cesta,
}: {
  polozka: Extract<PolozkaMenu, { druh: "rozbaleni" }>;
  cesta: string;
}) {
  const [otevrene, setOtevrene] = useState(false);
  const obal = useRef<HTMLDivElement>(null);
  const spoustec = useRef<HTMLButtonElement>(null);
  const idPanelu = useId();

  const aktivni = polozka.polozky.some((s) => s.href === cesta);

  // Zavře se Escapem a ohnisko se vrátí na spouštěč.
  useEffect(() => {
    if (!otevrene) return;

    function naKlavesu(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOtevrene(false);
        spoustec.current?.focus();
      }
    }
    function naKliknuti(e: MouseEvent) {
      if (!obal.current?.contains(e.target as Node)) setOtevrene(false);
    }
    // Odchod tabulátorem mimo nabídku ji taky zavře.
    function naOhnisko(e: FocusEvent) {
      if (!obal.current?.contains(e.target as Node)) setOtevrene(false);
    }

    document.addEventListener("keydown", naKlavesu);
    document.addEventListener("mousedown", naKliknuti);
    document.addEventListener("focusin", naOhnisko);
    return () => {
      document.removeEventListener("keydown", naKlavesu);
      document.removeEventListener("mousedown", naKliknuti);
      document.removeEventListener("focusin", naOhnisko);
    };
  }, [otevrene]);

  return (
    <div
      ref={obal}
      className="relative"
      onMouseEnter={() => setOtevrene(true)}
      onMouseLeave={() => setOtevrene(false)}
    >
      <button
        ref={spoustec}
        type="button"
        aria-expanded={otevrene}
        aria-controls={idPanelu}
        onClick={() => setOtevrene((o) => !o)}
        className={`klik text-odkaz-pc rounded-polozka gap-2 px-3 transition-colors duration-150 ${
          aktivni
            ? "border-azurova border-b-[3px] font-extrabold"
            : "hover:bg-plocha font-bold"
        }`}
      >
        {polozka.nazev}
        <span
          aria-hidden
          className={`border-text mb-1 inline-block size-[9px] border-t-[3px] border-r-[3px] transition-transform duration-150 ${
            otevrene ? "-rotate-45" : "rotate-135"
          }`}
        />
      </button>

      <div
        id={idPanelu}
        hidden={!otevrene}
        className="bg-povrch rounded-tlacitko absolute top-full left-0 mt-2 w-max min-w-64 p-2 shadow-[0_18px_40px_rgba(46,48,45,.14)]"
      >
        <ul className="list-none">
          {polozka.polozky.map((sluzba) => (
            <li key={sluzba.href}>
              <Link
                href={sluzba.href}
                aria-current={cesta === sluzba.href ? "page" : undefined}
                className="klik rounded-polozka text-odkaz hover:bg-plocha w-full px-4 font-bold transition-colors duration-150"
              >
                {sluzba.nazev}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mobil                                                                      */
/* -------------------------------------------------------------------------- */

function MenuMobil({ cesta, zavrit }: { cesta: string; zavrit: () => void }) {
  // Escape zavírá i na mobilu — na tabletu s klávesnicí to lidé používají.
  useEffect(() => {
    function naKlavesu(e: KeyboardEvent) {
      if (e.key === "Escape") zavrit();
    }
    document.addEventListener("keydown", naKlavesu);
    return () => document.removeEventListener("keydown", naKlavesu);
  }, [zavrit]);

  return (
    <nav
      id="hlavni-menu"
      aria-label="Hlavní nabídka"
      className="bg-povrch border-linka border-t lg:hidden"
    >
      <ul className="obal list-none py-2">
        {MENU.map((polozka) => {
          if (polozka.druh === "rozbaleni") {
            // Na mobilu se nic nerozbaluje — služby jsou vidět rovnou.
            return (
              <li key={polozka.nazev}>
                <p className="text-stitek text-text-doplnek px-1 pt-4 pb-1 uppercase">
                  {polozka.nazev}
                </p>
                <ul className="list-none">
                  {polozka.polozky.map((sluzba) => (
                    <li key={sluzba.href}>
                      <Link
                        href={sluzba.href}
                        aria-current={cesta === sluzba.href ? "page" : undefined}
                        className="klik text-odkaz border-linka w-full border-b pl-5 font-bold"
                      >
                        {sluzba.nazev}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          }

          if (polozka.druh === "tlacitko") {
            return (
              <li key={polozka.nazev} className="pt-4 pb-2">
                <Link
                  href={polozka.href}
                  data-akce="kontakt-menu"
                  className="bg-azurova border-azurova text-text klik text-odkaz rounded-tlacitko w-full justify-center border-2 font-extrabold"
                >
                  {polozka.nazev}
                </Link>
              </li>
            );
          }

          return (
            <li key={polozka.nazev}>
              <Link
                href={polozka.href}
                aria-current={cesta === polozka.href ? "page" : undefined}
                className={`klik text-odkaz border-linka w-full border-b px-1 ${
                  cesta === polozka.href ? "font-extrabold" : "font-bold"
                }`}
              >
                {polozka.nazev}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
