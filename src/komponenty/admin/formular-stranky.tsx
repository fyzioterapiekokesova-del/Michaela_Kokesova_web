"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { ulozSekci } from "@/app/admin/akce/obsah";
import type { Sekce } from "@/lib/admin/obsah-schema";
import type { Stranka } from "@/lib/navigace";
import { SadaPoli } from "./sada-poli";
import { CileOdkazu, type Hodnoty } from "./pole";

/**
 * Formulář jedné stránky administrace.
 *
 * Stránka může mít víc sekcí — úvodní stránka jich má šest a upravují se
 * pohromadě, pod sebou, jak jdou na webu. Tlačítko Uložit je jedno a uloží
 * jen sekce, ve kterých se něco změnilo. Na serveru se každá sekce dál
 * ukládá a ověřuje zvlášť; co s ní smí být uloženo, rozhoduje schéma.
 *
 * Čtyři stavy jako u kontaktního formuláře: prázdný · chyba u konkrétního
 * pole · ukládá se (tlačítko zablokované) · uloženo.
 *
 * Tlačítko Uložit je v liště přilepené ke spodku okna. U dlouhé stránky
 * by jinak bylo až na konci a nebylo by poznat, jestli je co ukládat.
 */

type Vlastnosti = {
  nazev: string;
  popis?: string;
  /** Upozornění pod nadpisem, např. že je služba skrytá. */
  upozorneni?: ReactNode;
  sekce: readonly Sekce[];
  /** Uložené hodnoty podle klíče sekce. */
  vychozi: Record<string, Hodnoty>;
  /** Plná adresa stránky na webu. */
  naWebu: string;
  /** Stránky, na které smí vést odkazy (výběr u „Co vás trápí"). */
  cile: readonly Stranka[];
};

type Stav = "prazdno" | "ulozeno" | "chyba";

const VAROVANI_ODCHODU =
  "Máte neuložené změny. Když odejdete, ztratí se. Opravdu odejít?";

/**
 * Varování před odchodem s neuloženými změnami.
 *
 * `beforeunload` pokryje zavření karty a obnovení stránky. Odkazy uvnitř
 * administrace ale přecházejí bez načtení stránky a ten by je nezachytil —
 * proto ještě hlídání kliknutí na odkazy.
 */
