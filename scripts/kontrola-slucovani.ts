/**
 * Kontrola slučování obsahu.  Spuštění:  npm run kontrola
 *
 * Ověřuje akceptační kritéria z CLAUDE.md, na která se v prohlížeči špatně
 * kliká, protože jsou vidět až v datech:
 *
 *  - uložení textů nepřepíše cesty k nahraným fotkám,
 *  - zapíšou se jen pole, která schéma zná,
 *  - odkaz nesmí vést na stránku, která na webu neexistuje,
 *  - popisek fotky je povinný, ale až když je fotka nahraná,
 *  - přehození položek v seznamu nepřehodí jejich fotky.
 */

import { zvalidujASluc } from "../src/lib/admin/slucovani.ts";
import { najdiSekci } from "../src/lib/admin/obsah-schema.ts";

let spadlo = 0;

function overit(nazev: string, podminka: boolean) {
  if (podminka) {
    console.log(`  ok   ${nazev}`);
  } else {
    console.error(`  CHYBA ${nazev}`);
    spadlo += 1;
  }
}

const hero = najdiSekci("hero")!;
const ordinace = najdiSekci("ordinace")!;
const potize = najdiSekci("potize")!;

/* 1. Uložení textů nesmí ztratit fotku ------------------------------------- */

const puvodniHero = {
  nadpis: "Starý nadpis",
  tlacitko_1: "Zavolat",
  rozvrzeni: "dva-sloupce",
  fotka: "hero/2026-fotka.webp",
  fotka_popis: "Michaela ve své ordinaci",
  fotka_pozice: "30% 70%",
  fotka_zoom: 1.5,
};

// Formulář poslal jen texty — klíč `fotka` v něm vůbec není.
const jenTexty = zvalidujASluc(
  hero,
  { nadpis: "Nový nadpis", tlacitko_1: "Zavolat", rozvrzeni: "dva-sloupce" },
  puvodniHero,
);

overit("uložení textů projde", jenTexty.stav === "ok");
if (jenTexty.stav === "ok") {
  overit(
    "cesta k fotce zůstala zachovaná",
    jenTexty.hodnota.fotka === "hero/2026-fotka.webp",
  );
  overit("nový nadpis se uložil", jenTexty.hodnota.nadpis === "Nový nadpis");
  // Výřez je stejně křehký jako cesta k fotce — nastavuje se jinde než texty,
  // takže by ho uložení textů zahodilo úplně stejně snadno.
  overit(
    "nastavený výřez zůstal zachovaný",
    jenTexty.hodnota.fotka_pozice === "30% 70%",
  );
  overit("přiblížení zůstalo zachované", jenTexty.hodnota.fotka_zoom === 1.5);
}

/* 1b. Odebrání fotky musí odebrat i její výřez ----------------------------- */

const odebraniSVyrezem = zvalidujASluc(
  hero,
  { nadpis: "Nadpis", tlacitko_1: "Zavolat", rozvrzeni: "jeden-sloupec", fotka: "", fotka_popis: "" },
  puvodniHero,
);

if (odebraniSVyrezem.stav === "ok") {
  overit(
    "po odebrání fotky se výřez vrátí na střed, ať se nezdědí na další fotku",
    odebraniSVyrezem.hodnota.fotka_pozice === "50% 50%" &&
      odebraniSVyrezem.hodnota.fotka_zoom === 1,
  );
}

/* 1c. Podvržené ohnisko se nesmí uložit ------------------------------------ */

const podvrzeny = zvalidujASluc(
  hero,
  {
    nadpis: "Nadpis",
    tlacitko_1: "Zavolat",
    rozvrzeni: "dva-sloupce",
    fotka: "hero/2026-fotka.webp",
    fotka_popis: "Michaela",
    fotka_pozice: "50% 50%; background: url(zlo)",
    fotka_zoom: 999,
  },
  puvodniHero,
);

if (podvrzeny.stav === "ok") {
  overit(
    "podvržené ohnisko se zahodí a uloží se střed",
    podvrzeny.hodnota.fotka_pozice === "50% 50%",
  );
  overit(
    "nesmyslné přiblížení se srazí na maximum",
    podvrzeny.hodnota.fotka_zoom === 4,
  );
}

