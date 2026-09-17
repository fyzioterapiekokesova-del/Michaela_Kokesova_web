"use client";

import { useActionState, useId } from "react";
import { odeslatKontakt } from "@/app/akce/kontakt";
import type { StavFormulare } from "@/lib/formular/schema";
import { Tlacitko } from "./tlacitko";

/**
 * Kontaktní formulář.
 *
 * Čtyři stavy: prázdný · chyba u konkrétního pole · odesílá se · odesláno.
 * Odesláno je vlastní stránka `/dekujeme`, kam se po úspěchu přesměruje.
 *
 * Popisek je **nad polem**, ne jen zástupný text — ten při psaní zmizí
 * a člověk už neví, co do pole patří.
 *
 * Bez JavaScriptu se formulář odešle taky: `action` je Server Action.
 */

const VYCHOZI: StavFormulare = { stav: "prazdny" };

export function FormularKontakt() {
  const [stav, akce, ceka] = useActionState(odeslatKontakt, VYCHOZI);
  const id = useId();

  const h = stav.hodnoty;

  return (
    <form action={akce} noValidate className="bg-plocha rounded-dlazdice p-7 lg:p-10">
      <h3 className="text-h3 lg:text-h3-pc">Napište mi</h3>

      <p className="text-telo lg:text-telo-pc mt-3">
        Zdravotní potíže prosím nepopisujte tady — proberu je s vámi osobně
        nebo po telefonu.
      </p>

      {stav.zprava ? (
        <p
          role="alert"
          className="bg-povrch rounded-karta text-telo lg:text-telo-pc mt-6 px-5 py-4 font-bold"
        >
          {stav.zprava}
        </p>
      ) : null}

      <div className="mt-6 grid gap-5">
        <Pole
          id={`${id}-jmeno`}
          jmeno="jmeno"
          popisek="Jméno"
          povinne
          vychozi={h?.jmeno}
          chyba={stav.chyby?.jmeno}
          autoComplete="name"
        />
        <Pole
          id={`${id}-email`}
          jmeno="email"
          popisek="E-mail"
          typ="email"
          povinne
          vychozi={h?.email}
          chyba={stav.chyby?.email}
          autoComplete="email"
        />
        <Pole
          id={`${id}-telefon`}
          jmeno="telefon"
          popisek="Telefon"
          napoveda="Nepovinné. Napište ho, pokud je vám milejší, když zavolám."
          typ="tel"
          vychozi={h?.telefon}
          chyba={stav.chyby?.telefon}
          autoComplete="tel"
        />
        <Pole
          id={`${id}-zprava`}
          jmeno="zprava"
          popisek="Zpráva"
          viceradkovy
          povinne
          vychozi={h?.zprava}
          chyba={stav.chyby?.zprava}
        />
      </div>

      {/* Past na roboty. Člověk tohle pole nevidí a nedostane se do něj
          ani tabulátorem, takže ho nikdy nevyplní. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-web`}>Webová stránka</label>
        <input
          id={`${id}-web`}
          type="text"
          name="web"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mt-7">
        <Tlacitko typ="submit" zablokovano={ceka} akce="formular-odeslat">
          {ceka ? "Odesílám…" : "Odeslat zprávu"}
        </Tlacitko>
      </div>

      <p className="text-telo text-text-doplnek mt-5">
        Zpráva se nikam neukládá — přijde mi e-mailem a vám dorazí potvrzení.
      </p>
    </form>
  );
}

function Pole({
  id,
  jmeno,
  popisek,
  napoveda,
  typ = "text",
  viceradkovy = false,
  povinne = false,
  vychozi,
  chyba,
  autoComplete,
}: {
  id: string;
  jmeno: string;
  popisek: string;
  napoveda?: string;
  typ?: string;
  viceradkovy?: boolean;
  povinne?: boolean;
  vychozi?: string;
  chyba?: string;
  autoComplete?: string;
}) {
  const idChyby = `${id}-chyba`;
  const idNapovedy = `${id}-napoveda`;
  const popis =
    [chyba ? idChyby : null, napoveda ? idNapovedy : null].filter(Boolean).join(" ") ||
    undefined;

  const trida =
    "bg-povrch rounded-karta text-telo lg:text-telo-pc w-full px-4 py-3.5 " +
    (chyba ? "outline outline-2 outline-text" : "");

  return (
    <div>
      <label htmlFor={id} className="text-odkaz lg:text-odkaz-pc block">
        {popisek}
        {povinne ? null : (
          <span className="text-text-doplnek font-normal"> — nepovinné</span>
        )}
      </label>

      {napoveda ? (
        <p id={idNapovedy} className="text-telo text-text-doplnek mt-1">
          {napoveda}
        </p>
      ) : null}

      <div className="mt-2">
        {viceradkovy ? (
          <textarea
            id={id}
            name={jmeno}
            rows={6}
            required={povinne}
            defaultValue={vychozi}
            aria-invalid={chyba ? true : undefined}
            aria-describedby={popis}
            className={trida}
          />
        ) : (
          <input
            id={id}
            name={jmeno}
            type={typ}
            required={povinne}
            defaultValue={vychozi}
            autoComplete={autoComplete}
            aria-invalid={chyba ? true : undefined}
            aria-describedby={popis}
            className={trida}
          />
        )}
      </div>

      {chyba ? (
        <p id={idChyby} className="text-telo mt-2 font-bold">
          {chyba}
        </p>
      ) : null}
    </div>
  );
}
