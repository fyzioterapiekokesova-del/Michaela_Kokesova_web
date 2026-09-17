import Link from "next/link";
import { MENU, PRAVNI, SLUZBY } from "@/lib/navigace";
import { mailtoHref, telHref, telText } from "@/lib/kontakt";
import { TlacitkoZmenaSouhlasu } from "./tlacitko-souhlas";

/**
 * Zápatí. Tmavé, tři sloupce, nese se pod všemi stránkami.
 *
 * Je to jediné místo na webu, kde smí být azurová barvou písma — na tmavém
 * podkladu má dostatečný kontrast.
 *
 * Údaje, které klientka zatím nedodala (adresa, otevírací doba, sociální sítě),
 * se prostě nevykreslí. Žádný prázdný řádek, žádné „doplníme".
 */

export type UdajeKontakt = {
  ico?: string;
  adresa?: string;
  telefon?: string;
  email?: string;
  otviraciDoba?: string;
  instagram?: string;
  facebook?: string;
};

export function Patka({ kontakt }: { kontakt: UdajeKontakt }) {
  const rok = new Date().getFullYear();
  const rozcestnik = MENU.filter((p) => p.druh !== "rozbaleni");

  return (
    <footer className="bg-text text-patka-text na-tmavem mt-auto">
      <div className="obal pt-14 pb-8 lg:pt-17">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {/* Zákonná identifikace provozovatele */}
          <div>
            <p className="text-h3 text-povrch">Michaela Kokešová</p>
            <p className="text-stitek lg:text-stitek-pc text-patka-nadpis mt-1 uppercase">
              fyzioterapie · podologie
            </p>

            <address className="text-telo mt-5 not-italic">
              Mgr. Michaela Kokešová
              {kontakt.ico ? (
                <>
                  <br />
                  IČO: {kontakt.ico}
                </>
              ) : null}
              {kontakt.adresa ? (
                <>
                  <br />
                  {kontakt.adresa}
                </>
              ) : null}
              {kontakt.telefon ? (
                <>
                  <br />
                  <a
                    href={telHref(kontakt.telefon)}
                    data-akce="telefon-patka"
                    className="klik text-azurova font-extrabold underline"
                  >
                    {telText(kontakt.telefon)}
                  </a>
                </>
              ) : null}
              {kontakt.email ? (
                <>
                  <br />
                  <a
                    href={mailtoHref(kontakt.email)}
                    data-akce="email-patka"
                    className="klik text-azurova underline"
                  >
                    {kontakt.email}
                  </a>
                </>
              ) : null}
            </address>

            {kontakt.otviraciDoba ? (
              <div className="mt-5">
                <p className="text-stitek lg:text-stitek-pc text-patka-nadpis uppercase">
                  Otevírací doba
                </p>
                <p className="text-telo mt-2 whitespace-pre-line">
                  {kontakt.otviraciDoba}
                </p>
              </div>
            ) : null}

            {kontakt.instagram || kontakt.facebook ? (
              <ul className="mt-5 flex list-none gap-5">
                {kontakt.instagram ? (
                  <li>
                    <a
                      href={kontakt.instagram}
                      data-akce="instagram"
                      rel="noopener noreferrer"
                      className="klik text-azurova text-telo underline"
                    >
                      Instagram
                    </a>
                  </li>
                ) : null}
                {kontakt.facebook ? (
                  <li>
                    <a
                      href={kontakt.facebook}
                      data-akce="facebook"
                      rel="noopener noreferrer"
                      className="klik text-azurova text-telo underline"
                    >
                      Facebook
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>

          {/* Rozcestník */}
          <nav aria-label="Odkazy v zápatí">
            <p className="text-stitek lg:text-stitek-pc text-patka-nadpis uppercase">
              Rozcestník
            </p>
            <ul className="mt-3 list-none">
              {rozcestnik.map((polozka) => (
                <li key={polozka.nazev}>
                  <Link
                    href={polozka.href}
                    className="klik text-azurova text-telo underline"
                  >
                    {polozka.nazev}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="text-stitek lg:text-stitek-pc text-patka-nadpis mt-6 uppercase">
              Služby
            </p>
            <ul className="mt-3 list-none">
              {SLUZBY.map((sluzba) => (
                <li key={sluzba.href}>
                  <Link
                    href={sluzba.href}
                    className="klik text-azurova text-telo underline"
                  >
                    {sluzba.nazev}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Právní */}
          <div>
            <p className="text-stitek lg:text-stitek-pc text-patka-nadpis uppercase">
              Právní
            </p>
            <ul className="mt-3 list-none">
              {PRAVNI.map((dokument) => (
                <li key={dokument.href}>
                  <Link
                    href={dokument.href}
                    className="klik text-azurova text-telo underline"
                  >
                    {dokument.nazev}
                  </Link>
                </li>
              ))}
              <li>
                <TlacitkoZmenaSouhlasu />
              </li>
            </ul>
          </div>
        </div>

        <div className="border-patka-linka mt-10 flex flex-col gap-2 border-t pt-6 sm:flex-row sm:justify-between">
          <p className="text-[0.875rem]">© {rok} Mgr. Michaela Kokešová</p>
          <p className="text-[0.875rem]">Web: Reponik — Bc. Nikola Šimková</p>
        </div>
      </div>
    </footer>
  );
}
