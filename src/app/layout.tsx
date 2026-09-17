import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

/**
 * Kořenový layout. Drží jen `<html>`, `<body>` a písmo.
 *
 * Hlavička, patička a lišta se souhlasem patří do skupiny `(web)` —
 * administrace je mít nesmí. Kdyby byly tady, zdědil by je i `/admin`.
 *
 * Manrope se přes next/font stahuje při buildu a servíruje z naší domény.
 * Prohlížeč návštěvníka se nikdy nepřipojí k fonts.gstatic.com, takže
 * Googlu neodchází jeho IP adresa a nemusíme to řešit v zásadách zpracování.
 *
 * `latin-ext` je povinná — bez ní nejsou háčky a kroužky (ě š č ř ž ů ď ť ň).
 */
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fyzioterapie a podologie České Budějovice — Michaela Kokešová",
  description:
    "Fyzioterapie, podologie a dětská fyzioterapie v Českých Budějovicích. Objednat se můžete i bez doporučení lékaře.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={`${manrope.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
