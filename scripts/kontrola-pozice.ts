/**
 * Kontrola výřezu fotek.  Spuštění:  npm run kontrola:pozice
 *
 * Ohnisko se vypisuje do stylu stránky, takže na tvaru hodnoty záleží víc
 * než na pohodlí — cokoliv jiného než dvě procenta se nesmí dostat ven.
 * Hodnota přitom pochází z administrace, tedy od klientky.
 *
 * Případy převzaté z projektu Mostecká (`tests/pozice-obrazku.test.ts`),
 * přepsané do stejného tvaru jako ostatní kontroly tady.
 */

import {
  MAX_ZOOM,
  VYCHOZI_POZICE,
  VYCHOZI_ZOOM,
  jePozice,
  pozicePropStyl,
  rozlozPozici,
  slozPozici,
  stylVyrezu,
  zoomPropStyl,
} from "../src/lib/obrazky/pozice.ts";

let spadlo = 0;

function overit(nazev: string, podminka: boolean) {
  if (podminka) {
    console.log(`  ok   ${nazev}`);
  } else {
    console.error(`  CHYBA ${nazev}`);
    spadlo += 1;
  }
}

console.log("Tvar ohniska");
overit("dvě procenta oddělená mezerou projdou", jePozice("50% 50%"));
overit("krajní hodnoty projdou", jePozice("0% 100%"));
overit("jednociferné projdou", jePozice("7% 62%"));
overit("nad sto neprojde", !jePozice("101% 50%"));
overit("záporné neprojde", !jePozice("-10% 50%"));
overit("bez mezery neprojde", !jePozice("50%50%"));
overit("pixely neprojdou", !jePozice("50px 50px"));
overit("slovní zápis neprojde", !jePozice("center top"));
overit("jedno číslo neprojde", !jePozice("50%"));

console.log("Nic se nesmí propašovat do stylu stránky");
overit(
  "středník s dalším pravidlem neprojde",
  !jePozice("50% 50%; background: url(x)"),
);
overit("zavřená složená závorka neprojde", !jePozice("50% 50%}"));
overit("výraz url() neprojde", !jePozice("url(x) 50%"));
overit("co není text, neprojde", !jePozice(null) && !jePozice(42));

console.log("Rozbitá hodnota padne na střed — fotka se vždycky ukáže");
overit("platná hodnota projde beze změny", pozicePropStyl("20% 80%") === "20% 80%");
overit("nesmysl nahradí střed", pozicePropStyl("nesmysl") === VYCHOZI_POZICE);
overit("chybějící hodnota nahradí střed", pozicePropStyl(undefined) === VYCHOZI_POZICE);

console.log("Skládání a rozkládání");
overit("čísla se složí do procent", slozPozici(20, 80) === "20% 80%");
overit("hodnoty mimo rozsah se oříznou", slozPozici(-5, 140) === "0% 100%");
overit("desetinná se zaokrouhlí", slozPozici(33.4, 66.6) === "33% 67%");
overit(
  "rozklad vrátí, co se složilo",
  rozlozPozici("20% 80%").x === 20 && rozlozPozici("20% 80%").y === 80,
);
overit(
  "rozklad rozbité hodnoty vrátí střed",
  rozlozPozici("nesmysl").x === 50 && rozlozPozici("nesmysl").y === 50,
);

console.log("Přiblížení");
overit("výchozí je beze změny", zoomPropStyl(undefined) === VYCHOZI_ZOOM);
overit("pod jedničku to nepustí", zoomPropStyl(0.5) === VYCHOZI_ZOOM);
overit("nad maximum to nepustí", zoomPropStyl(99) === MAX_ZOOM);
overit("číslo v textu projde", zoomPropStyl("1.5") === 1.5);
overit("nesmysl padne na výchozí", zoomPropStyl("hodně") === VYCHOZI_ZOOM);

console.log("Styl výřezu");
{
  const styl = stylVyrezu("30% 70%", 2);
  overit("ohnisko jde do objectPosition", styl.objectPosition === "30% 70%");
  overit("přiblížení jde do transformu", styl.transform === "scale(2)");
  overit(
    "střed zvětšování je tentýž bod, jinak fotka při přiblížení ujede",
    styl.transformOrigin === "30% 70%",
  );
}
{
  const styl = stylVyrezu("50% 50%", 1);
  overit(
    "bez přiblížení se transform vůbec nevypisuje",
    styl.transform === undefined,
  );
}
{
  const styl = stylVyrezu("50% 50%; háček", 1);
  overit(
    "podvržené ohnisko se do stylu nedostane",
    styl.objectPosition === VYCHOZI_POZICE,
  );
}

if (spadlo > 0) {
  console.error(`\nNeprošlo: ${spadlo}`);
  process.exit(1);
}
console.log("\nVšechno prošlo.");
