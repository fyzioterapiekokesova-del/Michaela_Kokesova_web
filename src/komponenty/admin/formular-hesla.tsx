"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { nastavNoveHeslo, type StavHesla } from "@/app/admin/akce/prihlaseni";

/**
 * Nastavení nového hesla po kliknutí na odkaz z e-mailu.
 *
 * Heslo se zadává dvakrát — překlep v hesle, které není vidět, by jinak
 * zamkl přístup do administrace.
 */

const VSTUP =
  "border-linka bg-povrch rounded-polozka mt-2 w-full border px-4 py-3 " +
  "text-[1.0625rem] focus:border-text";

function Tlacitko() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="klik rounded-tlacitko bg-azurova text-text hover:bg-text hover:text-azurova mt-8 w-full justify-center px-10 py-5 text-[1.3125rem] font-extrabold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Ukládá se…" : "Nastavit heslo"}
    </button>
  );
}

export function FormularHesla() {
  const [stav, odesli] = useActionState<StavHesla, FormData>(nastavNoveHeslo, {
    stav: "prazdno",
  });

  return (
    <form action={odesli}>
      <div>
        <label htmlFor="heslo" className="block font-bold">
          Nové heslo
        </label>
        <p className="text-text-doplnek mt-1 text-[1.0625rem]">
          Aspoň 12 znaků. Nejlíp krátká věta, kterou si zapamatujete.
        </p>
        <input
          id="heslo"
          name="heslo"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className={VSTUP}
        />
      </div>

      <div className="mt-6">
        <label htmlFor="heslo_znovu" className="block font-bold">
          Heslo ještě jednou
        </label>
        <input
          id="heslo_znovu"
          name="heslo_znovu"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className={VSTUP}
        />
      </div>

      <div className="mt-6" aria-live="polite">
        {stav.zprava ? <p className="font-bold">{stav.zprava}</p> : null}
      </div>

      <Tlacitko />
    </form>
  );
}
