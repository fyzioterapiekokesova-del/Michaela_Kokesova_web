import type { DataKontakt } from "./schema";

/**
 * Odeslání e-mailu přes Resend.
 *
 * Voláme rovnou jejich HTTP rozhraní — jedna funkce `fetch` místo další
 * závislosti v repu.
 *
 * Odesílá se ze subdomény `notifikace.<doména>`, ne z hlavní: kdyby něco
 * poškodilo pověst odesílatele, nespadne s tím i běžná pošta klientky.
 */

const API = "https://api.resend.com/emails";

type Email = {
  komu: string;
  predmet: string;
  text: string;
  /** Adresa, na kterou se odpovídá — u zprávy pro Michaelu e-mail odesílatele. */
  odpovedetNa?: string;
};

export class ChybaOdeslani extends Error {}

async function posli(email: Email): Promise<void> {
  const klic = process.env.RESEND_API_KEY;
  const odesilatel = process.env.RESEND_FROM;

  if (!klic || !odesilatel) {
    // V produkci je tichý výpadek to nejhorší, co se může stát — člověk by
    // viděl „odesláno" a zpráva by nikam nedošla.
    if (process.env.NODE_ENV === "production") {
      throw new ChybaOdeslani("Chybí RESEND_API_KEY nebo RESEND_FROM.");
    }
    console.info(
      `[formulář] Resend není nastavený, e-mail se neodeslal.\n` +
        `  komu: ${email.komu}\n  předmět: ${email.predmet}\n${email.text}`,
    );
    return;
  }

  const odpoved = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${klic}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: odesilatel,
      to: [email.komu],
      subject: email.predmet,
      text: email.text,
      ...(email.odpovedetNa ? { reply_to: email.odpovedetNa } : {}),
    }),
  });

  if (!odpoved.ok) {
    const telo = await odpoved.text();
    throw new ChybaOdeslani(`Resend vrátil ${odpoved.status}: ${telo}`);
  }
}

/** Zpráva pro Michaelu. */
export async function posliZpravu(data: DataKontakt, prijemce: string) {
  await posli({
    komu: prijemce,
    odpovedetNa: data.email,
    predmet: `Zpráva z webu — ${data.jmeno}`,
    text: [
      `Jméno: ${data.jmeno}`,
      `E-mail: ${data.email}`,
      data.telefon ? `Telefon: ${data.telefon}` : "Telefon: neuveden",
      "",
      "Zpráva:",
      data.zprava,
      "",
      "---",
      "Odesláno z kontaktního formuláře na fyzioterapiekokesova.cz.",
      "Odpovědět můžete rovnou na tenhle e-mail.",
    ].join("\n"),
  });
}

/** Potvrzení pro toho, kdo psal. */
export async function posliPotvrzeni(data: DataKontakt) {
  await posli({
    komu: data.email,
    predmet: "Vaše zpráva dorazila — Michaela Kokešová",
    text: [
      `Dobrý den,`,
      "",
      "děkuju za zprávu. Přečtu si ji a ozvu se vám, jakmile to půjde.",
      "Pokud to spěchá, zavolejte mi prosím rovnou.",
      "",
      "Pro pořádek posílám, co jste napsali:",
      "",
      data.zprava,
      "",
      "Michaela Kokešová",
      "fyzioterapie · podologie · České Budějovice",
      "",
      "---",
      "Tenhle e-mail je automatické potvrzení, neodpovídejte na něj.",
    ].join("\n"),
  });
}
