import type { ReactNode } from "react";
import { Hlavicka } from "@/komponenty/hlavicka";
import { Patka } from "@/komponenty/patka";
import { Souhlas } from "@/komponenty/souhlas";
import { nactiKontakt, nactiViditelneSluzby } from "@/lib/obsah";
import { menuWebu } from "@/lib/navigace";

/**
 * Rám veřejné části webu — skip link, hlavička, patička, lišta se souhlasem.
 *
 * Není to layout, ale komponenta, protože ho potřebují dvě různá místa:
 * layout skupiny `(web)` a stránka 404. Ta musí ležet v kořeni `app/`,
 * jinak by nezachytila neznámé adresy — a bez tohohle rámu by pak vypadala
 * jako chybová hláška Nextu, ne jako součást webu.
 *
 * Administrace rám nepoužívá: nemá mít menu webu ani měřicí lištu.
 */
export async function RamWebu({ children }: { children: ReactNode }) {
  const [kontakt, sluzby] = await Promise.all([nactiKontakt(), nactiViditelneSluzby()]);

  return (
    <>
      {/* Skip link musí být první prvek stránky. */}
      <a href="#obsah" className="skip-link">
        Přejít na hlavní obsah
      </a>

      {/* Vše kromě zvětšené fotky. Otevřené zvětšení tenhle blok označí
          jako `inert`, aby se pod ním nedalo tabulátorem procházet. */}
      <div id="koren-stranky" className="flex min-h-full flex-col">
        <Hlavicka telefon={kontakt.telefon} menu={menuWebu(sluzby)} />
        <main id="obsah" className="flex-1">
          {children}
        </main>
        <Patka kontakt={kontakt} sluzby={sluzby} />
      </div>

      {/* Měření se načte teprve po souhlasu — při odmítnutí se skript
          nestáhne vůbec. */}
      <Souhlas gaId={process.env.NEXT_PUBLIC_GA_ID} />
    </>
  );
}
