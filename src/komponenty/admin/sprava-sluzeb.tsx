"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { pridejSluzbu, ulozSeznamSluzeb, type StavSluzeb } from "@/app/admin/akce/sluzby";
import { MAX_SLUZEB, chybaAdresy, vytvorSlug, type Sluzba } from "@/lib/sluzby";
import { useHlidaniOdchodu } from "./formular-stranky";
import { TLACITKO } from "./pole";

/**
 * Seznam služeb: pořadí, názvy do menu, zobrazení na webu, přidání nové.
 *
 * Obsah stránky služby (texty, úkony, fotka) se upravuje na její vlastní
 * stránce v administraci — tady je jen to, co patří do menu.
 *
 * Změny v seznamu se drží v prohlížeči a ukládají se jedním tlačítkem dole,
 * stejně jako ostatní stránky administrace. Přidání nové služby se uloží
 * hned a otevře její stránku, ať se dá rovnou psát.
 */

const VSTUP =
  "w-full rounded border border-[#d6d7d3] bg-white px-2 py-1.5 text-base focus:border-text";
const IKONA = `${TLACITKO} w-9 px-0`;

export function SpravaSluzeb({ sluzby }: { sluzby: Sluzba[] }) {
  const [ulozene, setUlozene] = useState(sluzby);
  const [seznam, setSeznam] = useState(sluzby);
  const [stav, setStav] = useState<StavSluzeb>({ stav: "prazdno" });
  const [ukladase, zacniUkladat] = useTransition();

  const neulozeno = seznam !== ulozene;
  useHlidaniOdchodu(neulozeno);

  function zmen(index: number, zmena: Partial<Sluzba>) {
    setSeznam(seznam.map((s, i) => (i === index ? { ...s, ...zmena } : s)));
    setStav({ stav: "prazdno" });
  }

  function presun(index: number, kam: -1 | 1) {
    const cil = index + kam;
    if (cil < 0 || cil >= seznam.length) return;
    const novy = [...seznam];
    [novy[index], novy[cil]] = [novy[cil], novy[index]];
    setSeznam(novy);
    setStav({ stav: "prazdno" });
  }

  function smaz(index: number) {
    const s = seznam[index];
    const otazka =
      `Smazat službu „${s.nazev}“?\n\nZ menu i ze seznamu zmizí. ` +
      "Dokud neuložíte, jde to vrátit tlačítkem Zahodit změny.";
    if (!window.confirm(otazka)) return;
    setSeznam(seznam.filter((_, i) => i !== index));
    setStav({ stav: "prazdno" });
  }

  function uloz() {
    const odeslany = seznam;
    zacniUkladat(async () => {
      let vysledek: StavSluzeb;
      try {
        vysledek = await ulozSeznamSluzeb(
          JSON.stringify(
            odeslany.map((s) => ({
              id: s.id,
              nazev: s.nazev,
              popis: s.popis,
              zobrazit: s.zobrazit,
            })),
          ),
        );
      } catch {
        vysledek = { stav: "chyba", zprava: "Spojení se serverem se přerušilo. Zkuste to znovu." };
      }
      setStav(vysledek);
      if (vysledek.stav === "ulozeno") setUlozene(odeslany);
    });
  }

  const ulozeneId = new Map(ulozene.map((s) => [s.id, s]));

  return (
    <div className="max-w-[64rem]">
      <h1 className="text-2xl font-bold">Služby</h1>
      <p className="text-text-doplnek mt-1 max-w-[70ch] text-[0.9375rem]">
        Pořadí platí pro menu Služby na webu. Texty a fotky služby upravíte
        odkazem „Upravit stránku“. Skrytá služba na webu není, ale nic se z ní
        neztratí.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          uloz();
        }}
        className="mt-5"
      >
        <section className="border-linka rounded-lg border bg-white p-4 sm:p-5">
          <h2 className="text-lg font-bold">Seznam služeb</h2>

          <div className="@container">
            <div
              aria-hidden
              className="text-text-doplnek mt-3 hidden grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)_6rem_7.25rem] gap-2 text-sm font-semibold @2xl:grid"
            >
              <span>Název v menu</span>
              <span>Krátký popis v menu</span>
              <span>Na webu</span>
              <span />
            </div>

            <ol>
              {seznam.map((s, i) => {
                const lzeSmazat = !s.zobrazit && ulozeneId.get(s.id)?.zobrazit === false;
                return (
                  <li
                    key={s.id}
                    className="border-linka grid gap-2 border-t py-3 first:border-t-0 @2xl:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)_6rem_7.25rem] @2xl:items-start @2xl:py-2"
                  >
                    <div>
                      <label className="text-sm font-semibold @2xl:sr-only" htmlFor={`nazev-${s.id}`}>
                        Název v menu
                      </label>
                      <input
                        id={`nazev-${s.id}`}
                        value={s.nazev}
                        maxLength={60}
                        required
                        onChange={(e) => zmen(i, { nazev: e.target.value })}
                        className={`${VSTUP} font-semibold`}
                      />
                      <p className="text-text-doplnek mt-1 text-sm">
                        /{s.slug} ·{" "}
                        <Link href={`/admin/${s.klic}`} className="font-semibold underline">
                          Upravit stránku
                        </Link>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold @2xl:sr-only" htmlFor={`popis-${s.id}`}>
                        Krátký popis v menu
                      </label>
                      <input
                        id={`popis-${s.id}`}
                        value={s.popis}
                        maxLength={80}
                        onChange={(e) => zmen(i, { popis: e.target.value })}
                        className={VSTUP}
                      />
                    </div>
                    <label className="flex items-center gap-2 py-1.5 text-[0.9375rem]">
                      <input
                        type="checkbox"
                        checked={s.zobrazit}
                        onChange={(e) => zmen(i, { zobrazit: e.target.checked })}
                        className="accent-text h-5 w-5"
                      />
                      <span>{s.zobrazit ? "Zobrazit" : "Skrytá"}</span>
                    </label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => presun(i, -1)}
                        disabled={i === 0}
                        aria-label={`Posunout ${s.nazev} nahoru`}
                        title="Posunout nahoru"
                        className={IKONA}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => presun(i, 1)}
                        disabled={i === seznam.length - 1}
                        aria-label={`Posunout ${s.nazev} dolů`}
                        title="Posunout dolů"
                        className={IKONA}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => smaz(i)}
                        disabled={!lzeSmazat}
                        aria-label={`Smazat ${s.nazev}`}
                        title={lzeSmazat ? "Smazat" : "Smazat jde jen skrytou a uloženou službu"}
                        className={`${IKONA} text-chyba`}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <p className="text-text-doplnek mt-2 text-sm">
            Smazat jde jen služba, která je skrytá a uložená — aby z webu
            omylem nezmizela stránka, na kterou vedou odkazy.
          </p>
        </section>

        <div className="border-linka sticky bottom-0 z-10 -mx-4 mt-5 border-t bg-white px-4 py-3 shadow-[0_-4px_12px_rgb(0_0_0/0.06)] sm:mx-0 sm:rounded-t-lg sm:border-x">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="submit"
              disabled={ukladase || !neulozeno}
              className="bg-azurova text-text hover:bg-text hover:text-azurova disabled:hover:bg-azurova disabled:hover:text-text inline-flex h-11 items-center justify-center rounded-md px-6 font-bold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ukladase ? "Ukládá se…" : "Uložit změny"}
            </button>
            {neulozeno && !ukladase ? (
              <button
                type="button"
                onClick={() => {
                  setSeznam(ulozene);
                  setStav({ stav: "prazdno" });
                }}
                className="py-2 text-[0.9375rem] underline"
              >
                Zahodit změny
              </button>
            ) : null}
            <div aria-live="polite" className="text-[0.9375rem]">
              {stav.stav === "chyba" ? (
                <p className="text-chyba font-bold">{stav.zprava}</p>
              ) : stav.stav === "ulozeno" && !neulozeno ? (
                <p className="font-bold">Uloženo, menu na webu je aktuální.</p>
              ) : neulozeno ? (
                <p className="font-bold">Máte neuložené změny.</p>
              ) : (
                <p className="text-text-doplnek">Zatím žádné změny.</p>
              )}
            </div>
          </div>
        </div>
      </form>

      <NovaSluzba sluzby={ulozene} zablokovano={neulozeno} />
    </div>
  );
}

