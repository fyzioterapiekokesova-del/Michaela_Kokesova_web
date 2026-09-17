/**
 * „Jak to u mě probíhá" — číslované kroky.
 *
 * Na počítači karty vedle sebe s číslem nahoře, na mobilu číslo vlevo v řádku.
 * Číslo je součást pořadí, ne dekorace, proto je to `<ol>`.
 */

export type Krok = {
  nadpis: string;
  text: string;
};

export function Kroky({ polozky }: { polozky: readonly Krok[] }) {
  if (polozky.length === 0) return null;

  return (
    <ol className="grid list-none grid-cols-1 gap-3.5 md:grid-cols-3 md:gap-5">
      {polozky.map((krok, poradi) => (
        <li
          key={krok.nadpis}
          className="bg-povrch rounded-karta md:rounded-dlazdice flex gap-5 p-6.5 md:flex-col md:gap-0 md:p-10"
        >
          <span
            aria-hidden
            className="bg-azurova text-text rounded-[13px] md:rounded-karta flex size-12 shrink-0 items-center justify-center text-[1.375rem] font-extrabold md:mb-6 md:size-[62px] md:text-[1.75rem]"
          >
            {poradi + 1}
          </span>
          <div>
            <h3 className="text-h3 lg:text-h3-pc">{krok.nadpis}</h3>
            <p className="text-telo lg:text-telo-pc mt-2">{krok.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
