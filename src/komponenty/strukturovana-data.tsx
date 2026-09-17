/**
 * Strukturovaná data schema.org.
 *
 * Vyhledávače i AI asistenti z toho berou název, adresu, telefon a otevírací
 * dobu. Vyplňuje se **jen to, co klientka opravdu dodala** — vymyšlená adresa
 * nebo otevírací doba by poslala člověka k zavřeným dveřím.
 */

/**
 * JSON-LD se vkládá jako obsah `<script>`, takže by ho `</script>` uvnitř
 * textu od klientky mohlo předčasně ukončit. Escapování `<` to zavírá.
 */
function bezpecnyJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function StrukturovanaData({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: bezpecnyJson(data) }}
    />
  );
}