function NovaSluzba({
  sluzby,
  zablokovano,
}: {
  sluzby: readonly Sluzba[];
  /** V seznamu jsou neuložené změny — přechod na novou službu by je zahodil. */
  zablokovano: boolean;
}) {
  const id = useId();
  const router = useRouter();
  const [nazev, setNazev] = useState("");
  const [slug, setSlug] = useState("");
  // Adresa se doplňuje z názvu, dokud ji klientka sama nezmění.
  const [slugRucne, setSlugRucne] = useState(false);
  const [chyba, setChyba] = useState<{ pole?: "nazev" | "slug"; zprava: string }>();
  const [pridava, zacniPridavat] = useTransition();

  const plno = sluzby.length >= MAX_SLUZEB;
  const chybaSlugu = slug ? chybaAdresy(slug, sluzby) : undefined;

  function pridej() {
    setChyba(undefined);
    zacniPridavat(async () => {
      let vysledek: StavSluzeb;
      try {
        vysledek = await pridejSluzbu(nazev, slug);
      } catch {
        vysledek = { stav: "chyba", zprava: "Spojení se serverem se přerušilo. Zkuste to znovu." };
      }
      if (vysledek.stav === "pridano") {
        router.push(`/admin/${vysledek.klic}`);
        return;
      }
      if (vysledek.stav === "chyba") setChyba({ pole: vysledek.pole, zprava: vysledek.zprava });
    });
  }

  return (
    <section className="border-linka mt-6 rounded-lg border bg-white p-4 sm:p-5">
      <h2 className="text-lg font-bold">Přidat novou službu</h2>
      <p className="text-text-doplnek mt-1 text-sm">
        Nová služba je nejdřív skrytá. Doplníte texty a fotku a pak ji
        v seznamu nahoře zapnete.
      </p>

      {plno ? (
        <p className="mt-3 font-semibold">
          Služeb je {MAX_SLUZEB}, víc se jich do menu nevejde. Nejdřív nějakou smažte.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            pridej();
          }}
          className="mt-3 grid gap-x-4 gap-y-3 md:grid-cols-2"
        >
          <div>
            <label htmlFor={`${id}-nazev`} className="block text-[0.9375rem] font-semibold">
              Název služby <span aria-hidden>*</span>
            </label>
            <input
              id={`${id}-nazev`}
              value={nazev}
              maxLength={60}
              required
              aria-invalid={chyba?.pole === "nazev" || undefined}
              onChange={(e) => {
                setNazev(e.target.value);
                if (!slugRucne) setSlug(vytvorSlug(e.target.value));
              }}
              className={`${VSTUP} mt-1 py-2`}
            />
            <p className="text-text-doplnek text-sm">Například „Lymfodrenáž“.</p>
          </div>
          <div>
            <label htmlFor={`${id}-slug`} className="block text-[0.9375rem] font-semibold">
              Adresa stránky <span aria-hidden>*</span>
            </label>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-text-doplnek">/</span>
              <input
                id={`${id}-slug`}
                value={slug}
                maxLength={60}
                required
                aria-invalid={Boolean(chybaSlugu) || chyba?.pole === "slug" || undefined}
                aria-describedby={`${id}-slug-napoveda`}
                onChange={(e) => {
                  setSlugRucne(true);
                  setSlug(e.target.value.toLowerCase());
                }}
                className={`${VSTUP} py-2`}
              />
            </div>
            <p id={`${id}-slug-napoveda`} className="text-text-doplnek text-sm">
              Vyplní se sama z názvu. Po vytvoření se už nemění.
            </p>
            {chybaSlugu ? (
              <p className="text-chyba text-sm font-semibold">{chybaSlugu}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={pridava || zablokovano || !nazev.trim() || Boolean(chybaSlugu)}
              className={TLACITKO}
            >
              {pridava ? "Přidává se…" : "+ Přidat službu"}
            </button>
            {zablokovano ? (
              <span className="text-text-doplnek text-sm">
                Nejdřív uložte změny v seznamu nahoře.
              </span>
            ) : null}
            {chyba ? (
              <p data-chyba className="text-chyba text-sm font-semibold">
                {chyba.zprava}
              </p>
            ) : null}
          </div>
        </form>
      )}
    </section>
  );
}
