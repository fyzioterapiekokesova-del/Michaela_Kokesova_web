import type { ReactNode } from "react";

/**
 * Obal sekce. Sekce se střídají v pozadí a odděluje je azurová linka —
 * žádné rámečky ani stíny, odlišení dělá jen posun barvy.
 */
export function Sekce({
  id,
  stitek,
  nadpis,
  perex,
  plocha = false,
  bezLinky = false,
  children,
}: {
  id?: string;
  stitek?: string;
  nadpis?: string;
  perex?: string;
  /** Sudá sekce — tmavší podklad. */
  plocha?: boolean;
  bezLinky?: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`sekce ${plocha ? "bg-plocha" : "bg-povrch"} ${
        bezLinky ? "" : "border-azurova border-t-[3px]"
      }`}
    >
      <div className="obal">
        {stitek ? (
          <p className="text-stitek lg:text-stitek-pc text-text-doplnek uppercase">
            {stitek}
          </p>
        ) : null}
        {nadpis ? (
          <h2 className={`text-h2 lg:text-h2-pc ${stitek ? "mt-2" : ""}`}>
            {nadpis}
          </h2>
        ) : null}
        {perex ? (
          <p className="text-perex lg:text-perex-pc text-text-doplnek mt-3 max-w-[62ch] whitespace-pre-line">
            {perex}
          </p>
        ) : null}
        {children ? <div className={nadpis || perex ? "mt-8" : ""}>{children}</div> : null}
      </div>
    </section>
  );
}
