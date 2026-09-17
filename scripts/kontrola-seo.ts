/**
 * Kontrola převodu otevírací doby do strukturovaných dat.
 * Spuštění:  npm run kontrola:seo
 *
 * Tenhle převod je tichý — co nepřečte, to zahodí. Právě proto potřebuje
 * kontroly: špatná otevírací doba ve vyhledávání pošle člověka
 * k zavřeným dveřím.
 */

import { prevedOtviraciDobu } from "../src/lib/obsah/otviraci-doba.ts";

let spadlo = 0;

function overit(nazev: string, podminka: boolean) {
  if (podminka) console.log(`  ok   ${nazev}`);
  else {
    console.error(`  CHYBA ${nazev}`);
    spadlo += 1;
  }
}

const jeden = prevedOtviraciDobu("Pondělí 8:00–16:00");
overit("plný název dne", jeden.length === 1 && jeden[0].dayOfWeek[0] === "Monday");
overit("čas se přečte", jeden[0]?.opens === "08:00" && jeden[0]?.closes === "16:00");

const zkratka = prevedOtviraciDobu("Út 9:00-17:30");
overit(
  "zkratka dne a obyčejná pomlčka",
  zkratka.length === 1 &&
    zkratka[0].dayOfWeek[0] === "Tuesday" &&
    zkratka[0].closes === "17:30",
);

const rozsah = prevedOtviraciDobu("Po–Pá 7:00–15:00");
overit(
  "rozsah dnů se rozbalí na pět",
  rozsah.length === 1 && rozsah[0].dayOfWeek.length === 5,
);
overit(
  "rozsah začíná pondělkem a končí pátkem",
  rozsah[0]?.dayOfWeek[0] === "Monday" && rozsah[0]?.dayOfWeek[4] === "Friday",
);

const vic = prevedOtviraciDobu("Po, St 8:00–16:00");
overit("výčet dnů", vic.length === 1 && vic[0].dayOfWeek.length === 2);

const radky = prevedOtviraciDobu("Pondělí 8:00–16:00\nÚterý 9:00–17:00\n\nStředa zavřeno");
overit("víc řádků a řádek bez času se přeskočí", radky.length === 2);

overit("prázdná doba nevrátí nic", prevedOtviraciDobu("").length === 0);
overit("nevyplněná doba nevrátí nic", prevedOtviraciDobu(undefined).length === 0);
overit(
  "nesmyslný text se zahodí, ne odhadne",
  prevedOtviraciDobu("po domluvě, volejte").length === 0,
);
overit(
  "neplatný čas se zahodí",
  prevedOtviraciDobu("Pondělí 25:00–99:00").length === 0,
);
overit(
  "obrácený rozsah dnů se zahodí",
  prevedOtviraciDobu("Pá–Po 8:00–16:00").length === 0,
);

console.log(spadlo === 0 ? "\nVšechno prošlo." : `\n${spadlo} kontrol neprošlo.`);
process.exit(spadlo === 0 ? 0 : 1);
