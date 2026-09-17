/**
 * Kontrola nahrávaných obrázků.
 *
 * Typ se pozná **z obsahu souboru**, ne z přípony a ne z hlavičky, kterou
 * pošle prohlížeč — obojí si útočník napíše, jak chce. Proto se čtou první
 * bajty souboru.
 *
 * SVG je zakázané schválně: může obsahovat skript a otevřené ze stejné
 * domény by ho prohlížeč spustil.
 */

export const MAX_BAJTU = 5 * 1024 * 1024; // 5 MB — stejně jako koš v Supabase

export type Format = { pripona: "jpg" | "png" | "webp"; mime: string };

const FORMATY: readonly {
  pripona: Format["pripona"];
  mime: string;
  sedi: (b: Uint8Array) => boolean;
}[] = [
  {
    pripona: "jpg",
    mime: "image/jpeg",
    sedi: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    pripona: "png",
    mime: "image/png",
    sedi: (b) =>
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    pripona: "webp",
    mime: "image/webp",
    // „RIFF" na začátku a „WEBP" na osmém bajtu.
    sedi: (b) =>
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
];

/** Vrátí formát, nebo `null`, když to není povolený obrázek. */
export function poznejFormat(bajty: Uint8Array): Format | null {
  if (bajty.length < 12) return null;
  const nalezeno = FORMATY.find((f) => f.sedi(bajty));
  return nalezeno ? { pripona: nalezeno.pripona, mime: nalezeno.mime } : null;
}

/**
 * Jméno souboru **generuje server**. Název z formuláře se nepoužije nikdy:
 * mohl by obsahovat `../`, diakritiku nebo dvojitou příponu.
 */
export function novaCesta(slozka: string, pripona: Format["pripona"]): string {
  const bezpecnaSlozka = slozka.replace(/[^a-z0-9-]/g, "") || "obsah";
  return `${bezpecnaSlozka}/${globalThis.crypto.randomUUID()}.${pripona}`;
}