export function useHlidaniOdchodu(neulozeno: boolean) {
  useEffect(() => {
    if (!neulozeno) return;

    function predZavrenim(e: BeforeUnloadEvent) {
      e.preventDefault();
    }

    function predKliknutim(e: MouseEvent) {
      const odkaz = (e.target as Element | null)?.closest?.("a[href]");
      if (!(odkaz instanceof HTMLAnchorElement)) return;
      // Nová karta ani skok na kotvu na téže stránce práci neohrozí.
      if (odkaz.target === "_blank" || odkaz.hasAttribute("download")) return;
      if (odkaz.getAttribute("href")?.startsWith("#")) return;
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

export function FormularStranky({
  nazev,
  popis,
  upozorneni,
  sekce,
  vychozi,
  naWebu,
  cile,
}: Vlastnosti) {
  const [ulozene, setUlozene] = useState(vychozi);
  const [hodnoty, setHodnoty] = useState(vychozi);
  const [stav, setStav] = useState<Stav>("prazdno");
  const [zprava, setZprava] = useState<string>();
  // Chyby u polí podle sekce: { hero: { "nadpis": "Vyplňte…" } }.
  const [chyby, setChyby] = useState<Record<string, Record<string, string>>>({});
  const [ukladase, zacniUkladat] = useTransition();
  // Po „Zahodit změny" se pole vykreslí znovu. Některá (výřez fotky) si
  // drží vlastní stav a bez toho by ukazovala zahozenou hodnotu.
  const [verze, setVerze] = useState(0);

  const zmenene = sekce.filter((s) => hodnoty[s.klic] !== ulozene[s.klic]);
  const neulozeno = zmenene.length > 0;
  useHlidaniOdchodu(neulozeno);

  const pocetChyb = Object.values(chyby).reduce(
    (soucet, c) => soucet + Object.keys(c).length,
    0,
  );
  const vic = sekce.length > 1;

  // Po neúspěšném uložení dojet k první chybě — u dlouhé stránky by ji
  // jinak musela hledat.
  useEffect(() => {
    if (pocetChyb === 0) return;
    const prvni = document.querySelector<HTMLElement>(
      '[aria-invalid="true"], [data-chyba]',
    );
    prvni?.scrollIntoView({ block: "center" });
    if (prvni?.matches("input, textarea, select")) prvni.focus({ preventScroll: true });
  }, [chyby, pocetChyb]);

  function zmenVSekci(klic: string) {
    return (jmeno: string, hodnota: unknown) => {
      setHodnoty((puvodni) => ({
        ...puvodni,
        [klic]: { ...puvodni[klic], [jmeno]: hodnota },
      }));
      // Po zásahu do formuláře už hláška „uloženo" neplatí.
      setStav((s) => (s === "ulozeno" ? "prazdno" : s));
    };
  }

  function zahod() {
    setHodnoty(ulozene);
    setChyby({});
    setZprava(undefined);
    setStav("prazdno");
    setVerze((v) => v + 1);
  }

  function odesli() {
    const odeslane = hodnoty;
    const kUlozeni = zmenene.map((s) => s.klic);

    zacniUkladat(async () => {
      const nyniUlozene: Record<string, Hodnoty> = {};
      const noveChyby: Record<string, Record<string, string>> = {};
      let obecna: string | undefined;

      // Postupně, ne naráz: při výpadku spojení je jasné, co prošlo.
      for (const klic of kUlozeni) {
        let vysledek;
        try {
          vysledek = await ulozSekci(klic, JSON.stringify(odeslane[klic]));
        } catch {
          obecna = "Spojení se serverem se přerušilo. Zkuste to prosím znovu.";
          break;
        }
        if (vysledek.stav === "ulozeno") {
          nyniUlozene[klic] = odeslane[klic];
        } else if (vysledek.stav === "chyba") {
          if (vysledek.zprava) obecna = vysledek.zprava;
          const mapa: Record<string, string> = {};
          for (const ch of vysledek.chyby ?? []) mapa[ch.cesta] ??= ch.zprava;
          noveChyby[klic] = mapa;
        }
      }

      // Když mezitím psala dál, novější hodnoty zůstanou jako neuložené.
      setUlozene((puvodni) => ({ ...puvodni, ...nyniUlozene }));
      setChyby(noveChyby);
      setZprava(obecna);
      setStav(obecna || Object.keys(noveChyby).length > 0 ? "chyba" : "ulozeno");
    });
  }

  return (
    <CileOdkazu value={cile}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          odesli();
        }}
        className="max-w-[64rem]"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h1 className="text-2xl font-bold">{nazev}</h1>
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
        {popis ? (
          <p className="text-text-doplnek mt-1 max-w-[70ch] text-[0.9375rem]">{popis}</p>
        ) : null}
        {upozorneni}
        <p className="text-text-doplnek mt-1 text-sm">Pole s * je potřeba vyplnit.</p>

        {/* Rozcestník po stránce — úvodní stránka je dlouhá. */}
        {vic ? (
          <nav aria-label="Části stránky" className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {sekce.map((s) => (
              <a key={s.klic} href={`#${s.klic}`} className="underline">
                {s.kratce ?? s.nazev}
              </a>
            ))}
          </nav>
        ) : null}

        <div key={verze} className="mt-5 space-y-4">
          {sekce.map((s) => {
            const pole = (
              <SadaPoli
                pola={s.pole}
                hodnoty={hodnoty[s.klic] ?? {}}
                cesta=""
                chyby={chyby[s.klic] ?? {}}
                klicSekce={s.klic}
                zmen={zmenVSekci(s.klic)}
                vnorene={vic}
              />
            );
            if (!vic) return <div key={s.klic} className="space-y-4">{pole}</div>;
            return (
              <section key={s.klic} id={s.klic} className="scroll-mt-4 space-y-4 pt-4">
                <div>
                  <h2 className="text-xl font-bold">{s.nazev}</h2>
                  {s.popis ? (
                    <p className="text-text-doplnek text-sm">{s.popis}</p>
                  ) : null}
                </div>
                {pole}
              </section>
            );
          })}
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
              <button type="button" onClick={zahod} className="py-2 text-[0.9375rem] underline">
                Zahodit změny
              </button>
            ) : null}

            <div aria-live="polite" className="text-[0.9375rem]">
              {stav === "chyba" && zprava ? (
                <p className="text-chyba font-bold">{zprava}</p>
              ) : stav === "chyba" && pocetChyb > 0 ? (
                <p className="text-chyba font-bold">
                  {pocetChyb === 1
                    ? "Neuloženo — jedno pole je potřeba opravit. Hláška je u něj."
                    : `Neuloženo — ${pocetChyb} pole je potřeba opravit. Hlášky jsou u nich.`}
                </p>
              ) : stav === "ulozeno" && !neulozeno ? (
                <p className="font-bold">
                  Uloženo, na webu už to je.{" "}
                  <a href={naWebu} target="_blank" rel="noopener" className="underline">
                    Podívat se
                    <span className="sr-only"> (otevře se v nové kartě)</span>
                  </a>
                </p>
              ) : neulozeno ? (
                <p className="font-bold">
                  Máte neuložené změny
                  {vic ? ` (${zmenene.map((s) => s.kratce ?? s.nazev).join(", ")})` : ""}.
                </p>
              ) : (
                <p className="text-text-doplnek">Zatím žádné změny.</p>
              )}
            </div>
          </div>
        </div>
      </form>
    </CileOdkazu>
  );
}
