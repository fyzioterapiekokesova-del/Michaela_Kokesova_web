"use client";

import { useEffect, useState, useTransition } from "react";
import { ulozSekci, type StavUlozeni } from "@/app/admin/akce/obsah";
import type { Sekce } from "@/lib/admin/obsah-schema";
import { SadaPoli } from "./sada-poli";
import type { Hodnoty } from "./pole";

/**
 * Formulář jedné sekce obsahu.
 *
 * Každá sekce má vlastní tlačítko Uložit — nikdy se neukládá celý web
 * najednou. Odesílá se celý obsah sekce jako JSON; co s ním smí být uloženo,
 * rozhoduje schéma na serveru.
 *
 * Čtyři stavy jako u kontaktního formuláře: prázdný · chyba u konkrétního
 * pole · ukládá se (tlačítko zablokované) · uloženo.
 *
 * Tlačítko Uložit je v liště přilepené ke spodku okna. U dlouhé sekce
 * (ceník, dotazy) by jinak bylo až na konci a nebylo by poznat, jestli
 * je vůbec co ukládat.
 */

type Vlastnosti = {
  sekce: Sekce;
  vychozi: Hodnoty;
  /** Plná adresa stránky, na které se sekce zobrazuje. */
  naWebu: string;
};

const VAROVANI_ODCHODU =
  "Máte neuložené změny. Když odejdete, ztratí se. Opravdu odejít?";

/** Chyby ze serveru přijdou s cestou k poli — tady se z nich udělá mapa. */
function podleCesty(stav: StavUlozeni): Record<string, string> {
  if (stav.stav !== "chyba" || !stav.chyby) return {};
  const mapa: Record<string, string> = {};
  for (const chyba of stav.chyby) mapa[chyba.cesta] ??= chyba.zprava;
  return mapa;
}

/**
 * Varování před odchodem s neuloženými změnami.
 *
 * `beforeunload` pokryje zavření karty a obnovení stránky. Odkazy uvnitř
 * administrace ale přecházejí bez načtení stránky a ten by je nezachytil —
 * proto ještě hlídání kliknutí na odkazy.
 */
