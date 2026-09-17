"use client";

import type { Pole } from "@/lib/admin/obsah-schema";
import { PoleFormulare, type Hodnoty } from "./pole";

/**
 * Sada polí a seznamy položek.
 *
 * Volá se rekurzivně: seznam obsahuje položky a položka může obsahovat další
 * seznam (ceník má oblasti a v nich položky). Proto jsou obě komponenty
 * v jednom souboru — odkazují na sebe navzájem.
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

export function SadaPoli({
  pola,
  ...zbytek
}: SpolecneVlastnosti & { pola: readonly Pole[] }) {
  return (
    <>
      {pola.map((pole) =>
        pole.druh === "seznam" ? (
          <SeznamPolozek key={pole.jmeno} pole={pole} {...zbytek} />
        ) : (
          <PoleFormulare
            key={pole.jmeno}
            pole={pole}
            hodnoty={zbytek.hodnoty}
            cesta={zbytek.cesta ? `${zbytek.cesta}.${pole.jmeno}` : pole.jmeno}
            chyby={zbytek.chyby}
            klicSekce={zbytek.klicSekce}
            zmen={zbytek.zmen}
          />
        ),
      )}
    </>
  );
}

type Polozka = Hodnoty & { _id: string };

function polozkySeznamu(hodnoty: Hodnoty, jmeno: string): Polozka[] {
  const h = hodnoty[jmeno];
  if (!Array.isArray(h)) return [];
  return h
    .filter((p): p is Hodnoty => typeof p === "object" && p !== null && !Array.isArray(p))
    .map((p) => ({
      ...p,
      _id: typeof p._id === "string" && p._id ? p._id : globalThis.crypto.randomUUID(),
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

function SeznamPolozek({
  pole,
  hodnoty,
  cesta,
  chyby,
  klicSekce,
  zmen,
}: SpolecneVlastnosti & { pole: Extract<Pole, { druh: "seznam" }> }) {
  const polozky = polozkySeznamu(hodnoty, pole.jmeno);
  const cestaSeznamu = cesta ? `${cesta}.${pole.jmeno}` : pole.jmeno;
  const chybaSeznamu = chyby[cestaSeznamu];

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

  const muzePridat = pole.max === undefined || polozky.length < pole.max;
  const muzeUbrat = pole.min === undefined || polozky.length > pole.min;

  return (
    <fieldset className="border-linka rounded-karta mt-8 border p-4 lg:p-5">
      <legend className="px-2 font-bold">{pole.popisek}</legend>

      {pole.napoveda ? (
        <p className="text-text-doplnek text-[1.0625rem]">{pole.napoveda}</p>
      ) : null}

      {polozky.length === 0 ? (
        <p className="text-text-doplnek mt-3 text-[1.0625rem]">
          Zatím tu nic není. Přidejte první {pole.nazevPolozky} tlačítkem dole.
        </p>
      ) : null}

      <ol className="mt-2">
        {polozky.map((polozka, index) => (
          <li
            key={polozka._id}
            className="border-linka mt-4 border-t pt-4 first:border-t-0 first:pt-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-text-doplnek font-bold">
                {index + 1}. {pole.nazevPolozky}
              </p>

              <div className="flex flex-wrap gap-2">
                {/* Pořadí se mění šipkami. Tažení myší se na dotykovém
                    zařízení ovládá špatně a klávesnicí skoro vůbec. */}
                <button
                  type="button"
                  onClick={() => presun(index, -1)}
                  disabled={index === 0}
                  aria-label={`Posunout ${pole.nazevPolozky} číslo ${index + 1} nahoru`}
                  className="klik rounded-polozka bg-linka hover:bg-seda min-w-12 justify-center px-3 font-bold transition-colors duration-150 disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => presun(index, 1)}
                  disabled={index === polozky.length - 1}
                  aria-label={`Posunout ${pole.nazevPolozky} číslo ${index + 1} dolů`}
                  className="klik rounded-polozka bg-linka hover:bg-seda min-w-12 justify-center px-3 font-bold transition-colors duration-150 disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => uloz(polozky.filter((_, i) => i !== index))}
                  disabled={!muzeUbrat}
                  className="klik rounded-polozka bg-linka hover:bg-seda px-4 text-[1.0625rem] font-bold transition-colors duration-150 disabled:opacity-40"
                >
                  Smazat
                </button>
              </div>
            </div>

            <SadaPoli
              pola={pole.polozka}
              hodnoty={polozka}
              cesta={`${cestaSeznamu}[${index}]`}
              chyby={chyby}
              klicSekce={klicSekce}
              zmen={(jmeno, hodnota) => zmenPolozku(index, jmeno, hodnota)}
            />
          </li>
        ))}
      </ol>

      {chybaSeznamu ? <p className="mt-3 font-bold">{chybaSeznamu}</p> : null}

      <button
        type="button"
        onClick={() => uloz([...polozky, prazdnaPolozka(pole.polozka)])}
        disabled={!muzePridat}
        className="klik rounded-tlacitko bg-linka hover:bg-seda mt-5 justify-center px-6 font-bold transition-colors duration-150 disabled:opacity-40"
      >
        Přidat {pole.nazevPolozky}
      </button>

      {!muzePridat ? (
        <p className="text-text-doplnek mt-2 text-[1.0625rem]">
          Víc než {pole.max} se jich na stránku nevejde.
        </p>
      ) : null}
    </fieldset>
  );
}
