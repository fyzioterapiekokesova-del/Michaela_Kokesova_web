"use client";

/**
 * „Změna souhlasu" v patičce. Odvolat souhlas musí být stejně snadné jako
 * ho udělit, proto je tohle tlačítko na každé stránce.
 *
 * Samotnou lištu obsluhuje komponenta ze souhlasu s cookies — tady se jen
 * pošle událost, aby patička nemusela znát její vnitřek.
 */
export function TlacitkoZmenaSouhlasu() {
  return (
    <button
      type="button"
      data-akce="zmena-souhlasu"
      onClick={() => window.dispatchEvent(new CustomEvent("otevrit-souhlas"))}
      className="klik text-azurova text-telo text-left underline"
    >
      Změna souhlasu
    </button>
  );
}
