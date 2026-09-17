/**
 * Jednoduché omezení frekvence.
 *
 * Drží se v paměti procesu. Na Vercelu to znamená, že každá instance má
 * vlastní počítadlo — proti robotovi, který pošle sto zpráv za minutu, to
 * stačí, proti rozprostřenému útoku ne. Je to první vrstva, ne jediná:
 * druhá je honeypot a třetí to, že se nikam nic neukládá.
 *
 * Až bude potřeba něco pořádnějšího, patří to do databáze nebo před web.
 */

type Zaznam = { pokusy: number[]; };

const PAMET = new Map<string, Zaznam>();

/** Po hodině se zapomíná, aby paměť nerostla donekonečna. */
const OKNO_MS = 60 * 60 * 1000;

export type VysledekOmezeni = { pusti: true } | { pusti: false; zaSekund: number };

export function zkusPusit(
  klic: string,
  maxPokusu: number,
  oknoMs: number = OKNO_MS,
): VysledekOmezeni {
  const ted = Date.now();
  const zaznam = PAMET.get(klic) ?? { pokusy: [] };

  const cerstve = zaznam.pokusy.filter((t) => ted - t < oknoMs);

  if (cerstve.length >= maxPokusu) {
    const nejstarsi = Math.min(...cerstve);
    const zaSekund = Math.ceil((oknoMs - (ted - nejstarsi)) / 1000);
    PAMET.set(klic, { pokusy: cerstve });
    return { pusti: false, zaSekund };
  }

  cerstve.push(ted);
  PAMET.set(klic, { pokusy: cerstve });

  // Občasný úklid, ať mapa nebobtná z jednorázových návštěv.
  if (PAMET.size > 5000) {
    for (const [k, v] of PAMET) {
      if (v.pokusy.every((t) => ted - t >= oknoMs)) PAMET.delete(k);
    }
  }

  return { pusti: true };
}
