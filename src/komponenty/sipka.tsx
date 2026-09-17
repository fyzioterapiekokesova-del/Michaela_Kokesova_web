/**
 * Šipka doprava. Dvě čáry otočené o 45°, žádný obrázek ani ikonová sada —
 * jeden opakující se tvar na celém webu.
 */
export function Sipka({ velikost = 11 }: { velikost?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rotate-45 border-t-[3px] border-r-[3px] border-current"
      style={{ width: velikost, height: velikost }}
    />
  );
}
