"use client";

import { useId, useState, type CSSProperties } from "react";
import type { Pole } from "@/lib/admin/obsah-schema";
import { PoleFormulare, TLACITKO, type Hodnoty } from "./pole";

/**
 * Sada polí a seznamy položek.
 *
 * Volá se rekurzivně: seznam obsahuje položky a položka může obsahovat další
 * seznam (ceník má oblasti a v nich položky). Proto jsou obě komponenty
 * v jednom souboru — odkazují na sebe navzájem.
 *
 * Na nejvyšší úrovni sekce se pole skládají do bloků podle `skupina` ze
 * schématu a technická nastavení (`dalsi`) se schovají do sbaleného bloku
 * na konci. Dlouhá sekce se tak čte po kouscích.
 *
 * Položky se párují přes skryté `_id`, ne přes pořadí. Kdyby se párovalo
 * pořadím, přehození dvou fotek by přehodilo i jejich cesty.
 */

type SpolecneVlastnosti = {
  hodnoty: Hodnoty;
  cesta: string;
  chyby: Record<string, string>;
  klicSekce: string;
  zmen: (jmeno: string, hodnota: unknown) => void;
};

const KARTA = "border-linka rounded-lg border bg-white p-4 sm:p-5";
const NADPIS_KARTY = "text-lg font-bold";

function cestaPole(cesta: string, jmeno: string): string {
  return cesta ? `${cesta}.${jmeno}` : jmeno;
}

/** Má pole (nebo cokoli pod ním) chybu ze serveru? */
function maChybu(chyby: Record<string, string>, cesta: string): boolean {
  return Object.keys(chyby).some(
    (k) => k === cesta || k.startsWith(`${cesta}.`) || k.startsWith(`${cesta}[`),
  );
}

export function SadaPoli({
  pola,
  ...zbytek
}: SpolecneVlastnosti & { pola: readonly Pole[] }) {
  return zbytek.cesta === "" ? (
    <Bloky pola={pola} {...zbytek} />
  ) : (
    <MrizkaPoli pola={pola} {...zbytek} />
  );
}

/* -------------------------------------------------------------------------- */
/*  Bloky na nejvyšší úrovni sekce                                             */
/* -------------------------------------------------------------------------- */

type Blok = { klic: string; nadpis?: string; pola: Pole[] };

/** Sousední pole se stejnou skupinou jdou do jednoho bloku. */
function rozdelNaBloky(pola: readonly Pole[]): Blok[] {
  const bloky: Blok[] = [];
  for (const pole of pola) {
    const klic =
      pole.skupina ?? (pole.druh === "seznam" ? `seznam:${pole.jmeno}` : "bez-skupiny");
    const posledni = bloky.at(-1);
    if (posledni && posledni.klic === klic) posledni.pola.push(pole);
    else bloky.push({ klic, nadpis: pole.skupina, pola: [pole] });
  }
  return bloky;
}

/** Sbalený blok — na co se sahá jen občas. Při chybě uvnitř se rozbalí sám. */
function SbalenyBlok({
  nadpis,
  napoveda,
  pola,
  ...zbytek
}: SpolecneVlastnosti & { nadpis: string; napoveda?: string; pola: readonly Pole[] }) {
  const chyba = pola.some((p) => maChybu(zbytek.chyby, p.jmeno));
  return (
    <details className={KARTA} open={chyba || undefined}>
      <summary className={`${NADPIS_KARTY} cursor-pointer`}>
        {nadpis}
        <span className="text-text-doplnek ml-2 text-sm font-normal underline">
          zobrazit
        </span>
      </summary>
      {napoveda ? <p className="text-text-doplnek mt-1 text-sm">{napoveda}</p> : null}
      <MrizkaPoli pola={pola} {...zbytek} />
    </details>
  );
}

