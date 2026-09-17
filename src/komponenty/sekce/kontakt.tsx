import type { ReactNode } from "react";
import { mailtoHref, telHref, telText } from "@/lib/kontakt";
import { text, textNeboNic } from "@/lib/obsah/cteni";
import type { Obsah } from "@/lib/obsah/vychozi";

/**
 * Kontaktní sekce na spodku úvodní stránky. Sem míří tlačítko Kontakt
 * z menu, proto má `id="kontakt"`.
 *
 * Formulář a mapa se vkládají zvenčí — formulář přijde v kroku 7, mapa
 * v kroku 8. Co není hotové, se nevykreslí; žádné „připravujeme".
 *
 * Údaje, které klientka nedodala, se nevypisují vůbec.
 */
export function SekceKontakt({
  obsah,
  formular,
  mapa,
}: {
  obsah: Obsah;
  formular?: ReactNode;
  mapa?: ReactNode;
}) {
  const telefon = textNeboNic(obsah, "telefon");
  const email = textNeboNic(obsah, "email");
  const adresa = textNeboNic(obsah, "adresa");
  const doba = textNeboNic(obsah, "otviraci_doba");

  return (
    <section id="kontakt" className="bg-povrch border-azurova sekce border-t-[3px]">
      <div className="obal">
        <h2 className="text-h2 lg:text-h2-pc">Kontakt</h2>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <dl className="grid gap-6">
              {telefon ? (
                <div>
                  <dt className="text-stitek lg:text-stitek-pc text-text-doplnek uppercase">
                    Telefon
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={telHref(telefon)}
                      data-akce="telefon-kontakt"
                      className="klik text-h3 lg:text-h3-pc underline"
                    >
                      {telText(telefon)}
                    </a>
                  </dd>
                </div>
              ) : null}

              {email ? (
                <div>
                  <dt className="text-stitek lg:text-stitek-pc text-text-doplnek uppercase">
                    E-mail
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={mailtoHref(email)}
                      data-akce="email-kontakt"
                      className="klik text-telo lg:text-telo-pc underline"
                    >
                      {email}
                    </a>
                  </dd>
                </div>
              ) : null}

              {adresa ? (
                <div>
                  <dt className="text-stitek lg:text-stitek-pc text-text-doplnek uppercase">
                    Kde mě najdete
                  </dt>
                  <dd className="text-telo lg:text-telo-pc mt-1 whitespace-pre-line">
                    {adresa}
                  </dd>
                </div>
              ) : null}

              {doba ? (
                <div>
                  <dt className="text-stitek lg:text-stitek-pc text-text-doplnek uppercase">
                    Otevírací doba
                  </dt>
                  <dd className="text-telo lg:text-telo-pc mt-1 whitespace-pre-line">
                    {doba}
                  </dd>
                </div>
              ) : null}

              <div>
                <dt className="text-stitek lg:text-stitek-pc text-text-doplnek uppercase">
                  Provozovatel
                </dt>
                <dd className="text-telo lg:text-telo-pc mt-1">
                  Mgr. Michaela Kokešová
                  {text(obsah, "ico") ? <>, IČO {text(obsah, "ico")}</> : null}
                </dd>
              </div>
            </dl>
          </div>

          {formular ? <div>{formular}</div> : null}
        </div>

        {mapa ? <div className="mt-10">{mapa}</div> : null}
      </div>
    </section>
  );
}
