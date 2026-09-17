/**
 * Telefon a e-mail. Hlavní akce celého webu je telefon, takže se z něj nikdy
 * nesmí stát pouhý text — vždy je to `tel:` odkaz.
 */

/**
 * Číslo pro `href="tel:"`. Bez mezer, s předvolbou.
 * `728 234 820` → `+420728234820`
 */
export function telHref(cislo: string): string {
  const jenCislice = cislo.replace(/[^\d+]/g, "");
  if (jenCislice.startsWith("+")) return `tel:${jenCislice}`;
  if (jenCislice.startsWith("00")) return `tel:+${jenCislice.slice(2)}`;
  if (jenCislice.length === 9) return `tel:+420${jenCislice}`;
  return `tel:${jenCislice}`;
}

/**
 * Číslo pro čtení. Devítimístné se dělí po trojicích, aby ho starší člověk
 * přečetl na jeden pohled.
 * `+420728234820` → `728 234 820`
 */
export function telText(cislo: string): string {
  const jenCislice = cislo.replace(/\D/g, "");
  const bezPredvolby = jenCislice.startsWith("420")
    ? jenCislice.slice(3)
    : jenCislice;
  if (bezPredvolby.length !== 9) return cislo.trim();
  return bezPredvolby.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
}

export function mailtoHref(email: string): string {
  return `mailto:${email.trim()}`;
}
