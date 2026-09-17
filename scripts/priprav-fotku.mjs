/**
 * Ořízne vypálený rám a spodní lištu s názvem souboru z náhledu od fotografa
 * a uloží fotku do public/fotky/ ve WebP.
 *
 * Rám je vidět jako bílá linka na řádcích 10 a 991 a ve sloupcích 10 a 664 —
 * ořezává se těsně za ní.
 *
 * DOČASNÉ: až bude Supabase, fotka se nahraje přes administraci a tenhle
 * soubor i skript se smažou.
 */
import sharp from "sharp";
import fs from "node:fs";

const ZDROJ = "C:/Users/nadamcova/Reponik/Michaela Kokesova web/royal_academy_portraits-131.jpg";
const CIL = "public/fotky/michaela-portret.webp";

(async () => {
  fs.mkdirSync("public/fotky", { recursive: true });
  await sharp(ZDROJ)
    .extract({ left: 11, top: 11, width: 653, height: 980 })
    .webp({ quality: 82 })
    .toFile(CIL);

  const m = await sharp(CIL).metadata();
  const kb = Math.round(fs.statSync(CIL).size / 1024);
  console.log(`${CIL} — ${m.width}×${m.height}, ${kb} kB`);
})();
