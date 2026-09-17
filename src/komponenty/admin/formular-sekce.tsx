"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
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
 */

type Vlastnosti = {
  sekce: Sekce;
  vychozi: Hodnoty;
};

/** Chyby ze serveru přijdou s cestou k poli — tady se z nich udělá mapa. */
function podleCesty(stav: StavUlozeni): Record<string, string> {
  if (stav.stav !== "chyba" || !stav.chyby) return {};
  const mapa: Record<string, string> = {};
  for (const chyba of stav.chyby) mapa[chyba.cesta] ??= chyba.zprava;
  return mapa;
}

export function FormularSekce({ sekce, vychozi }: Vlastnosti) {
  const [hodnoty, setHodnoty] = useState<Hodnoty>(vychozi);
  const [stav, setStav] = useState<StavUlozeni>({ stav: "prazdno" });
  const [ukladase, zacniUkladat] = useTransition();

  const chyby = podleCesty(stav);
  const pocetChyb = stav.stav === "chyba" && stav.chyby ? stav.chyby.length : 0;

  function zmen(jmeno: string, hodnota: unknown) {
    setHodnoty((puvodni) => ({ ...puvodni, [jmeno]: hodnota }));
    // Po zásahu do formuláře už hláška „uloženo" neplatí.
    if (stav.stav === "ulozeno") setStav({ stav: "prazdno" });
  }

  function odesli() {
    zacniUkladat(async () => {
      setStav(await ulozSekci(sekce.klic, JSON.stringify(hodnoty)));
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        odesli();
      }}
    >
      <p>
        <Link href="/admin" className="klik underline">
          ← Zpátky na přehled
        </Link>
      </p>

      <h1 className="text-h2 lg:text-h2-pc mt-4">{sekce.nazev}</h1>
      {sekce.popis ? (
        <p className="text-perex text-text-doplnek mt-3 max-w-[60ch]">
          {sekce.popis}
        </p>
      ) : null}

      <div className="bg-povrch border-linka rounded-karta mt-8 max-w-[70ch] border p-5 lg:p-7">
        <SadaPoli
          pola={sekce.pole}
          hodnoty={hodnoty}
          cesta=""
          chyby={chyby}
          klicSekce={sekce.klic}
          zmen={zmen}
        />
      </div>

      {/* Shrnutí nad tlačítkem. Jednotlivé hlášky jsou i u polí, ale u dlouhé
          sekce by se na ně muselo dolistovat. */}
      <div className="mt-6 max-w-[70ch]" aria-live="polite">
        {stav.stav === "chyba" && stav.zprava ? (
          <p className="font-bold">{stav.zprava}</p>
        ) : null}

        {pocetChyb > 0 ? (
          <p className="font-bold">
            {pocetChyb === 1
              ? "Jedno pole je potřeba doplnit — hláška je u něj."
              : `${pocetChyb} pole je potřeba doplnit — hlášky jsou u nich.`}
          </p>
        ) : null}

        {stav.stav === "ulozeno" ? (
          <p className="font-bold">
            Uloženo. Na webu se to projeví hned — zkontrolovat to můžete
            odkazem „Zobrazit web“ nahoře.
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={ukladase}
          data-akce="admin-ulozit"
          className="klik rounded-tlacitko bg-azurova text-text hover:bg-text hover:text-azurova justify-center px-10 py-5 text-[1.3125rem] font-extrabold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {ukladase ? "Ukládá se…" : "Uložit"}
        </button>

        <p className="text-text-doplnek text-[1.0625rem]">
          Uloží se jen tahle sekce.
        </p>
      </div>
    </form>
  );
}
