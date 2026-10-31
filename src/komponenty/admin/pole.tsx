"use client";

import Image from "next/image";
import { useId, useState, useTransition, type ReactNode } from "react";
import { nahrajFotku } from "@/app/admin/akce/fotky";
import { POMERY, VyrezObrazku } from "@/komponenty/admin/vyrez-obrazku";
import type { Pole } from "@/lib/admin/obsah-schema";
import { CILE_ODKAZU } from "@/lib/navigace";
import { stylVyrezu } from "@/lib/obrazky/pozice";
import { adresaFotky } from "@/lib/supabase/nastaveni";

/**
 * Jedno pole zadávacího formuláře.
 *
 * Vykresluje se z deklarativního schématu — přidat pole na web znamená
 * přidat řádek do `obsah-schema.ts`, ne psát nový formulář.
 *
 * Popisek je vždycky **nad polem**, ne jen jako zástupný text: zástupný text
 * při psaní zmizí a člověk pak neví, co do pole píše. Výjimkou je tabulka
 * (ceník, vzdělání) na počítači — tam popisek nese záhlaví sloupce a u pole
 * zůstává jen pro odečítač.
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
  /** Pole v řádku tabulky: bez odsazení, popisek na počítači jen pro odečítač. */
  kompaktni?: boolean;
  /** U fotky: pole s jejím popiskem. Vykreslí se přímo pod fotkou. */
  popisFotky?: Pole;
};

const VSTUP =
  "w-full rounded-md border border-[#c9cbc5] bg-white px-3 py-2 text-base " +
  "focus:border-text";

/** V řádku tabulky menší, ať se ceník vejde na obrazovku. */
const VSTUP_KOMPAKTNI =
  "w-full rounded border border-[#d6d7d3] bg-white px-2 py-1.5 text-base " +
  "focus:border-text";

const VSTUP_CHYBA = "border-chyba border-2";

