"use client";

import Image from "next/image";
import { useId, useState, useTransition, type ReactNode } from "react";
import { nahrajFotku } from "@/app/admin/akce/fotky";
import type { Pole } from "@/lib/admin/obsah-schema";
import { CILE_ODKAZU } from "@/lib/navigace";
import { adresaFotky } from "@/lib/supabase/nastaveni";

/**
 * Jedno pole zadávacího formuláře.
 *
 * Vykresluje se z deklarativního schématu — přidat pole na web znamená
 * přidat řádek do `obsah-schema.ts`, ne psát nový formulář.
 *
 * Popisek je vždycky **nad polem**, ne jen jako zástupný text: zástupný text
 * při psaní zmizí a člověk pak neví, co do pole píše.
 */

export type Hodnoty = Record<string, unknown>;

type Vlastnosti = {
  pole: Pole;
  hodnoty: Hodnoty;
  /** Cesta k poli. Podle ní se k poli přiřadí chybová hláška ze serveru. */
  cesta: string;
  chyby: Record<string, string>;
  /** Klíč sekce. Server podle něj pojmenuje složku s fotkou. */
  klicSekce: string;
  zmen: (jmeno: string, hodnota: unknown) => void;
};

const VSTUP =
  "border-linka bg-povrch rounded-polozka w-full border px-4 py-3 " +
  "text-[1.0625rem] focus:border-text";

const VSTUP_CHYBA = "border-text border-2";

function retezec(hodnoty: Hodnoty, jmeno: string, vychozi = ""): string {
  const h = hodnoty[jmeno];
  return typeof h === "string" ? h : vychozi;
}

/**
 * Popisek, nápověda a chybová hláška kolem vstupu.
 *
 * Musí být na nejvyšší úrovni souboru. Kdyby se definovala uvnitř
 * `PoleFormulare`, byl by to při každém překreslení nový typ komponenty,
 * React by vstup zahodil a vyrobil znovu — a psaní by po každém písmenu
 * ztratilo ohnisko.
 */
