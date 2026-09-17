import { jeZnamaStranka } from "../navigace.ts";
import type { Pole, Sekce } from "./obsah-schema";

/**
 * Ověření a sloučení obsahu ze zadávacího formuláře.
 *
 * Dvě věci, na kterých to celé stojí:
 *
 * 1. **Zapíšou se jen pole, která schéma zná.** Cokoli navíc, co přijde
 *    v požadavku, se zahodí. Nikdo si tudy nepodstrčí vlastní klíč.
 *
 * 2. **Chybějící klíč znamená „nesahat", ne „vymazat".** Když ve formuláři
 *    pole vůbec nepřijde, převezme se původní hodnota. Prázdný řetězec je
 *    něco jiného — ten pole záměrně vymaže.
 *
 *    Platí to pro všechna pole, ne jen pro fotky. Kdyby to platilo jen pro
 *    fotky, uložení části formuláře by sice fotku udrželo, ale zahodilo by
 *    její popisek — a sekce by pak neprošla kontrolou.
 *
 * Položky seznamů se párují přes skryté `_id`, ne přes pořadí. Kdyby se
 * párovalo pořadím, přehozením dvou fotek by se přehodily i jejich cesty.
 */

export type Chyba = { cesta: string; zprava: string };

export type Vysledek =
  | { stav: "ok"; hodnota: Record<string, unknown> }
  | { stav: "chyba"; chyby: Chyba[] };

type Objekt = Record<string, unknown>;

const CESTA_FOTKY = /^[a-z0-9][a-z0-9/_-]*\.(jpe?g|png|webp)$/i;