/* 2. Prázdný řetězec fotku odebere ----------------------------------------- */

const odebrani = zvalidujASluc(
  hero,
  { nadpis: "Nadpis", tlacitko_1: "Zavolat", rozvrzeni: "jeden-sloupec", fotka: "", fotka_popis: "" },
  puvodniHero,
);
overit(
  "prázdný řetězec fotku odebere",
  odebrani.stav === "ok" && odebrani.hodnota.fotka === "",
);

/* 3. Neznámé pole se zahodí ------------------------------------------------ */

const smeti = zvalidujASluc(
  hero,
  { nadpis: "Nadpis", tlacitko_1: "Zavolat", rozvrzeni: "jeden-sloupec", podstrceno: "zlo" },
  puvodniHero,
);
overit(
  "pole mimo schéma se neuloží",
  smeti.stav === "ok" && !("podstrceno" in smeti.hodnota),
);

/* 4. Odkaz na neexistující stránku neprojde -------------------------------- */

const spatnyOdkaz = zvalidujASluc(
  potize,
  {
    polozky: [{ _id: "a", text: "Bolí mě pata", href: "/neexistuje" }],
    telefon_text: "Nevím — radši zavolám",
  },
  {},
);
overit("odkaz na neexistující stránku se odmítne", spatnyOdkaz.stav === "chyba");

const dobryOdkaz = zvalidujASluc(
  potize,
  {
    polozky: [{ _id: "a", text: "Bolí mě pata", href: "/podologie" }],
    telefon_text: "Nevím — radši zavolám",
  },
  {},
);
overit("odkaz na existující stránku projde", dobryOdkaz.stav === "ok");

/* 5. Popisek fotky je povinný, ale až když fotka je ------------------------ */

const bezFotky = zvalidujASluc(
  hero,
  { nadpis: "Nadpis", tlacitko_1: "Zavolat", rozvrzeni: "jeden-sloupec", fotka: "", fotka_popis: "" },
  {},
);
overit("sekce bez fotky jde uložit i bez popisku", bezFotky.stav === "ok");

const fotkaBezPopisku = zvalidujASluc(
  hero,
  {
    nadpis: "Nadpis",
    tlacitko_1: "Zavolat",
    rozvrzeni: "dva-sloupce",
    fotka: "hero/fotka.webp",
    fotka_popis: "",
  },
  {},
);
overit("fotka bez popisku se odmítne", fotkaBezPopisku.stav === "chyba");

/* 6. Přehození položek nepřehodí fotky ------------------------------------- */

const puvodniOrdinace = {
  zobrazit: true,
  nadpis: "Ordinace",
  fotky: [
    { _id: "prvni", cesta: "ordinace/a.webp", popis: "Čekárna" },
    { _id: "druha", cesta: "ordinace/b.webp", popis: "Lehátko" },
  ],
};

// Klientka prohodila pořadí a jen přepsala popisky.
const prehozeno = zvalidujASluc(
  ordinace,
  {
    zobrazit: true,
    nadpis: "Ordinace",
    fotky: [
      { _id: "druha", popis: "Lehátko a okno" },
      { _id: "prvni", popis: "Čekárna" },
    ],
  },
  puvodniOrdinace,
);

if (prehozeno.stav === "ok") {
  const fotky = prehozeno.hodnota.fotky as { _id: string; cesta: string }[];
  overit("po přehození sedí první fotka", fotky[0].cesta === "ordinace/b.webp");
  overit("po přehození sedí druhá fotka", fotky[1].cesta === "ordinace/a.webp");
} else {
  overit("přehození položek projde", false);
}

/* 7. Cesta k fotce musí mít rozumný tvar ----------------------------------- */

const utek = zvalidujASluc(
  hero,
  {
    nadpis: "Nadpis",
    tlacitko_1: "Zavolat",
    rozvrzeni: "dva-sloupce",
    fotka: "../../../etc/passwd.png",
    fotka_popis: "nic",
  },
  {},
);
overit("cesta s ../ se odmítne", utek.stav === "chyba");

console.log(
  spadlo === 0 ? "\nVšechno prošlo." : `\n${spadlo} kontrol neprošlo.`,
);
process.exit(spadlo === 0 ? 0 : 1);
