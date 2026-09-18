"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SCHEMA_KONTAKT, type StavFormulare } from "@/lib/formular/schema";
import { zkusPusit } from "@/lib/formular/omezeni";
import {
  ChybaOdeslani,
  posliPotvrzeni,
  posliZpravu,
  rozdelPrijemce,
} from "@/lib/formular/posli";
import { nactiObsah } from "@/lib/obsah";
import { text } from "@/lib/obsah/cteni";

/**
 * Odeslání kontaktního formuláře.
 *
 * Server Action — formulář se nedá odeslat jinudy. Zpráva se **nikam
 * neukládá**: odejde e-mailem Michaele, odesílatel dostane potvrzení a tím
 * to končí.
 *
 * Po úspěchu se přesměruje na `/dekujeme`. Ta adresa je jediný spolehlivý
 * důkaz, že zpráva opravdu odešla — proto se na ní dá měřit konverze.
 */
export async function odeslatKontakt(
  _predchozi: StavFormulare,
  formular: FormData,
): Promise<StavFormulare> {
  const hodnoty = {
    jmeno: String(formular.get("jmeno") ?? ""),
    email: String(formular.get("email") ?? ""),
    telefon: String(formular.get("telefon") ?? ""),
    zprava: String(formular.get("zprava") ?? ""),
  };

  const vysledek = SCHEMA_KONTAKT.safeParse({
    ...hodnoty,
    web: String(formular.get("web") ?? ""),
  });

  if (!vysledek.success) {
    const chyby: StavFormulare["chyby"] = {};
    for (const chyba of vysledek.error.issues) {
      const pole = chyba.path[0];
      if (pole === "web") {
        // Past sklapla. Robotovi se nevysvětluje, co udělal špatně —
        // do logu se to ale zapíše, aby šlo poznat past od skutečné chyby.
        console.warn("Formulář: sklapla past na roboty (pole web vyplněné).");
        return {
          stav: "chyba",
          zprava: "Zprávu se nepodařilo odeslat. Zkuste to prosím znovu.",
          hodnoty,
        };
      }
      if (
        pole === "jmeno" ||
        pole === "email" ||
        pole === "telefon" ||
        pole === "zprava"
      ) {
        chyby[pole] ??= chyba.message;
      }
    }
    return { stav: "chyba", chyby, hodnoty };
  }

  /*
    Omezení frekvence až tady, po validaci.

    Dřív se počítal každý pokus, i ten, který spadl na překlepu v e-mailu.
    Kdo se pětkrát upsal, byl na hodinu zamčený — a to na webu, kde je
    formulář jedna ze dvou cest, jak se ozvat. Počítají se proto jen pokusy,
    které došly až k odeslání; robot se zprávou v pořádku se počítá dál.
  */
  const hlavicky = await headers();
  const ip =
    hlavicky.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hlavicky.get("x-real-ip") ||
    "neznama";

  const pusteno = zkusPusit(`kontakt:${ip}`, 5);
  if (!pusteno.pusti) {
    console.warn(
      `Formulář: omezení frekvence zabralo, další pokus za ${pusteno.zaSekund} s.`,
    );
    return {
      stav: "chyba",
      zprava:
        "Zpráv už přišlo hodně. Zkuste to prosím za chvíli, nebo mi rovnou zavolejte.",
      hodnoty,
    };
  }

  const kontakt = await nactiObsah("kontakt");
  // V administraci je to jedno pole; víc adres se oddělí čárkou nebo
  // středníkem a zpráva pak přijde na všechny.
  const prijemce = rozdelPrijemce(text(kontakt, "prijemce"));

  if (prijemce.length === 0) {
    console.error("Formulář nemá kam poslat zprávu — v obsahu chybí příjemce.");
    return {
      stav: "chyba",
      zprava:
        "Zprávu se teď nepodařilo odeslat. Zavolejte mi prosím, ráda to vyřídím po telefonu.",
      hodnoty,
    };
  }

  try {
    await posliZpravu(vysledek.data, prijemce);
  } catch (chyba) {
    console.error("Zprávu z formuláře se nepodařilo odeslat.", chyba);
    return {
      stav: "chyba",
      zprava:
        chyba instanceof ChybaOdeslani
          ? "Zprávu se teď nepodařilo odeslat. Zavolejte mi prosím."
          : "Něco se pokazilo. Zkuste to prosím znovu, nebo mi zavolejte.",
      hodnoty,
    };
  }

  // Potvrzení odesílateli je milé, ale není důvod kvůli němu hlásit chybu —
  // zpráva Michaele už odešla, a to je to podstatné.
  try {
    await posliPotvrzeni(vysledek.data);
  } catch (chyba) {
    console.error("Potvrzení odesílateli se nepodařilo odeslat.", chyba);
  }

  // `redirect` funguje tak, že vyhodí výjimku — musí být mimo `try`.
  redirect("/dekujeme");
}
