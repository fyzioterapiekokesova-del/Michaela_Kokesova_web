"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/**
 * Lišta se souhlasem s cookies a načtení měření.
 *
 * Co po ní chce ÚOOÚ a co z toho plyne:
 *  - **Souhlas i odmítnutí jsou ve stejné vrstvě** a vypadají stejně.
 *    Odmítnutí není menší, šedivější ani schované pod odkazem.
 *  - Lišta **nebrání používání webu** — nezakrývá obsah přes celou obrazovku.
 *  - **Zavřít ji křížkem není souhlas.** Neuloží se nic a příště se zeptáme znovu.
 *  - Odvolat souhlas musí být stejně snadné jako ho dát — v patičce je
 *    tlačítko, které lištu otevře znovu.
 *
 * Měření se načte **až po souhlasu**. Při odmítnutí se nenačte vůbec —
 * ne „načte se, ale nebude měřit".
 */

const COOKIE = "souhlas-mereni";
const ROK = 60 * 60 * 24 * 365; // souhlas platí 12 měsíců
const PUL_ROKU = 60 * 60 * 24 * 183; // po odmítnutí se ptáme nejdřív za 6 měsíců

/** `server` = ještě nevíme, běží první vykreslení. */
type Volba = "ano" | "ne" | "nic" | "server";

/* -------------------------------------------------------------------------- */
/*  Cookie jako vnější zdroj dat                                               */
/* -------------------------------------------------------------------------- */

const posluchaci = new Set<() => void>();

function odebirat(zmena: () => void) {
  posluchaci.add(zmena);
  return () => {
    posluchaci.delete(zmena);
  };
}

function oznamZmenu() {
  for (const zmena of posluchaci) zmena();
}

function vProhlizeci(): Volba {
  const nalez = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`));
  const hodnota = nalez?.slice(COOKIE.length + 1);
  return hodnota === "ano" || hodnota === "ne" ? hodnota : "nic";
}

// Na serveru cookie číst nejde a první vykreslení v prohlížeči musí dopadnout
// stejně jako na serveru. Proto se tady vrací „ještě nevím" a skutečná
// hodnota přijde až v dalším průchodu.
function naServeru(): Volba {
  return "server";
}

function ulozVolbu(volba: "ano" | "ne") {
  const doba = volba === "ano" ? ROK : PUL_ROKU;
  document.cookie = `${COOKIE}=${volba}; path=/; max-age=${doba}; samesite=lax${
    location.protocol === "https:" ? "; secure" : ""
  }`;
  oznamZmenu();
}

/* -------------------------------------------------------------------------- */

export function Souhlas({ gaId }: { gaId?: string }) {
  const volba = useSyncExternalStore(odebirat, vProhlizeci, naServeru);
  const [rucneOtevreno, setRucneOtevreno] = useState(false);
  const [zavreno, setZavreno] = useState(false);

  // Tlačítko „Změna souhlasu" v patičce lištu otevře znovu.
  useEffect(() => {
    const otevri = () => setRucneOtevreno(true);
    window.addEventListener("otevrit-souhlas", otevri);
    return () => window.removeEventListener("otevrit-souhlas", otevri);
  }, []);

  const rozhodni = useCallback((nova: "ano" | "ne") => {
    ulozVolbu(nova);
    setRucneOtevreno(false);
    setZavreno(false);
  }, []);

  const zobrazit =
    volba !== "server" && (rucneOtevreno || (volba === "nic" && !zavreno));

  return (
    <>
      {volba === "ano" && gaId ? <Mereni gaId={gaId} /> : null}
      {zobrazit ? (
        <Lista
          nerozhodnuto={volba === "nic"}
          rozhodni={rozhodni}
          zavri={() => {
            setRucneOtevreno(false);
            setZavreno(true);
          }}
        />
      ) : null}
    </>
  );
}

function Lista({
  nerozhodnuto,
  rozhodni,
  zavri,
}: {
  nerozhodnuto: boolean;
  rozhodni: (v: "ano" | "ne") => void;
  zavri: () => void;
}) {
  const lista = useRef<HTMLDivElement>(null);

  /*
    Lišta je `fixed` u spodního okraje, takže překrývá konec stránky — a tam
    je odesílací tlačítko formuláře a odkazy v patičce. Klik na ně by spadl
    na lištu: nic by se nestalo a nic by se nevypsalo.

    Proto se po dobu, co lišta visí, přidá spodku stránky odsazení o její
    výšku. Měří se za běhu, protože na mobilu se text zalomí do víc řádků
    a lišta je vyšší. Zadání to vyžaduje výslovně: lišta nesmí bránit
    používání webu.
  */
  useEffect(() => {
    const prvek = lista.current;
    if (!prvek) return;

    const zmer = () => {
      document.body.style.paddingBottom = `${prvek.offsetHeight}px`;
    };
    zmer();

    const sleduj = new ResizeObserver(zmer);
    sleduj.observe(prvek);

    return () => {
      sleduj.disconnect();
      document.body.style.paddingBottom = "";
    };
  }, []);

  return (
    <div
      ref={lista}
      role="dialog"
      aria-label="Souhlas s měřením návštěvnosti"
      className="bg-text text-patka-text na-tmavem fixed inset-x-0 bottom-0 z-90 shadow-[0_-8px_30px_rgba(46,48,45,.25)]"
    >
      <div className="obal flex flex-col gap-5 py-6 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-telo lg:text-telo-pc max-w-[70ch]">
          Ráda bych věděla, kolik lidí web najde a co si na něm prohlédne.
          K tomu potřebuju vaše svolení s měřením návštěvnosti přes Google
          Analytics. Bez něj web funguje úplně stejně.{" "}
          <a href="/zasady-cookies" className="text-azurova underline">
            Zásady cookies
          </a>
        </p>

        {/* Obě tlačítka jsou stejně velká a stejně výrazná. */}
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => rozhodni("ano")}
            data-akce="souhlas-ano"
            className="klik text-tlacitko rounded-tlacitko bg-azurova text-text justify-center px-7 font-extrabold"
          >
            Souhlasím
          </button>
          <button
            type="button"
            onClick={() => rozhodni("ne")}
            data-akce="souhlas-ne"
            className="klik text-tlacitko rounded-tlacitko bg-povrch text-text justify-center px-7 font-extrabold"
          >
            Nesouhlasím
          </button>
        </div>
      </div>

      {/* Zavřít se dá i bez rozhodnutí. Neuloží se nic, takže se příště
          zeptáme znovu — zavření se nesmí brát jako souhlas. */}
      {nerozhodnuto ? (
        <button
          type="button"
          onClick={zavri}
          className="text-patka-text absolute top-2 right-2 flex size-12 items-center justify-center text-[1.5rem] leading-none"
        >
          <span className="sr-only">Zavřít bez rozhodnutí</span>
          <span aria-hidden>×</span>
        </button>
      ) : null}
    </div>
  );
}

/**
 * Google Analytics 4. Vloží se do stránky teprve tady — tedy až ve chvíli,
 * kdy je souhlas udělený. Při odmítnutí se skript nikdy nestáhne.
 */
function Mereni({ gaId }: { gaId: string }) {
  useEffect(() => {
    if (document.getElementById("ga4")) return;

    const skript = document.createElement("script");
    skript.id = "ga4";
    skript.async = true;
    skript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(skript);

    const nastaveni = document.createElement("script");
    nastaveni.id = "ga4-nastaveni";
    nastaveni.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}', { anonymize_ip: true });
    `;
    document.head.appendChild(nastaveni);
  }, [gaId]);

  return null;
}
