"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { StavPrihlaseni } from "@/app/admin/akce/prihlaseni";

/**
 * Přihlašovací formulář a formulář pro zapomenuté heslo.
 *
 * Je to jedna komponenta, protože se liší jen jedním polem — a hlavně proto,
 * aby se hlášky nerozjely. Chybová věta nikdy neprozradí, jestli účet
 * existuje; o to se stará server, tady se jen vypíše, co pošle.
 */

type Vlastnosti = {
  akce: (stav: StavPrihlaseni, formular: FormData) => Promise<StavPrihlaseni>;
  /** S heslem, nebo jen e-mail na zaslání odkazu. */
  sHeslem: boolean;
  popisTlacitka: string;
};

const VSTUP =
  "border-linka bg-povrch rounded-polozka mt-2 w-full border px-4 py-3 " +
  "text-[1.0625rem] focus:border-text";

function Tlacitko({ popis }: { popis: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="klik rounded-tlacitko bg-azurova text-text hover:bg-text hover:text-azurova mt-8 w-full justify-center px-10 py-5 text-[1.3125rem] font-extrabold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Odesílá se…" : popis}
    </button>
  );
}

export function FormularPrihlaseni({ akce, sHeslem, popisTlacitka }: Vlastnosti) {
  const [stav, odesli] = useActionState<StavPrihlaseni, FormData>(akce, {
    stav: "prazdno",
  });

  return (
    <form action={odesli}>
      <div>
        <label htmlFor="email" className="block font-bold">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={stav.email}
          className={VSTUP}
        />
      </div>

      {sHeslem ? (
        <div className="mt-6">
          <label htmlFor="heslo" className="block font-bold">
            Heslo
          </label>
          <input
            id="heslo"
            name="heslo"
            type="password"
            autoComplete="current-password"
            required
            className={VSTUP}
          />
        </div>
      ) : null}

      <div className="mt-6" aria-live="polite">
        {stav.zprava ? <p className="font-bold">{stav.zprava}</p> : null}
      </div>

      <Tlacitko popis={popisTlacitka} />
    </form>
  );
}