function Obal({
  id,
  pole,
  idNapovedy,
  idChyby,
  chyba,
  children,
}: {
  id: string;
  pole: Pole;
  idNapovedy?: string;
  idChyby?: string;
  chyba?: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-6">
      <label htmlFor={id} className="block font-bold">
        {pole.popisek}
        {pole.povinne ? (
          <span className="text-text-doplnek font-normal"> — vyplňte</span>
        ) : null}
      </label>
      {pole.napoveda ? (
        <p id={idNapovedy} className="text-text-doplnek mt-1 text-[1.0625rem]">
          {pole.napoveda}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
      {chyba ? (
        <p id={idChyby} className="mt-2 font-bold">
          {chyba}
        </p>
      ) : null}
    </div>
  );
}

function Pocitadlo({ delka, max }: { delka: number; max: number }) {
  const tesne = delka > max * 0.9;
  return (
    <p
      className={`mt-1 text-[1.0625rem] ${tesne ? "font-bold" : "text-text-doplnek"}`}
    >
      {delka} z {max} znaků
    </p>
  );
}

export function PoleFormulare({
  pole,
  hodnoty,
  cesta,
  chyby,
  klicSekce,
  zmen,
}: Vlastnosti) {
  const id = useId();
  const chyba = chyby[cesta];
  const idNapovedy = pole.napoveda ? `${id}-napoveda` : undefined;
  const idChyby = chyba ? `${id}-chyba` : undefined;
  const popis = [idNapovedy, idChyby].filter(Boolean).join(" ") || undefined;
  const spolecne = { id, pole, idNapovedy, idChyby, chyba };

  switch (pole.druh) {
    case "text": {
      const hodnota = retezec(hodnoty, pole.jmeno);
      return (
        <Obal {...spolecne}>
          <input
            id={id}
            type="text"
            value={hodnota}
            maxLength={pole.max}
            aria-describedby={popis}
            aria-invalid={chyba ? true : undefined}
            onChange={(e) => zmen(pole.jmeno, e.target.value)}
            className={`${VSTUP} ${chyba ? VSTUP_CHYBA : ""}`}
          />
          {pole.max ? <Pocitadlo delka={hodnota.length} max={pole.max} /> : null}
        </Obal>
      );
    }

    case "viceradkovy": {
      const hodnota = retezec(hodnoty, pole.jmeno);
      return (
        <Obal {...spolecne}>
          <textarea
            id={id}
            rows={pole.radky ?? 4}
            value={hodnota}
            maxLength={pole.max}
            aria-describedby={popis}
            aria-invalid={chyba ? true : undefined}
            onChange={(e) => zmen(pole.jmeno, e.target.value)}
            className={`${VSTUP} ${chyba ? VSTUP_CHYBA : ""}`}
          />
          {pole.max ? <Pocitadlo delka={hodnota.length} max={pole.max} /> : null}
        </Obal>
      );
    }

    case "prepinac": {
      const zapnuto = hodnoty[pole.jmeno] === true;
      return (
        <div className="mt-6">
          <div className="flex items-start gap-3">
            <input
              id={id}
              type="checkbox"
              checked={zapnuto}
              aria-describedby={idNapovedy}
              onChange={(e) => zmen(pole.jmeno, e.target.checked)}
              className="mt-1 h-6 w-6 shrink-0"
            />
            <label htmlFor={id} className="font-bold">
              {pole.popisek}
            </label>
          </div>
          {pole.napoveda ? (
            <p
              id={idNapovedy}
              className="text-text-doplnek mt-1 ml-9 text-[1.0625rem]"
            >
              {pole.napoveda}
            </p>
          ) : null}
        </div>
      );
    }

    case "vyber": {
      const hodnota = retezec(hodnoty, pole.jmeno, pole.vychozi);
      return (
        <Obal {...spolecne}>
          <select
            id={id}
            value={hodnota}
            aria-describedby={popis}
            onChange={(e) => zmen(pole.jmeno, e.target.value)}
            className={`${VSTUP} ${chyba ? VSTUP_CHYBA : ""}`}
          >
            {pole.moznosti.map((m) => (
              <option key={m.hodnota} value={m.hodnota}>
                {m.popisek}
              </option>
            ))}
          </select>
        </Obal>
      );
    }

    case "stranka": {
      // Klientka nikdy nepíše adresu ručně — vybírá ze seznamu stránek,
      // které na webu opravdu existují. Překlep tak nevyrobí mrtvý odkaz.
      const hodnota = retezec(hodnoty, pole.jmeno);
      return (
        <Obal {...spolecne}>
          <select
            id={id}
            value={hodnota}
            aria-describedby={popis}
            aria-invalid={chyba ? true : undefined}
            onChange={(e) => zmen(pole.jmeno, e.target.value)}
            className={`${VSTUP} ${chyba ? VSTUP_CHYBA : ""}`}
          >
            <option value="">— vyberte stránku —</option>
            {CILE_ODKAZU.map((s) => (
              <option key={s.href} value={s.href}>
                {s.popis ? `${s.nazev} — ${s.popis}` : s.nazev}
              </option>
            ))}
          </select>
        </Obal>
      );
    }

    case "obrazek":
      return (
        <PoleObrazku
          pole={pole}
          hodnoty={hodnoty}
          klicSekce={klicSekce}
          chyba={chyba}
          zmen={zmen}
        />
      );

    case "seznam":
      // Seznamy vykresluje `SeznamPolozek` — potřebuje vlastní rámeček
      // a tlačítka na pořadí.
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Fotka                                                                      */
/* -------------------------------------------------------------------------- */

function PoleObrazku({
  pole,
  hodnoty,
  klicSekce,
  chyba,
  zmen,
}: {
  pole: Extract<Pole, { druh: "obrazek" }>;
  hodnoty: Hodnoty;
  klicSekce: string;
  chyba?: string;
  zmen: (jmeno: string, hodnota: unknown) => void;
}) {
  const id = useId();
  const [chybaNahrani, setChybaNahrani] = useState<string>();
  const [nahrava, zacniNahravat] = useTransition();

  const cesta = retezec(hodnoty, pole.jmeno);

  function posliNaServer(soubor: File) {
    setChybaNahrani(undefined);

    const data = new FormData();
    data.set("soubor", soubor);
    data.set("klic", klicSekce);

    // Typ, velikost i jméno souboru řeší server. Tady se nic neověřuje —
    // kontrola v prohlížeči je pohodlí, ne ochrana.
    zacniNahravat(async () => {
      const vysledek = await nahrajFotku(data);
      if (vysledek.stav === "chyba") {
        setChybaNahrani(vysledek.zprava);
        return;
      }
      zmen(pole.jmeno, vysledek.cesta);
    });
  }

  return (
    <div className="border-linka rounded-karta mt-6 border p-4">
      <p className="font-bold">{pole.popisek}</p>
      {pole.napoveda ? (
        <p className="text-text-doplnek mt-1 text-[1.0625rem]">{pole.napoveda}</p>
      ) : null}

      {cesta ? (
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="bg-seda rounded-polozka relative h-24 w-24 shrink-0 overflow-hidden">
            <Image
              src={adresaFotky(cesta)}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => zmen(pole.jmeno, "")}
            className="klik rounded-tlacitko bg-linka hover:bg-seda px-5 text-[1.0625rem] font-bold transition-colors duration-150"
          >
            Odebrat fotku
          </button>
        </div>
      ) : (
        <p className="text-text-doplnek mt-3 text-[1.0625rem]">
          Zatím tu žádná fotka není. Dokud ji nenahrajete, na webu se místo po
          ní nezobrazí — prázdná šedá plocha nikde nevznikne.
        </p>
      )}

      <div className="mt-4">
        <label htmlFor={id} className="block font-bold">
          {cesta ? "Nahradit jinou fotkou" : "Nahrát fotku"}
        </label>
        <p className="text-text-doplnek mt-1 text-[1.0625rem]">
          JPG, PNG nebo WEBP, nejvýš 5 MB.
        </p>
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={nahrava}
          onChange={(e) => {
            const soubor = e.target.files?.[0];
            if (soubor) posliNaServer(soubor);
            // Vyprázdnit, ať jde nahrát stejný soubor znovu po chybě.
            e.target.value = "";
          }}
          className="mt-2 block w-full text-[1.0625rem]"
        />
        {nahrava ? <p className="mt-2 font-bold">Nahrává se…</p> : null}
        {chybaNahrani ? <p className="mt-2 font-bold">{chybaNahrani}</p> : null}
        {chyba ? <p className="mt-2 font-bold">{chyba}</p> : null}
      </div>
    </div>
  );
}
