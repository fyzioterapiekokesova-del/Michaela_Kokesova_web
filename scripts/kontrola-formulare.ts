/**
 * Kontrola validace kontaktního formuláře a omezení frekvence.
 * Spuštění:  npm run kontrola:formular
 *
 * Ověřuje to, co se v prohlížeči špatně klikne: že validace na serveru
 * opravdu odmítne, co má, a že past na roboty i omezení frekvence fungují.
 */

import { SCHEMA_KONTAKT } from "../src/lib/formular/schema.ts";
import { zkusPusit } from "../src/lib/formular/omezeni.ts";
import { rozdelPrijemce } from "../src/lib/formular/posli.ts";

let spadlo = 0;

function overit(nazev: string, podminka: boolean) {
  if (podminka) console.log(`  ok   ${nazev}`);
  else {
    console.error(`  CHYBA ${nazev}`);
    spadlo += 1;
  }
}

const platne = {
  jmeno: "Jana Nováková",
  email: "jana@example.cz",
  telefon: "728 234 820",
  zprava: "Dobrý den, ráda bych se objednala.",
  kontrola: "",
};

overit("platná zpráva projde", SCHEMA_KONTAKT.safeParse(platne).success);

overit(
  "prázdné jméno neprojde",
  !SCHEMA_KONTAKT.safeParse({ ...platne, jmeno: "" }).success,
);
overit(
  "prázdný e-mail neprojde",
  !SCHEMA_KONTAKT.safeParse({ ...platne, email: "" }).success,
);
overit(
  "e-mail bez zavináče neprojde",
  !SCHEMA_KONTAKT.safeParse({ ...platne, email: "jana.example.cz" }).success,
);
overit(
  "e-mail bez domény neprojde",
  !SCHEMA_KONTAKT.safeParse({ ...platne, email: "jana@example" }).success,
);
overit(
  "krátká zpráva neprojde",
  !SCHEMA_KONTAKT.safeParse({ ...platne, zprava: "ahoj" }).success,
);
overit(
  "telefon je nepovinný",
  SCHEMA_KONTAKT.safeParse({ ...platne, telefon: "" }).success,
);
overit(
  "nesmyslný telefon neprojde",
  !SCHEMA_KONTAKT.safeParse({ ...platne, telefon: "zavolejte mi" }).success,
);
overit(
  "vyplněná past na roboty neprojde",
  !SCHEMA_KONTAKT.safeParse({ ...platne, kontrola: "http://spam.example" }).success,
);
overit(
  "moc dlouhá zpráva neprojde",
  !SCHEMA_KONTAKT.safeParse({ ...platne, zprava: "a".repeat(2001) }).success,
);

// Text se ořezává, aby se do jména nedaly propašovat mezery a odřádkování.
const orez = SCHEMA_KONTAKT.safeParse({ ...platne, jmeno: "  Jana  " });
overit(
  "jméno se ořízne",
  orez.success && orez.data.jmeno === "Jana",
);

/* Omezení frekvence ------------------------------------------------------- */

const klic = `test-${Math.random()}`;
const vysledky = [1, 2, 3, 4, 5].map(() => zkusPusit(klic, 5).pusti);
overit("prvních pět zpráv projde", vysledky.every(Boolean));

const seste = zkusPusit(klic, 5);
overit("šestá zpráva se odmítne", !seste.pusti);
overit(
  "odmítnutí říká, za jak dlouho to jde zkusit znovu",
  !seste.pusti && seste.zaSekund > 0,
);

const jinyKlic = zkusPusit(`test-${Math.random()}`, 5);
overit("jiná adresa omezením zasažená není", jinyKlic.pusti);

console.log("Příjemci zpráv z formuláře");
overit(
  "jedna adresa zůstane jedna",
  rozdelPrijemce("nekdo@example.com").join("|") === "nekdo@example.com",
);
overit(
  "dvě adresy oddělené čárkou se rozdělí",
  rozdelPrijemce("a@example.com, b@example.cz").join("|") ===
    "a@example.com|b@example.cz",
);
overit(
  "středník funguje stejně jako čárka",
  rozdelPrijemce("a@example.com; b@example.cz").length === 2,
);
overit(
  "mezery navíc se oříznou — jinak by Resend adresu odmítl",
  rozdelPrijemce("  a@example.com ,  b@example.cz  ").join("|") ===
    "a@example.com|b@example.cz",
);
overit(
  "čárka navíc nevyrobí prázdného příjemce",
  rozdelPrijemce("a@example.com,,").length === 1,
);
overit("prázdné pole nevrátí nikoho", rozdelPrijemce("   ").length === 0);

console.log(spadlo === 0 ? "\nVšechno prošlo." : `\n${spadlo} kontrol neprošlo.`);
process.exit(spadlo === 0 ? 0 : 1);
