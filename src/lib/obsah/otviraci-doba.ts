/**
 * Převod otevírací doby z textu do strukturovaných dat.
 *
 * Klientka píše otevírací dobu volným textem, každý den na řádek. Tenhle
 * převod z toho vytáhne, co se dá spolehlivě přečíst — a co přečíst nejde,
 * **zahodí**. Do strukturovaných dat je lepší nedat nic než nesmysl:
 * špatná otevírací doba ve vyhledávání pošle člověka k zavřeným dveřím.
 */

const DNY: Record<string, string> = {
  po: "Monday",
  pondeli: "Monday",
  ut: "Tuesday",
  utery: "Tuesday",
  st: "Wednesday",
  streda: "Wednesday",
  ct: "Thursday",
  ctvrtek: "Thursday",
  pa: "Friday",
  patek: "Friday",
  so: "Saturday",
  sobota: "Saturday",
  ne: "Sunday",
  nedele: "Sunday",
};

const PORADI = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export type DobaSpecifikace = {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
};

/** „Pondělí" → „pondeli"; háčky a čárky pryč, ať se dá porovnávat. */
function bezDiakritiky(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function den(kus: string): string | undefined {
  return DNY[bezDiakritiky(kus)];
}

function cas(s: string): string | undefined {
  const m = s.match(/^(\d{1,2})[:.](\d{2})$/);
  if (!m) return undefined;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return undefined;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function prevedOtviraciDobu(text?: string): DobaSpecifikace[] {
  if (!text) return [];

  const vysledek: DobaSpecifikace[] = [];

  for (const radek of text.split("\n")) {
    const cisty = radek.trim();
    if (cisty === "") continue;

    // Rozdělí řádek na část se dny a část s časem.
    const casy = cisty.match(/(\d{1,2}[:.]\d{2})\s*[–—-]\s*(\d{1,2}[:.]\d{2})/);
    if (!casy) continue;

    const od = cas(casy[1]);
    const do_ = cas(casy[2]);
    if (!od || !do_) continue;

    const castSDny = cisty.slice(0, casy.index).trim();
    if (castSDny === "") continue;

    // „Po–Pá" je rozsah, „Po, St" nebo „Pondělí" jsou jednotlivé dny.
    const rozsah = castSDny.match(/^([\p{L}]+)\s*[–—-]\s*([\p{L}]+)$/u);
    let dny: string[] = [];

    if (rozsah) {
      const zacatek = den(rozsah[1]);
      const konec = den(rozsah[2]);
      if (!zacatek || !konec) continue;
      const i = PORADI.indexOf(zacatek);
      const j = PORADI.indexOf(konec);
      if (i < 0 || j < 0 || j < i) continue;
      dny = PORADI.slice(i, j + 1);
    } else {
      dny = castSDny
        .split(/[,;+/]|\s+a\s+/)
        .map((k) => den(k.trim()))
        .filter((d): d is string => Boolean(d));
    }

    if (dny.length === 0) continue;

    vysledek.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dny,
      opens: od,
      closes: do_,
    });
  }

  return vysledek;
}