function jeObjekt(x: unknown): x is Objekt {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function text(x: unknown): string {
  return typeof x === "string" ? x.trim() : "";
}

export function zvalidujASluc(
  sekce: Sekce,
  nove: unknown,
  puvodni: unknown,
): Vysledek {
  const chyby: Chyba[] = [];
  const hodnota = projdiPole(
    sekce.pole,
    jeObjekt(nove) ? nove : {},
    jeObjekt(puvodni) ? puvodni : {},
    "",
    chyby,
  );

  return chyby.length > 0 ? { stav: "chyba", chyby } : { stav: "ok", hodnota };
}

function projdiPole(
  schema: readonly Pole[],
  nove: Objekt,
  puvodni: Objekt,
  prefix: string,
  chyby: Chyba[],
): Objekt {
  const vysledek: Objekt = {};

  for (const pole of schema) {
    const cesta = prefix ? `${prefix}.${pole.jmeno}` : pole.jmeno;
    const prislo = Object.prototype.hasOwnProperty.call(nove, pole.jmeno);
    const surove = nove[pole.jmeno];
    const stare = puvodni[pole.jmeno];

    switch (pole.druh) {
      case "text":
      case "viceradkovy": {
        const hodnota =
          !prislo && typeof stare === "string" ? stare : text(surove);
        if (pole.povinne && hodnota === "") {
          chyby.push({ cesta, zprava: `Vyplňte „${pole.popisek}“.` });
        }
        if (pole.max && hodnota.length > pole.max) {
          chyby.push({
            cesta,
            zprava: `„${pole.popisek}“ může mít nejvýš ${pole.max} znaků, teď má ${hodnota.length}.`,
          });
        }
        vysledek[pole.jmeno] = hodnota;
        break;
      }

      case "prepinac": {
        if (prislo) {
          vysledek[pole.jmeno] = surove === true || surove === "on";
        } else {
          vysledek[pole.jmeno] =
            typeof stare === "boolean" ? stare : pole.vychozi;
        }
        break;
      }

      case "vyber": {
        const hodnota =
          !prislo && typeof stare === "string" ? stare : text(surove);
        const znama = pole.moznosti.some((m) => m.hodnota === hodnota);
        if (!znama) {
          if (pole.povinne) {
            chyby.push({ cesta, zprava: `Vyberte „${pole.popisek}“.` });
          }
          vysledek[pole.jmeno] = pole.vychozi;
        } else {
          vysledek[pole.jmeno] = hodnota;
        }
        break;
      }

      case "stranka": {
        const hodnota =
          !prislo && typeof stare === "string" ? stare : text(surove);
        if (hodnota === "") {
          if (pole.povinne) {
            chyby.push({ cesta, zprava: `Vyberte, kam odkaz vede.` });
          }
          vysledek[pole.jmeno] = "";
        } else if (!jeZnamaStranka(hodnota)) {
          // Adresa, která na webu neexistuje, by udělala mrtvý odkaz.
          chyby.push({
            cesta,
            zprava: `Stránka „${hodnota}“ na webu neexistuje. Vyberte ji ze seznamu.`,
          });
        } else {
          vysledek[pole.jmeno] = hodnota;
        }
        break;
      }

      case "obrazek": {
        // Klíč vůbec nepřišel → formulář fotku neřešil, původní zůstává.
        if (!prislo) {
          if (typeof stare === "string") vysledek[pole.jmeno] = stare;
          break;
        }
        const hodnota = text(surove);
        if (hodnota === "") {
          vysledek[pole.jmeno] = "";
          break;
        }
        if (!CESTA_FOTKY.test(hodnota) || hodnota.includes("..")) {
          chyby.push({
            cesta,
            zprava: "Neplatná cesta k fotce. Nahrajte ji prosím znovu.",
          });
          break;
        }
        vysledek[pole.jmeno] = hodnota;
        break;
      }

      case "seznam": {
        if (!prislo && Array.isArray(stare)) {
          // Formulář seznam vůbec neposlal — necháme ho, jak byl.
          vysledek[pole.jmeno] = stare;
          break;
        }

        const prichozi = Array.isArray(surove) ? surove : [];
        const puvodniPodleId = new Map<string, Objekt>();
        if (Array.isArray(stare)) {
          for (const polozka of stare) {
            if (jeObjekt(polozka) && typeof polozka._id === "string") {
              puvodniPodleId.set(polozka._id, polozka);
            }
          }
        }

        const polozky = prichozi.map((polozka, poradi) => {
          const vstup = jeObjekt(polozka) ? polozka : {};
          const id = typeof vstup._id === "string" && vstup._id ? vstup._id : noveId();
          const zaklad = puvodniPodleId.get(id) ?? {};
          const slouceno = projdiPole(
            pole.polozka,
            vstup,
            zaklad,
            `${cesta}[${poradi}]`,
            chyby,
          );
          return { _id: id, ...slouceno };
        });

        if (pole.min !== undefined && polozky.length < pole.min) {
          chyby.push({
            cesta,
            zprava: `„${pole.popisek}“ musí mít aspoň ${pole.min} položek.`,
          });
        }
        if (pole.max !== undefined && polozky.length > pole.max) {
          chyby.push({
            cesta,
            zprava: `„${pole.popisek}“ může mít nejvýš ${pole.max} položek.`,
          });
        }

        vysledek[pole.jmeno] = polozky;
        break;
      }
    }
  }

  // Popisek fotky je povinný, ale až ve chvíli, kdy je fotka nahraná.
  // Kdyby byl povinný vždycky, nešla by uložit sekce, do které se fotka
  // teprve doplní.
  for (const pole of schema) {
    if (pole.druh !== "obrazek") continue;
    const fotka = vysledek[pole.jmeno];
    if (typeof fotka !== "string" || fotka === "") continue;

    const popis = vysledek[pole.popisPole];
    if (typeof popis !== "string" || popis.trim() === "") {
      chyby.push({
        cesta: prefix ? `${prefix}.${pole.popisPole}` : pole.popisPole,
        zprava: `Napište popisek k fotce „${pole.popisek}“. Bez něj ji nepřečte člověk, který ji nevidí.`,
      });
    }
  }

  return vysledek;
}

function noveId(): string {
  return globalThis.crypto.randomUUID();
}
