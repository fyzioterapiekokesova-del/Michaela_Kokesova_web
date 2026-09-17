/**
 * Kontrola ověřování nahrávaných obrázků.  Spuštění:  npm run kontrola:obrazky
 *
 * Ověřuje bezpečnostní kritéria z CLAUDE.md, na která se v prohlížeči
 * neklikne, protože k nim je potřeba podvržený soubor:
 *
 *  - povolené jsou jmenovitě jen jpg, png a webp,
 *  - SVG je zakázané, i když se tváří jako obrázek,
 *  - typ se pozná z obsahu souboru, ne z přípony,
 *  - jméno souboru generuje server a nikdy nepustí `../`.
 */

import { MAX_BAJTU, novaCesta, poznejFormat } from "../src/lib/admin/obrazky.ts";

let spadlo = 0;

function overit(nazev: string, podminka: boolean) {
  if (podminka) {
    console.log(`  ok   ${nazev}`);
  } else {
    console.error(`  CHYBA ${nazev}`);
    spadlo += 1;
  }
}

function bajty(...hodnoty: number[]): Uint8Array {
  // Doplní na dvanáct bajtů, kratší vstup se zahazuje rovnou.
  const pole = new Uint8Array(12);
  pole.set(hodnoty.slice(0, 12));
  return pole;
}

const JPEG = bajty(0xff, 0xd8, 0xff, 0xe0);
const PNG = bajty(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const WEBP = bajty(
  0x52, 0x49, 0x46, 0x46, 0x20, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
);
const SVG = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg">');
const GIF = bajty(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);

console.log("Povolené formáty");
overit("JPEG se pozná", poznejFormat(JPEG)?.pripona === "jpg");
overit("PNG se pozná", poznejFormat(PNG)?.pripona === "png");
overit("WEBP se pozná", poznejFormat(WEBP)?.pripona === "webp");
overit(
  "typ MIME se bere z obsahu, ne z formuláře",
  poznejFormat(PNG)?.mime === "image/png",
);

console.log("Zakázané formáty");
overit("SVG neprojde — mohlo by nést skript", poznejFormat(SVG) === null);
overit("GIF neprojde", poznejFormat(GIF) === null);
overit("prázdný soubor neprojde", poznejFormat(new Uint8Array(0)) === null);
overit("useknutý soubor neprojde", poznejFormat(new Uint8Array(4)) === null);
overit(
  "RIFF bez značky WEBP neprojde",
  poznejFormat(bajty(0x52, 0x49, 0x46, 0x46)) === null,
);

console.log("Jméno souboru");
const cesta = novaCesta("o-mne", "webp");
overit("jméno generuje server, ne formulář", /^o-mne\/[0-9a-f-]{36}\.webp$/.test(cesta));
overit("dvě nahrání nedají stejné jméno", novaCesta("o-mne", "webp") !== cesta);
overit(
  "pokus o vyskočení ze složky se zahodí",
  !novaCesta("../../tajne", "png").includes(".."),
);
overit(
  "prázdná složka nevyrobí cestu začínající lomítkem",
  !novaCesta("", "png").startsWith("/"),
);

console.log("Velikost");
overit("limit sedí s košem v Supabase (5 MB)", MAX_BAJTU === 5 * 1024 * 1024);

// Ověření, že cesty projdou i kontrolou při ukládání obsahu — tam je vlastní
// regulární výraz a kdyby se ty dva rozešly, nahraná fotka by nešla uložit.
const CESTA_FOTKY = /^[a-z0-9][a-z0-9/_-]*\.(jpe?g|png|webp)$/i;
console.log("Soulad s ukládáním obsahu");
for (const pripona of ["jpg", "png", "webp"] as const) {
  overit(
    `cesta k ${pripona} projde kontrolou při ukládání`,
    CESTA_FOTKY.test(novaCesta("hero", pripona)),
  );
}

if (spadlo > 0) {
  console.error(`\nNeprošlo: ${spadlo}`);
  process.exit(1);
}
console.log("\nVšechno prošlo.");
