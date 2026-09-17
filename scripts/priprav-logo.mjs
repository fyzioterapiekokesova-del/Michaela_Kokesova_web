/**
 * Připraví podoby akvarelového loga od klientky.
 *
 *  - `znacka.webp`    — jen kresba chodidla, do hlavičky vedle jména.
 *                       Celá sestava má jméno vysázené uvnitř obrázku a
 *                       v hlavičce vysoké 88 px by vyšlo na osm pixelů.
 *  - `logo-uvod.webp` — celá sestava i se jménem, do obrazového místa v heru.
 *  - `icon.png`       — favicon ze značky.
 *  - `opengraph-image.png` — obrázek pro sdílení.
 *
 * Značka i sestava jsou **průhledné**. Bílý podklad by se proti #FBFBFA
 * projevil jako světlejší obdélník, tedy jako rámeček kolem loga.
 *
 * Favicon a obrázek pro sdílení si bílé pozadí nechávají schválně —
 * průhledný favicon zmizí na tmavém motivu prohlížeče.
 */
import sharp from "sharp";
import fs from "node:fs";

const ZDROJ =
  "C:/Users/nadamcova/Reponik/Michaela Kokesova web/WhatsApp Image 2026-08-18 at 20.36.15 (1).jpeg";

/**
 * Udělá průhledné jen **pozadí**, ne každý bílý pixel.
 *
 * Kresba má bílé kosti. Kdyby se prostě odbarvila každá bílá, byly by v nich
 * díry. Proto se vyplavuje od okrajů dovnitř: průhledné je to, co je světlé
 * **a zároveň souvisle spojené s okrajem obrázku**.
 */
async function odstranPozadi(vstup, prah = 234) {
  const { data, info } = await sharp(vstup)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;
  const navstiveno = new Uint8Array(w * h);
  const fronta = new Int32Array(w * h);
  let konec = 0;

  const svetly = (p) => {
    const o = p * 4;
    return data[o] >= prah && data[o + 1] >= prah && data[o + 2] >= prah;
  };
  const pridej = (p) => {
    if (navstiveno[p] || !svetly(p)) return;
    navstiveno[p] = 1;
    fronta[konec++] = p;
  };

  for (let x = 0; x < w; x++) {
    pridej(x);
    pridej((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    pridej(y * w);
    pridej(y * w + w - 1);
  }

  for (let zacatek = 0; zacatek < konec; zacatek++) {
    const p = fronta[zacatek];
    const x = p % w;
    const y = (p / w) | 0;
    if (x > 0) pridej(p - 1);
    if (x < w - 1) pridej(p + 1);
    if (y > 0) pridej(p - w);
    if (y < h - 1) pridej(p + w);
  }

  let pruhlednych = 0;
  for (let p = 0; p < w * h; p++) {
    if (navstiveno[p]) {
      data[p * 4 + 3] = 0;
      pruhlednych++;
    }
  }

  console.log(
    `  průhledné pozadí: ${Math.round((pruhlednych / (w * h)) * 100)} % plochy`,
  );

  return sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toBuffer();
}

(async () => {
  const m = await sharp(ZDROJ).metadata();
  fs.mkdirSync("public/logo", { recursive: true });

  // Horní část obrázku = samotná kresba, bez skriptového nápisu a jména.
  const orez = await sharp(ZDROJ)
    .extract({ left: 0, top: 0, width: m.width, height: Math.round(m.height * 0.66) })
    .toBuffer();

  const znacka = await sharp(orez).trim({ threshold: 12 }).toBuffer();
  const i = await sharp(znacka).metadata();
  console.log(`značka po oříznutí bílé: ${i.width}×${i.height}`);

  console.log("značka do hlavičky:");
  const znackaPruhledna = await odstranPozadi(znacka);
  await sharp(znackaPruhledna)
    .resize({ height: 200 })
    .webp({ quality: 90 })
    .toFile("public/logo/znacka.webp");

  // Favicon si bílé pozadí nechává — průhledný by na tmavém motivu zmizel.
  await sharp(znacka)
    .resize(460, 460, { fit: "contain", background: "#ffffff" })
    .extend({ top: 26, bottom: 26, left: 26, right: 26, background: "#ffffff" })
    .png()
    .toFile("src/app/icon.png");

  const cela = await sharp(ZDROJ).trim({ threshold: 12 }).toBuffer();

  console.log("celá sestava do hera:");
  const celaPruhledna = await odstranPozadi(cela);
  await sharp(celaPruhledna)
    .resize({ height: 980 })
    .webp({ quality: 90 })
    .toFile("public/logo/logo-uvod.webp");

  // Obrázek pro sdílení musí mít podklad — průhlednost si každá aplikace
  // vybarví po svém a text by se ztratil.
  await sharp(cela)
    .resize(1000, 500, { fit: "contain", background: "#ffffff" })
    .extend({ top: 65, bottom: 65, left: 100, right: 100, background: "#ffffff" })
    .png()
    .toFile("src/app/opengraph-image.png");

  for (const f of [
    "public/logo/znacka.webp",
    "public/logo/logo-uvod.webp",
    "src/app/icon.png",
    "src/app/opengraph-image.png",
  ]) {
    const meta = await sharp(f).metadata();
    console.log(
      `${f} — ${meta.width}×${meta.height}, ${meta.hasAlpha ? "průhledné" : "s podkladem"}, ${Math.round(fs.statSync(f).size / 1024)} kB`,
    );
  }
})();