function Bloky({
  pola,
  ...zbytek
}: SpolecneVlastnosti & { pola: readonly Pole[] }) {
  const hlavni = pola.filter((p) => !p.dalsi);
  const dalsi = pola.filter((p) => p.dalsi);

  return (
    <>
      {rozdelNaBloky(hlavni).map((blok, i) => {
        const [prvni] = blok.pola;
        // Samotný seznam bez skupiny: nadpisem bloku je nadpis seznamu.
        if (!blok.nadpis && blok.pola.length === 1 && prvni.druh === "seznam") {
          return (
            <div key={i} className={KARTA}>
              <SeznamPolozek pole={prvni} bezRamecku {...zbytek} />
            </div>
          );
        }
        if (blok.nadpis && prvni.sbalenaSkupina) {
          return (
            <SbalenyBlok key={i} nadpis={blok.nadpis} pola={blok.pola} {...zbytek} />
          );
        }
        return (
          <section key={i} className={KARTA}>
            {blok.nadpis ? <h2 className={NADPIS_KARTY}>{blok.nadpis}</h2> : null}
            <MrizkaPoli
              pola={blok.pola}
              className={blok.nadpis ? "" : "-mt-4"}
              {...zbytek}
            />
          </section>
        );
      })}

      {dalsi.length > 0 ? (
        <SbalenyBlok
          nadpis="Další nastavení"
          napoveda="Nastavuje se jednou, běžně sem sahat nemusíte."
          pola={dalsi}
          {...zbytek}
        />
      ) : null}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pole v mřížce                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Pole pod sebou; krátká (`sirka: "pul"`) na počítači po dvou vedle sebe.
 *
 * Popisky fotek se tu přeskakují — vykreslí je fotka sama, hned pod
 * náhledem, aby bylo jasné, ke které fotce patří.
 */
function MrizkaPoli({
  pola,
  className = "",
  ...zbytek
}: SpolecneVlastnosti & { pola: readonly Pole[]; className?: string }) {
  const popiskyFotek = new Set(
    pola.flatMap((p) => (p.druh === "obrazek" ? [p.popisPole] : [])),
  );

  return (
    <div className={`grid gap-x-4 md:grid-cols-2 ${className}`}>
      {pola
        .filter((p) => !popiskyFotek.has(p.jmeno))
        .map((pole) => (
          <div key={pole.jmeno} className={pole.sirka === "pul" ? "" : "md:col-span-2"}>
            {pole.druh === "seznam" ? (
              <SeznamPolozek pole={pole} {...zbytek} />
            ) : (
              <PoleFormulare
                pole={pole}
                hodnoty={zbytek.hodnoty}
                cesta={cestaPole(zbytek.cesta, pole.jmeno)}
                chyby={zbytek.chyby}
                klicSekce={zbytek.klicSekce}
                zmen={zbytek.zmen}
                popisFotky={
                  pole.druh === "obrazek"
                    ? pola.find((p) => p.jmeno === pole.popisPole)
                    : undefined
                }
              />
            )}
          </div>
        ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Seznamy                                                                    */
/* -------------------------------------------------------------------------- */

type Polozka = Hodnoty & { _id: string };

function polozkySeznamu(hodnoty: Hodnoty, jmeno: string): Polozka[] {
  const h = hodnoty[jmeno];
  if (!Array.isArray(h)) return [];
  return h
    .filter((p): p is Hodnoty => typeof p === "object" && p !== null && !Array.isArray(p))
    .map((p, i) => ({
      ...p,
      // Náhradní `_id` musí být stejné při každém vykreslení — náhodné by
      // položku pokaždé vyrobilo znovu a rozbalená by se sama zavřela.
      // Při první změně se zapíše a dál už se drží položky.
      _id: typeof p._id === "string" && p._id ? p._id : `polozka-${i}`,
    }));
}

function prazdnaPolozka(pola: readonly Pole[]): Polozka {
  const nova: Hodnoty = {};
  for (const pole of pola) {
    switch (pole.druh) {
      case "prepinac":
        nova[pole.jmeno] = pole.vychozi;
        break;
      case "vyber":
        nova[pole.jmeno] = pole.vychozi;
        break;
      case "seznam":
        nova[pole.jmeno] = [];
        break;
      default:
        nova[pole.jmeno] = "";
    }
  }
  return { ...nova, _id: globalThis.crypto.randomUUID() };
}

/** Krátké shrnutí položky do sbaleného řádku a do potvrzení smazání. */
function souhrn(polozka: Hodnoty, pola: readonly Pole[]): string {
  for (const pole of pola) {
    const h = polozka[pole.jmeno];
    if (typeof h !== "string" || h.trim() === "") continue;
    if (pole.druh === "text" || pole.druh === "viceradkovy") {
      const t = h.trim().replace(/\s+/g, " ");
      return t.length > 90 ? `${t.slice(0, 88)}…` : t;
    }
    if (pole.druh === "vyber") {
      return pole.moznosti.find((m) => m.hodnota === h)?.popisek ?? h;
    }
  }
  return "";
}

const IKONA = `${TLACITKO} w-9 px-0`;

function AkcePolozky({
  nazev,
  poradi,
  pocet,
  muzeUbrat,
  presun,
  smaz,
}: {
  nazev: string;
  poradi: number;
  pocet: number;
  muzeUbrat: boolean;
  presun: (kam: -1 | 1) => void;
  smaz: () => void;
}) {
  return (
    <div className="flex shrink-0 gap-1">
      {/* Pořadí se mění šipkami. Tažení myší se na dotykovém zařízení
          ovládá špatně a klávesnicí skoro vůbec. */}
      <button
        type="button"
        onClick={() => presun(-1)}
        disabled={poradi === 0}
        aria-label={`Posunout ${nazev} číslo ${poradi + 1} nahoru`}
        title="Posunout nahoru"
        className={IKONA}
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => presun(1)}
        disabled={poradi === pocet - 1}
        aria-label={`Posunout ${nazev} číslo ${poradi + 1} dolů`}
        title="Posunout dolů"
        className={IKONA}
      >
        ↓
      </button>
      <button
        type="button"
        onClick={smaz}
        disabled={!muzeUbrat}
        aria-label={`Smazat ${nazev} číslo ${poradi + 1}`}
        title="Smazat"
        className={`${IKONA} text-chyba`}
      >
        ✕
      </button>
    </div>
  );
}

function SeznamPolozek({
  pole,
  hodnoty,
  cesta,
  chyby,
  klicSekce,
  zmen,
  bezRamecku,
}: SpolecneVlastnosti & {
  pole: Extract<Pole, { druh: "seznam" }>;
  /** Seznam je sám celým blokem — rámeček kolem dělá blok. */
  bezRamecku?: boolean;
}) {
  const id = useId();
  const [otevrene, setOtevrene] = useState<ReadonlySet<string>>(new Set());

  const polozky = polozkySeznamu(hodnoty, pole.jmeno);
  const cestaSeznamu = cestaPole(cesta, pole.jmeno);
  const chybaSeznamu = chyby[cestaSeznamu];
  const zobrazeni = pole.zobrazeni ?? "rozbalene";
  // Seznam uvnitř položky jiného seznamu (položky ceníku v oblasti).
  // Rámeček už má položka, druhý by byl navíc.
  const vnoreny = cesta.includes("[");

  function uloz(nove: Polozka[]) {
    zmen(pole.jmeno, nove);
  }

  function zmenPolozku(index: number, jmeno: string, hodnota: unknown) {
    uloz(polozky.map((p, i) => (i === index ? { ...p, [jmeno]: hodnota } : p)));
  }

  function presun(index: number, kam: -1 | 1) {
    const cil = index + kam;
    if (cil < 0 || cil >= polozky.length) return;
    const nove = [...polozky];
    [nove[index], nove[cil]] = [nove[cil], nove[index]];
    uloz(nove);
  }

  function smaz(index: number) {
    const co = souhrn(polozky[index], pole.polozka);
    const otazka =
      `Smazat ${pole.nazevPolozky}${co ? ` „${co}“` : ` číslo ${index + 1}`}?` +
      "\n\nDokud sekci neuložíte, jde to vrátit tlačítkem Zahodit změny.";
    if (window.confirm(otazka)) uloz(polozky.filter((_, i) => i !== index));
  }

  function pridej() {
    const nova = prazdnaPolozka(pole.polozka);
    uloz([...polozky, nova]);
    // Nově přidaná položka je rovnou rozbalená, ať se do ní dá psát.
    setOtevrene((puvodni) => new Set(puvodni).add(nova._id));
  }

  function prepni(idPolozky: string) {
    setOtevrene((puvodni) => {
      const dalsi = new Set(puvodni);
      if (!dalsi.delete(idPolozky)) dalsi.add(idPolozky);
      return dalsi;
    });
  }

  const muzePridat = pole.max === undefined || polozky.length < pole.max;
  const muzeUbrat = pole.min === undefined || polozky.length > pole.min;

  function akce(index: number) {
    return (
      <AkcePolozky
        nazev={pole.nazevPolozky}
        poradi={index}
        pocet={polozky.length}
        muzeUbrat={muzeUbrat}
        presun={(kam) => presun(index, kam)}
        smaz={() => smaz(index)}
      />
    );
  }

  function polePolozky(polozka: Polozka, index: number, pola = pole.polozka) {
    return (
      <SadaPoli
        pola={pola}
        hodnoty={polozka}
        cesta={`${cestaSeznamu}[${index}]`}
        chyby={chyby}
        klicSekce={klicSekce}
        zmen={(jmeno, hodnota) => zmenPolozku(index, jmeno, hodnota)}
      />
    );
  }

  // Šířky sloupců tabulky: krátká pole užší, ostatní širší, na konci tlačítka.
  const sloupce =
    pole.polozka
      .map((p) => (p.sirka === "pul" ? "minmax(0,1fr)" : "minmax(0,2fr)"))
      .join(" ") + " auto";

  const [prvniPole, ...ostatniPole] = pole.polozka;

  return (
    <fieldset
      className={
        bezRamecku || vnoreny ? "" : "border-linka mt-4 rounded-md border p-3"
      }
    >
      <legend
        className={
          bezRamecku
            ? NADPIS_KARTY
            : vnoreny
              ? "text-text-doplnek text-sm font-semibold"
              : "px-1 text-[0.9375rem] font-semibold"
        }
      >
        {pole.popisek}
      </legend>

      {pole.napoveda ? (
        <p className="text-text-doplnek mt-1 text-sm">{pole.napoveda}</p>
      ) : null}

      {polozky.length === 0 ? (
        <p className="text-text-doplnek mt-2 text-sm">
          Zatím tu nic není. Přidejte první {pole.nazevPolozky} tlačítkem dole.
        </p>
      ) : null}

      {/* Kontejner: tabulka se rozloží do řádků podle místa, které má,
          ne podle šířky okna — vedle menu je ho míň než celé okno. */}
      <div className="@container">
        {zobrazeni === "tabulka" && polozky.length > 0 ? (
          <div
            aria-hidden
            className="text-text-doplnek mt-2 hidden gap-2 text-sm font-semibold @xl:grid"
            style={{ gridTemplateColumns: sloupce }}
          >
            {pole.polozka.map((p) => (
              <span key={p.jmeno}>{p.popisek}</span>
            ))}
            <span />
          </div>
        ) : null}

        <ol
          className={
            zobrazeni === "mrizka"
              ? "mt-2 grid gap-3 @xl:grid-cols-2"
              : zobrazeni === "sbalene" && polozky.length > 0
                ? "border-linka mt-2 rounded-md border"
                : "mt-1"
          }
        >
          {polozky.map((polozka, index) => {
            const cestaPolozky = `${cestaSeznamu}[${index}]`;

            if (zobrazeni === "tabulka") {
              return (
                <li
                  key={polozka._id}
                  className="border-linka grid gap-2 border-t py-3 first:border-t-0 @xl:items-start @xl:border-t-0 @xl:py-1 @xl:[grid-template-columns:var(--sloupce)]"
                  style={{ "--sloupce": sloupce } as CSSProperties}
                >
                  {pole.polozka.map((p) => (
                    <PoleFormulare
                      key={p.jmeno}
                      pole={p}
                      hodnoty={polozka}
                      cesta={`${cestaPolozky}.${p.jmeno}`}
                      chyby={chyby}
                      klicSekce={klicSekce}
                      zmen={(jmeno, hodnota) => zmenPolozku(index, jmeno, hodnota)}
                      kompaktni
                    />
                  ))}
                  <div className="order-first flex items-center justify-between @xl:order-none">
                    <span className="text-text-doplnek text-sm font-semibold @xl:hidden">
                      {index + 1}.
                    </span>
                    {akce(index)}
                  </div>
                </li>
              );
            }

            if (zobrazeni === "sbalene") {
              const otevrena =
                otevrene.has(polozka._id) || maChybu(chyby, cestaPolozky);
              const idTela = `${id}-${index}`;
              const nadpis = souhrn(polozka, pole.polozka);
              return (
                <li key={polozka._id} className="border-linka border-b last:border-b-0">
                  <div className="flex items-center gap-2 px-3 py-1">
                    <button
                      type="button"
                      onClick={() => prepni(polozka._id)}
                      aria-expanded={otevrena}
                      aria-controls={idTela}
                      className="flex min-w-0 flex-1 items-baseline gap-2 py-1.5 text-left"
                    >
                      <span aria-hidden className="text-text-doplnek w-3 shrink-0">
                        {otevrena ? "▾" : "▸"}
                      </span>
                      <span className="min-w-0 font-semibold">
                        {nadpis || "(zatím bez textu)"}
                      </span>
                      <span className="text-text-doplnek ml-auto shrink-0 pl-2 text-sm underline">
                        {otevrena ? "sbalit" : "upravit"}
                      </span>
                    </button>
                    {akce(index)}
                  </div>
                  {otevrena ? (
                    <div id={idTela} className="px-3 pb-4 sm:pl-8">
                      {polePolozky(polozka, index)}
                    </div>
                  ) : null}
                </li>
              );
            }

            if (zobrazeni === "mrizka") {
              return (
                <li key={polozka._id} className="border-linka rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-text-doplnek text-sm font-semibold">
                      {index + 1}.
                    </span>
                    {akce(index)}
                  </div>
                  {polePolozky(polozka, index)}
                </li>
              );
            }

            // Rozbalené (oblasti ceníku): první pole je název a jde do záhlaví
            // položky vedle tlačítek, zbytek pod něj.
            const nazevVZahlavi = prvniPole?.druh === "text";
            return (
              <li key={polozka._id} className="border-linka mt-3 rounded-md border">
                <div className="bg-plocha @container flex items-end gap-2 rounded-t-md px-3 py-2">
                  <div className="min-w-0 flex-1 font-semibold">
                    {nazevVZahlavi ? (
                      <PoleFormulare
                        pole={prvniPole}
                        hodnoty={polozka}
                        cesta={`${cestaPolozky}.${prvniPole.jmeno}`}
                        chyby={chyby}
                        klicSekce={klicSekce}
                        zmen={(jmeno, hodnota) => zmenPolozku(index, jmeno, hodnota)}
                        kompaktni
                      />
                    ) : (
                      <span>{index + 1}.</span>
                    )}
                  </div>
                  {akce(index)}
                </div>
                <div className="px-3 pb-3">
                  {polePolozky(polozka, index, nazevVZahlavi ? ostatniPole : pole.polozka)}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {chybaSeznamu ? (
        <p data-chyba className="text-chyba mt-2 text-sm font-semibold">
          {chybaSeznamu}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={pridej} disabled={!muzePridat} className={TLACITKO}>
          + Přidat {pole.nazevPolozky}
        </button>
        {!muzePridat ? (
          <span className="text-text-doplnek text-sm">
            Víc než {pole.max} se jich na stránku nevejde.
          </span>
        ) : null}
      </div>
    </fieldset>
  );
}
