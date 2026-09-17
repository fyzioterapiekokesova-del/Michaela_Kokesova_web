import { z } from "zod";

/**
 * Kontaktní formulář.
 *
 * Validace běží **na serveru**. Kontrola v prohlížeči je jen pohodlí —
 * požadavek se dá poslat i mimo formulář.
 *
 * Zpráva se nikam neukládá. Odejde e-mailem a tím to končí. Proto je
 * u formuláře věta, ať do něj lidé nepíšou zdravotní potíže: to je zdravotní
 * údaj a ten nechceme nikde skladovat ani posílat přes cizí servery.
 */

export const SCHEMA_KONTAKT = z.object({
  jmeno: z
    .string()
    .trim()
    .min(2, "Napište prosím své jméno.")
    .max(80, "Jméno je moc dlouhé."),

  email: z
    .string()
    .trim()
    .min(1, "Napište prosím svůj e-mail, ať se vám mám kam ozvat.")
    .max(160, "E-mail je moc dlouhý.")
    .refine((h) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(h), {
      message: "Tenhle e-mail nevypadá správně. Zkontrolujte ho prosím.",
    }),

  telefon: z
    .string()
    .trim()
    .max(30, "Telefon je moc dlouhý.")
    .refine((h) => h === "" || /^[+\d][\d\s()/-]{6,}$/.test(h), {
      message: "Tohle telefonní číslo nevypadá správně.",
    })
    .optional()
    .default(""),

  zprava: z
    .string()
    .trim()
    .min(5, "Napište prosím pár slov, s čím vám můžu pomoct.")
    .max(2000, "Zpráva je moc dlouhá. Zkuste ji zkrátit."),

  // Past na roboty. Člověk tohle pole nevidí, takže ho nevyplní.
  web: z.string().max(0, "Formulář se nepodařilo odeslat.").optional().default(""),
});

export type DataKontakt = z.infer<typeof SCHEMA_KONTAKT>;

/** Stav formuláře, který se vrací do prohlížeče. */
export type StavFormulare = {
  stav: "prazdny" | "chyba";
  /** Chyby u konkrétních polí, vypsané textem pod polem. */
  chyby?: Partial<Record<"jmeno" | "email" | "telefon" | "zprava", string>>;
  /** Chyba, která se netýká jednoho pole. */
  zprava?: string;
  /** Co člověk napsal — po chybě se mu to nesmí ztratit. */
  hodnoty?: { jmeno: string; email: string; telefon: string; zprava: string };
};
