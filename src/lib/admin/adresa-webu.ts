/**
 * Kam vedou odkazy „Zobrazit web" z administrace.
 *
 * Nesmí to být `/`: administrace běží na vlastní poddoméně a tam proxy
 * kořen přesměruje zpátky do administrace — odkaz pak vedl dokola.
 *
 * Až bude připojená hlavní doména, stačí ve Vercelu nastavit `WEB_URL`.
 * Do té doby produkční adresa na Vercelu; lokálně web běží na stejné
 * adrese jako administrace, takže stačí cesta.
 *
 * Volat jen na serveru — `VERCEL` ani `WEB_URL` se do prohlížeče nedostanou.
 */
export function adresaWebu(cesta = "/"): string {
  const zNastaveni = process.env.WEB_URL?.trim();
  const zaklad =
    zNastaveni || (process.env.VERCEL ? "https://michaela-kokesova-web.vercel.app" : "");
  return `${zaklad.replace(/\/$/, "")}${cesta}`;
}