/** Vedlejší tlačítko administrace — obyčejné, ne jako na webu. */
export const TLACITKO =
  "inline-flex h-9 items-center justify-center rounded-md border border-[#c9cbc5] " +
  "bg-white px-3 text-sm font-semibold hover:bg-plocha disabled:opacity-40";

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
  kompaktni,
  children,
}: {
  id: string;
  pole: Pole;
  idNapovedy?: string;
  idChyby?: string;
  chyba?: string;
  kompaktni?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={kompaktni ? "" : "mt-4"}>
      <label
        htmlFor={id}
        className={`block text-[0.9375rem] font-semibold ${kompaktni ? "@xl:sr-only" : ""}`}
      >
        {pole.popisek}
        {pole.povinne ? (
          <>
            <span aria-hidden> *</span>
            <span className="sr-only"> (povinné)</span>
          </>
        ) : null}
      </label>
      {pole.napoveda ? (
        <p
          id={idNapovedy}
          className={`text-text-doplnek text-sm ${kompaktni ? "@xl:sr-only" : ""}`}
        >
          {pole.napoveda}
        </p>
      ) : null}
      <div className={kompaktni ? "mt-1 @xl:mt-0" : "mt-1"}>{children}</div>
      {chyba ? (
        <p id={idChyby} data-chyba className="text-chyba mt-1 text-sm font-semibold">
          {chyba}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Počítadlo znaků. Ukáže se až blízko limitu — pod každým polem pořád by
 * jen přidávalo čísla, která nikoho nezajímají.
 */
function Pocitadlo({ delka, max }: { delka: number; max: number }) {
  if (delka < max * 0.8) return null;
  return (
    <p className="text-text-doplnek mt-0.5 text-sm">
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
  kompaktni,
  popisFotky,
}: Vlastnosti) {
  const id = useId();
  const chyba = chyby[cesta];
  const idNapovedy = pole.napoveda ? `${id}-napoveda` : undefined;
  const idChyby = chyba ? `${id}-chyba` : undefined;
  const popis = [idNapovedy, idChyby].filter(Boolean).join(" ") || undefined;
  const spolecne = { id, pole, idNapovedy, idChyby, chyba, kompaktni };
  const vstup = kompaktni ? VSTUP_KOMPAKTNI : VSTUP;

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
            className={`${vstup} ${chyba ? VSTUP_CHYBA : ""}`}
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
            className={`${vstup} ${chyba ? VSTUP_CHYBA : ""}`}
          />
          {pole.max ? <Pocitadlo delka={hodnota.length} max={pole.max} /> : null}
        </Obal>
      );
    }

    case "prepinac": {
      const zapnuto = hodnoty[pole.jmeno] === true;
      return (
        <div className="mt-4">
          <div className="flex items-start gap-2.5">
            <input
              id={id}
              type="checkbox"
              checked={zapnuto}
              aria-describedby={idNapovedy}
              onChange={(e) => zmen(pole.jmeno, e.target.checked)}
              className="accent-text mt-0.5 h-5 w-5 shrink-0"
            />
            <label htmlFor={id} className="font-semibold">
              {pole.popisek}
            </label>
          </div>
          {pole.napoveda ? (
            <p
              id={idNapovedy}
              className="text-text-doplnek ml-7.5 text-sm"
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
            className={`${vstup} ${chyba ? VSTUP_CHYBA : ""}`}
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
            className={`${vstup} ${chyba ? VSTUP_CHYBA : ""}`}
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

    case "obrazek": {
      // Popisek fotky má vlastní cestu vedle fotky, ne pod ní.
      const cestaPopisu = popisFotky
        ? cesta.replace(/[^.]+$/, popisFotky.jmeno)
        : undefined;
      return (
        <PoleObrazku
          pole={pole}
          hodnoty={hodnoty}
          klicSekce={klicSekce}
          chyba={chyba}
          zmen={zmen}
          popisek={
            popisFotky && cestaPopisu ? (
              <PoleFormulare
                pole={popisFotky}
                hodnoty={hodnoty}
                cesta={cestaPopisu}
                chyby={chyby}
                klicSekce={klicSekce}
                zmen={zmen}
              />
            ) : null
          }
        />
      );
    }

    case "seznam":
      // Seznamy vykresluje `SeznamPolozek` — potřebuje vlastní rámeček
      // a tlačítka na pořadí.
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Fotka                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Fotka jako jedna karta: náhled, vedle něj tlačítka, pod tím popisek.
 *
 * Náhled je ve stejném poměru stran a se stejným výřezem jako na webu —
 * je na první pohled vidět, co z fotky návštěvník uvidí. Ovládání výřezu
 * se rozbalí až na požádání; většinou na něj není potřeba sahat.
 */
function PoleObrazku({
  pole,
  hodnoty,
  klicSekce,
  chyba,
  zmen,
  popisek,
}: {
  pole: Extract<Pole, { druh: "obrazek" }>;
  hodnoty: Hodnoty;
  klicSekce: string;
  chyba?: string;
  zmen: (jmeno: string, hodnota: unknown) => void;
  /** Pole s popiskem fotky. Ukáže se, jen když je fotka nahraná. */
  popisek: ReactNode;
}) {
  const id = useId();
  const [chybaNahrani, setChybaNahrani] = useState<string>();
  const [nahrava, zacniNahravat] = useTransition();
  const [upravujeVyrez, setUpravujeVyrez] = useState(false);

  const cesta = retezec(hodnoty, pole.jmeno);
  const pomer = POMERY[pole.varianta] ?? "4 / 3";

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
    <div role="group" aria-label={pole.popisek} className="mt-4">
      {pole.napoveda ? (
        <p className="text-text-doplnek text-sm">{pole.napoveda}</p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-start gap-4">
        <div
          className={`bg-seda relative shrink-0 overflow-hidden rounded-md ${
            pole.varianta === "sdileni" ? "w-48" : "w-28"
          }`}
          style={{ aspectRatio: pomer }}
        >
          {cesta ? (
            <Image
              src={adresaFotky(cesta)}
              alt=""
              fill
              sizes="256px"
              className="object-cover"
              style={stylVyrezu(hodnoty[pole.poziceJmeno], hodnoty[pole.zoomJmeno])}
            />
          ) : (
            <span className="text-text-doplnek absolute inset-0 flex items-center justify-center p-2 text-center text-sm">
              Zatím bez fotky
            </span>
          )}
        </div>

        <div className="flex flex-col items-start gap-1.5">
          {/*
            Systémové pole pro výběr souboru je drobné a snadno se přehlédne.
            Vstup proto zůstává, ale schovaný, a klikacím prvkem je jeho
            popisek vysázený jako tlačítko. Ohnisko se kreslí na tlačítko
            přes `focus-within`, jinak by nebylo vidět.
          */}
          <label
            htmlFor={id}
            className={`${TLACITKO} cursor-pointer focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-current`}
          >
            {nahrava ? "Nahrává se…" : cesta ? "Nahrát jinou fotku" : "Nahrát fotku"}
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
              className="sr-only"
            />
          </label>
          <p className="text-text-doplnek text-sm">JPG, PNG nebo WEBP, nejvýš 5 MB.</p>

          {cesta ? (
            <>
              <button
                type="button"
                onClick={() => setUpravujeVyrez((v) => !v)}
                aria-expanded={upravujeVyrez}
                className={TLACITKO}
              >
                {upravujeVyrez ? "Hotovo s výřezem" : "Upravit výřez"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Odebrat fotku? Z webu zmizí, až sekci uložíte.",
                    )
                  ) {
                    setUpravujeVyrez(false);
                    zmen(pole.jmeno, "");
                  }
                }}
                className="text-chyba py-1 text-sm underline"
              >
                Odebrat fotku
              </button>
            </>
          ) : null}
        </div>
      </div>

      {chybaNahrani ? (
        <p data-chyba className="text-chyba mt-2 text-sm font-semibold">
          {chybaNahrani}
        </p>
      ) : null}
      {chyba ? (
        <p data-chyba className="text-chyba mt-2 text-sm font-semibold">
          {chyba}
        </p>
      ) : null}

      {cesta && upravujeVyrez ? (
        <VyrezObrazku
          src={adresaFotky(cesta)}
          varianta={pole.varianta}
          pozice={hodnoty[pole.poziceJmeno]}
          zoom={hodnoty[pole.zoomJmeno]}
          zmen={zmen}
          poziceJmeno={pole.poziceJmeno}
          zoomJmeno={pole.zoomJmeno}
        />
      ) : null}

      {cesta ? popisek : null}
    </div>
  );
}