function useHlidaniOdchodu(neulozeno: boolean) {
  useEffect(() => {
    if (!neulozeno) return;

    function predZavrenim(e: BeforeUnloadEvent) {
      e.preventDefault();
    }

    function predKliknutim(e: MouseEvent) {
      const odkaz = (e.target as Element | null)?.closest?.("a[href]");
      if (!(odkaz instanceof HTMLAnchorElement)) return;
      // Nová karta rozdělanou práci neohrozí.
      if (odkaz.target === "_blank" || odkaz.hasAttribute("download")) return;
      if (!window.confirm(VAROVANI_ODCHODU)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    window.addEventListener("beforeunload", predZavrenim);
    document.addEventListener("click", predKliknutim, true);
    return () => {
      window.removeEventListener("beforeunload", predZavrenim);
      document.removeEventListener("click", predKliknutim, true);
    };
  }, [neulozeno]);
}

export function FormularSekce({ sekce, vychozi, naWebu }: Vlastnosti) {
  const [ulozene, setUlozene] = useState<Hodnoty>(vychozi);
  const [hodnoty, setHodnoty] = useState<Hodnoty>(vychozi);
  const [stav, setStav] = useState<StavUlozeni>({ stav: "prazdno" });
  const [ukladase, zacniUkladat] = useTransition();
  // Po „Zahodit změny" se pole vykreslí znovu. Některá (výřez fotky) si
  // drží vlastní stav a bez toho by ukazovala zahozenou hodnotu.
  const [verze, setVerze] = useState(0);

  const neulozeno = hodnoty !== ulozene;
  useHlidaniOdchodu(neulozeno);

  const chyby = podleCesty(stav);
  const pocetChyb = stav.stav === "chyba" && stav.chyby ? stav.chyby.length : 0;

  // Po neúspěšném uložení dojet k první chybě — u dlouhé sekce by ji
  // jinak musela hledat.
  useEffect(() => {
    if (pocetChyb === 0) return;
    const prvni = document.querySelector<HTMLElement>(
      '[aria-invalid="true"], [data-chyba]',
    );
    prvni?.scrollIntoView({ block: "center" });
    if (prvni?.matches("input, textarea, select")) prvni.focus({ preventScroll: true });
  }, [stav, pocetChyb]);

  function zmen(jmeno: string, hodnota: unknown) {
    setHodnoty((puvodni) => ({ ...puvodni, [jmeno]: hodnota }));
    // Po zásahu do formuláře už hláška „uloženo" neplatí.
    if (stav.stav === "ulozeno") setStav({ stav: "prazdno" });
  }

  function zahod() {
    setHodnoty(ulozene);
    setStav({ stav: "prazdno" });
    setVerze((v) => v + 1);
  }

  function odesli() {
    const odeslane = hodnoty;
    zacniUkladat(async () => {
      const vysledek = await ulozSekci(sekce.klic, JSON.stringify(odeslane));
      setStav(vysledek);
      // Když mezitím psala dál, novější hodnoty zůstanou jako neuložené.
      if (vysledek.stav === "ulozeno") setUlozene(odeslane);
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        odesli();
      }}
      className="max-w-[64rem]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h1 className="text-2xl font-bold">{sekce.nazev}</h1>
        <a
          href={naWebu}
          target="_blank"
          rel="noopener"
          className="py-1 text-[0.9375rem] font-semibold underline"
          data-akce="admin-zobrazit-na-webu"
        >
          Zobrazit na webu ↗
          <span className="sr-only"> (otevře se v nové kartě)</span>
        </a>
      </div>
      {sekce.popis ? (
        <p className="text-text-doplnek mt-1 max-w-[70ch] text-[0.9375rem]">
          {sekce.popis}
        </p>
      ) : null}
      <p className="text-text-doplnek mt-1 text-sm">Pole s * je potřeba vyplnit.</p>

      <div key={verze} className="mt-5 space-y-4">
        <SadaPoli
          pola={sekce.pole}
          hodnoty={hodnoty}
          cesta=""
          chyby={chyby}
          klicSekce={sekce.klic}
          zmen={zmen}
        />
      </div>

      {/* Lišta s ukládáním, přilepená ke spodku okna, ať je vždycky po ruce. */}
      <div className="border-linka sticky bottom-0 z-10 -mx-4 mt-5 border-t bg-white px-4 py-3 shadow-[0_-4px_12px_rgb(0_0_0/0.06)] sm:mx-0 sm:rounded-t-lg sm:border-x">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="submit"
            disabled={ukladase || !neulozeno}
            data-akce="admin-ulozit"
            className="bg-azurova text-text hover:bg-text hover:text-azurova disabled:hover:bg-azurova disabled:hover:text-text inline-flex h-11 items-center justify-center rounded-md px-6 font-bold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ukladase ? "Ukládá se…" : "Uložit změny"}
          </button>

          {neulozeno && !ukladase ? (
            <button
              type="button"
              onClick={zahod}
              className="py-2 text-[0.9375rem] underline"
            >
              Zahodit změny
            </button>
          ) : null}

          <div aria-live="polite" className="text-[0.9375rem]">
            {stav.stav === "chyba" && stav.zprava ? (
              <p className="text-chyba font-bold">{stav.zprava}</p>
            ) : pocetChyb > 0 ? (
              <p className="text-chyba font-bold">
                {pocetChyb === 1
                  ? "Neuloženo — jedno pole je potřeba opravit. Hláška je u něj."
                  : `Neuloženo — ${pocetChyb} pole je potřeba opravit. Hlášky jsou u nich.`}
              </p>
            ) : stav.stav === "ulozeno" && !neulozeno ? (
              <p className="font-bold">
                Uloženo, na webu už to je.{" "}
                <a href={naWebu} target="_blank" rel="noopener" className="underline">
                  Podívat se
                  <span className="sr-only"> (otevře se v nové kartě)</span>
                </a>
              </p>
            ) : neulozeno ? (
              <p className="font-bold">Máte neuložené změny.</p>
            ) : (
              <p className="text-text-doplnek">Zatím žádné změny.</p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
