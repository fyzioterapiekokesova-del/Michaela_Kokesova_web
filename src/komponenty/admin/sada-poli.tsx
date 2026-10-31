"use client";

import { useId, useState, type CSSProperties } from "react";
import type { Pole } from "@/lib/admin/obsah-schema";
import { PoleFormulare, type Hodnoty } from "./pole";

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

const KARTA = "bg-povrch border-linka rounded-karta border p-5 lg:p-7";

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

function Bloky({
  pola,
  ...zbytek
}: SpolecneVlastnosti & { pola: readonly Pole[] }) {
  const hlavni = pola.filter((p) => !p.dalsi);
  const dalsi = pola.filter((p) => p.dalsi);
  const dalsiMaChybu = dalsi.some((p) => maChybu(zbytek.chyby, p.jmeno));

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
        return (
          <section key={i} className={KARTA}>
            {blok.nadpis ? <h2 className="text-h3">{blok.nadpis}</h2> : null}
            <MrizkaPoli
              pola={blok.pola}
              className={blok.nadpis ? "" : "-mt-6"}
              {...zbytek}
            />
          </section>
        );
      })}

      {dalsi.length > 0 ? (
        <details className={KARTA} open={dalsiMaChybu || undefined}>
          <summary className="cursor-pointer py-2 text-[1.1875rem] font-bold">
            Další nastavení
          </summary>
          <p className="text-text-doplnek mt-1 text-[1.0625rem]">
            Nastavuje se jednou, běžně sem sahat nemusíte.
          </p>
          <MrizkaPoli pola={dalsi} {...zbytek} />
        </details>
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
    <div className={`grid gap-x-6 md:grid-cols-2 ${className}`}>
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

const MALE_TLACITKO =
  "klik rounded-polozka bg-linka hover:bg-seda justify-center font-bold transition-colors duration-150 disabled:opacity-40";

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
    <div className="flex flex-wrap gap-2">
      {/* Pořadí se mění šipkami. Tažení myší se na dotykovém zařízení
          ovládá špatně a klávesnicí skoro vůbec. */}
      <button
        type="button"
        onClick={() => presun(-1)}
        disabled={poradi === 0}
        aria-label={`Posunout ${nazev} číslo ${poradi + 1} nahoru`}
        className={`${MALE_TLACITKO} min-w-12 px-3`}
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => presun(1)}
        disabled={poradi === pocet - 1}
        aria-label={`Posunout ${nazev} číslo ${poradi + 1} dolů`}
        className={`${MALE_TLACITKO} min-w-12 px-3`}
      >
        ↓
      </button>
      <button
        type="button"
        onClick={smaz}
        disabled={!muzeUbrat}
        aria-label={`Smazat ${nazev} číslo ${poradi + 1}`}
        className={`${MALE_TLACITKO} px-4 text-[1.0625rem]`}
      >
        Smazat
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

  function polePolozky(polozka: Polozka, index: number) {
    return (
      <SadaPoli
        pola={pole.polozka}
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

  return (
    <fieldset
      className={bezRamecku ? "" : "border-linka rounded-karta mt-6 border p-4 lg:p-5"}
    >
      <legend className={bezRamecku ? "text-h3" : "px-2 font-bold"}>
        {pole.popisek}
      </legend>

      {pole.napoveda ? (
        <p className="text-text-doplnek mt-2 text-[1.0625rem]">{pole.napoveda}</p>
      ) : null}

      {polozky.length === 0 ? (
        <p className="text-text-doplnek mt-3 text-[1.0625rem]">
          Zatím tu nic není. Přidejte první {pole.nazevPolozky} tlačítkem dole.
        </p>
      ) : null}

      {zobrazeni === "tabulka" && polozky.length > 0 ? (
        <div
          aria-hidden
          className="text-text-doplnek mt-4 hidden gap-3 font-bold lg:grid"
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
          zobrazeni === "mrizka" ? "mt-4 grid gap-4 md:grid-cols-2" : "mt-2"
        }
      >
        {polozky.map((polozka, index) => {
          const cestaPolozky = `${cestaSeznamu}[${index}]`;

          if (zobrazeni === "tabulka") {
            return (
              <li
                key={polozka._id}
                className="border-linka grid gap-3 border-t py-4 first:border-t-0 lg:items-start lg:py-2 lg:[grid-template-columns:var(--sloupce)]"
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
                <div className="order-first flex flex-wrap items-center justify-between gap-2 lg:order-none">
                  <span className="text-text-doplnek font-bold lg:hidden">
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
              <li
                key={polozka._id}
                className="border-linka rounded-karta mt-3 border"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2">
                  <button
                    type="button"
                    onClick={() => prepni(polozka._id)}
                    aria-expanded={otevrena}
                    aria-controls={idTela}
                    className="klik min-w-0 flex-1 basis-60 gap-3 text-left font-bold"
                  >
                    <span aria-hidden className="shrink-0">
                      {otevrena ? "▾" : "▸"}
                    </span>
                    <span>
                      {index + 1}. {nadpis || "(zatím bez textu)"}
                      <span className="text-text-doplnek ml-2 font-normal underline">
                        {otevrena ? "sbalit" : "upravit"}
                      </span>
                    </span>
                  </button>
                  {akce(index)}
                </div>
                {otevrena ? (
                  <div id={idTela} className="border-linka border-t px-4 pb-5">
                    {polePolozky(polozka, index)}
                  </div>
                ) : null}
              </li>
            );
          }

          return (
            <li
              key={polozka._id}
              className={
                zobrazeni === "mrizka"
                  ? "border-linka rounded-karta border p-4"
                  : "border-linka mt-4 border-t pt-4 first:mt-0 first:border-t-0 first:pt-0"
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-bold">
                  {index + 1}.{" "}
                  {zobrazeni === "rozbalene" ? souhrn(polozka, pole.polozka) : null}
                </p>
                {akce(index)}
              </div>
              {polePolozky(polozka, index)}
            </li>
          );
        })}
      </ol>

      {chybaSeznamu ? (
        <p data-chyba className="text-chyba mt-3 font-bold">
          {chybaSeznamu}
        </p>
      ) : null}

      <button
        type="button"
        onClick={pridej}
        disabled={!muzePridat}
        className="klik rounded-tlacitko bg-linka hover:bg-seda mt-5 justify-center px-6 font-bold transition-colors duration-150 disabled:opacity-40"
      >
        + Přidat {pole.nazevPolozky}
      </button>

      {!muzePridat ? (
        <p className="text-text-doplnek mt-2 text-[1.0625rem]">
          Víc než {pole.max} se jich na stránku nevejde.
        </p>
      ) : null}
    </fieldset>
  );
}
