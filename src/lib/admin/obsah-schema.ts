import { CILE_ODKAZU } from "../navigace.ts";

/**
 * Deklarativní schéma obsahu.
 *
 * Formulář v administraci se vykresluje z tohohle souboru. Přidat pole
 * znamená přidat řádek sem — ne psát nový formulář.
 *
 * Ze schématu se zároveň řídí ukládání: **zapíšou se jen pole, která schéma
 * zná.** Díky tomu uložení textů nepřepíše cesty k nahraným fotkám.
 *
 * Nic z toho, co je tady, nesmí být natvrdo v komponentě. Klientka musí umět
 * změnit každý text a každý obrázek bez zásahu do kódu.
 */

/* -------------------------------------------------------------------------- */
/*  Typy polí                                                                  */
/* -------------------------------------------------------------------------- */

type Zaklad = {
  /** Klíč v JSONu. */
  jmeno: string;
  /** Popisek nad polem. Ne zástupný text — ten při psaní zmizí. */
  popisek: string;
  /** Věta pod polem, když je potřeba něco vysvětlit. */
  napoveda?: string;
  povinne?: boolean;
  /**
   * Nadpis bloku, do kterého pole patří. Sousední pole se stejnou skupinou
   * se ve formuláři vykreslí v jednom rámečku — dlouhá sekce se tak čte
   * po kouscích, ne jako jeden nekonečný sloupec.
   */
  skupina?: string;
  /** Krátké pole na počítači do půlky šířky, vedle dalšího krátkého. */
  sirka?: "pul";
  /**
   * Technické nastavení, na které se sahá jednou za čas. Schová se do
   * sbaleného bloku „Další nastavení" na konci sekce.
   */
  dalsi?: boolean;
  /**
   * Skupina, kterou stačí měnit jednou za čas (nadpis a úvod stránky).
   * Stačí uvést u prvního pole skupiny — celá se pak vykreslí sbalená.
   */
  sbalenaSkupina?: boolean;
};

export type Moznost = { hodnota: string; popisek: string };

export type Pole =
  | (Zaklad & { druh: "text"; max?: number })
  | (Zaklad & { druh: "viceradkovy"; radky?: number; max?: number })
  | (Zaklad & {
      druh: "obrazek";
      /** Poměr stran, ve kterém se fotka na webu ořízne. */
      varianta: "hero" | "portret" | "galerie" | "sdileni";
      /**
       * Jméno pole s popiskem fotky. Popisek je povinný, **ale jen když je
       * fotka nahraná** — jinak by nešlo uložit sekci, do které se fotka
       * teprve doplní.
       */
      popisPole: string;
      /**
       * Jména polí s výřezem — ohnisko (`"50% 30%"`) a přiblížení.
       *
       * Ve formuláři se nevykreslují jako samostatná pole; obsluhuje je
       * ovládací prvek u fotky. Ve schématu jsou proto, aby o nich vědělo
       * slučování — jinak by uložení textů výřez zahodilo.
       */
      poziceJmeno: string;
      zoomJmeno: string;
    })
  | (Zaklad & { druh: "prepinac"; vychozi: boolean })
  | (Zaklad & { druh: "vyber"; moznosti: readonly Moznost[]; vychozi: string })
  | (Zaklad & { druh: "stranka" })
  | (Zaklad & {
      druh: "seznam";
      /** Jak se jmenuje jedna položka — „otázka“, „krok“, „fotka“. */
      nazevPolozky: string;
      polozka: readonly Pole[];
      min?: number;
      max?: number;
      /**
       * Jak se položky vykreslí:
       * - `rozbalene` — všechna pole pod sebou (výchozí),
       * - `sbalene` — každá položka jako řádek s nadpisem, rozbalí se kliknutím,
       * - `tabulka` — krátká pole vedle sebe na jednom řádku (ceník, vzdělání),
       * - `mrizka` — položky ve dvou sloupcích (fotky).
       */
      zobrazeni?: "rozbalene" | "sbalene" | "tabulka" | "mrizka";
    });

export type Sekce = {
  /** Klíč v tabulce `site_content`. */
  klic: string;
  /** Nadpis v administraci. */
  nazev: string;
  /** Krátký název do menu vlevo. Když chybí, bere se `nazev`. */
  kratce?: string;
  popis?: string;
  /** Které adresy se po uložení mají obnovit. */
  obnovit: readonly string[];
  /**
   * Kam vede odkaz „Zobrazit na webu". Když chybí, bere se první adresa
   * z `obnovit`.
   */
  naWebu?: string;
  pole: readonly Pole[];
};

/* -------------------------------------------------------------------------- */
/*  Sdílené kousky                                                             */
/* -------------------------------------------------------------------------- */

const STRANKY_MOZNOSTI: readonly Moznost[] = CILE_ODKAZU.map((s) => ({
  hodnota: s.href,
  popisek: s.popis ? `${s.nazev} — ${s.popis}` : s.nazev,
}));

/** Fotka s popiskem. Bez popisku se neuloží — bez něj ji nepřečte odečítač. */
function obrazek(
  jmeno: string,
  popisek: string,
  varianta: "hero" | "portret" | "galerie" | "sdileni",
  napoveda?: string,
): readonly Pole[] {
  return [
    {
      druh: "obrazek",
      jmeno,
      popisek,
      varianta,
      napoveda,
      skupina: popisek,
      popisPole: `${jmeno}_popis`,
      poziceJmeno: `${jmeno}_pozice`,
      zoomJmeno: `${jmeno}_zoom`,
    },
    {
      druh: "text",
      jmeno: `${jmeno}_popis`,
      popisek: `Popisek fotky „${popisek}“`,
      skupina: popisek,
      napoveda:
        "Popište jednou větou, co na fotce je. Přečte ho člověk, který fotku nevidí.",
      max: 160,
    },
  ];
}

const SEKCE_PODSLUZEB: Pole = {
  druh: "seznam",
  jmeno: "casti",
  popisek: "Jednotlivé úkony",
  nazevPolozky: "úkon",
  zobrazeni: "sbalene",
  napoveda: "Rozdělí stránku na části. Každá část dostane vlastní mezinadpis.",
  polozka: [
    { druh: "text", jmeno: "nadpis", popisek: "Název úkonu", povinne: true, max: 80 },
    {
      druh: "viceradkovy",
      jmeno: "text",
      popisek: "Popis",
      povinne: true,
      radky: 5,
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Schéma                                                                     */
/* -------------------------------------------------------------------------- */

export const SCHEMA: readonly Sekce[] = [
  {
    klic: "hero",
    nazev: "Úvodní blok",
    popis: "První, co člověk uvidí. Telefon je hlavní akce celého webu.",
    obnovit: ["/"],
    pole: [
      { druh: "text", jmeno: "stitek", popisek: "Štítek nad nadpisem", skupina: "Texty", max: 60 },
      {
        druh: "text",
        jmeno: "nadpis",
        popisek: "Hlavní nadpis",
        skupina: "Texty",
        napoveda:
          "Měl by obsahovat obor i město — podle toho vás lidé hledají ve vyhledávači.",
        povinne: true,
        max: 90,
      },
      { druh: "viceradkovy", jmeno: "perex", popisek: "Úvodní odstavec", skupina: "Texty", radky: 3 },
      {
        druh: "text",
        jmeno: "poznamka",
        popisek: "Uklidňující věta",
        skupina: "Texty",
        napoveda: "Například: Objednat se můžete i bez doporučení lékaře.",
        max: 120,
      },
      {
        druh: "text",
        jmeno: "tlacitko_1",
        popisek: "Popisek hlavního tlačítka",
        skupina: "Tlačítka",
        sirka: "pul",
        napoveda: "Tlačítko vede na váš telefon. Nemusíte do něj psát číslo.",
        povinne: true,
        max: 40,
      },
      {
        druh: "text",
        jmeno: "tlacitko_2",
        popisek: "Popisek vedlejšího tlačítka",
        skupina: "Tlačítka",
        sirka: "pul",
        max: 40,
      },
      {
        druh: "vyber",
        jmeno: "rozvrzeni",
        popisek: "Rozvržení",
        dalsi: true,
        napoveda:
          "Dokud nemáte fotku, přepněte na jeden sloupec — text se pak roztáhne přes celou šířku.",
        vychozi: "jeden-sloupec",
        moznosti: [
          { hodnota: "jeden-sloupec", popisek: "Jeden sloupec — jen text" },
          { hodnota: "dva-sloupce", popisek: "Dva sloupce — text a fotka" },
        ],
      },
      {
        druh: "vyber",
        jmeno: "vyplneni",
        popisek: "Jak se má obrázek zobrazit",
        dalsi: true,
        napoveda:
          "Fotku je lepší ořezat do plochy. Logo nebo kresbu nechte zobrazit celou — ořez by jí usekl kraje a kolem plochy by byl vidět rámeček.",
        vychozi: "orez",
        moznosti: [
          { hodnota: "orez", popisek: "Vyplnit plochu — pro fotky" },
          { hodnota: "cele", popisek: "Zobrazit celý — pro logo a kresby" },
        ],
      },
      ...obrazek("fotka", "Úvodní fotka", "hero"),
    ],
  },

  {
    klic: "potize",
    nazev: "Co vás trápí",
    popis:
      "Rozcestník podle příznaků. Pište, jak to říká pacient — „bolí mě pata“, ne odborný název.",
    obnovit: ["/"],
    pole: [
      {
        druh: "seznam",
        jmeno: "polozky",
        popisek: "Potíže",
        nazevPolozky: "potíž",
        zobrazeni: "tabulka",
        max: 11,
        polozka: [
          { druh: "text", jmeno: "text", popisek: "Co člověka trápí", povinne: true, max: 60 },
          { druh: "stranka", jmeno: "href", popisek: "Kam odkaz vede", povinne: true },
        ],
      },
      {
        druh: "text",
        jmeno: "telefon_text",
        popisek: "Poslední položka — odkaz na telefon",
        skupina: "Poslední položka",
        napoveda: "Je pro toho, kdo si ze seznamu nevybral. Vede na váš telefon.",
        povinne: true,
        max: 60,
      },
    ],
  },

  {
    klic: "postup",
    nazev: "Jak to u mě probíhá",
    obnovit: ["/"],
    pole: [
      {
        druh: "seznam",
        jmeno: "kroky",
        popisek: "Kroky",
        nazevPolozky: "krok",
        zobrazeni: "sbalene",
        min: 2,
        max: 5,
        polozka: [
          { druh: "text", jmeno: "nadpis", popisek: "Nadpis kroku", povinne: true, max: 60 },
          { druh: "viceradkovy", jmeno: "text", popisek: "Popis", povinne: true, radky: 3 },
        ],
      },
    ],
  },

  {
    klic: "vek",
    nazev: "Pomůžu každému věku",
    obnovit: ["/"],
    pole: [
      {
        druh: "seznam",
        jmeno: "karty",
        popisek: "Věkové skupiny",
        nazevPolozky: "skupinu",
        zobrazeni: "tabulka",
        max: 8,
        polozka: [
          { druh: "text", jmeno: "nadpis", popisek: "Skupina", povinne: true, max: 40 },
          { druh: "text", jmeno: "text", popisek: "Jedna věta", povinne: true, max: 90 },
        ],
      },
    ],
  },

  {
    klic: "o-mne-uvod",
    kratce: "O Michaele",
    nazev: "O Michaele — blok na úvodu",
    obnovit: ["/"],
    pole: [
      { druh: "text", jmeno: "jmeno", popisek: "Jméno", skupina: "Texty", povinne: true, max: 60 },
      {
        druh: "text",
        jmeno: "claim",
        popisek: "Věta o tom, jak pracujete",
        skupina: "Texty",
        napoveda:
          "Popisujte přístup, ne výsledek. Nic, co by znělo jako slib vyléčení.",
        max: 90,
      },
      {
        druh: "text",
        jmeno: "tlacitko",
        popisek: "Popisek tlačítka",
        skupina: "Texty",
        povinne: true,
        max: 40,
      },
      ...obrazek("portret", "Portrét", "portret"),
    ],
  },

  {
    klic: "ordinace",
    kratce: "Ordinace",
    nazev: "Ordinace — fotky na úvodu",
    popis:
      "Dokud je sekce vypnutá, na webu se vůbec neobjeví. Zapněte ji, až budete mít fotky.",
    obnovit: ["/"],
    pole: [
      {
        druh: "prepinac",
        jmeno: "zobrazit",
        popisek: "Zobrazit sekci na webu",
        skupina: "Sekce na webu",
        vychozi: false,
        napoveda:
          "Vypnuto znamená, že sekce na webu není. Prázdná šedá místa se návštěvníkům nikdy neukazují.",
      },
      { druh: "text", jmeno: "nadpis", popisek: "Nadpis sekce", skupina: "Sekce na webu", max: 60 },
      {
        druh: "seznam",
        jmeno: "fotky",
        popisek: "Fotky",
        nazevPolozky: "fotku",
        zobrazeni: "mrizka",
        max: 4,
        napoveda: "Zobrazí se přesně tolik fotek, kolik jich nahrajete.",
        polozka: [
          {
            druh: "obrazek",
            jmeno: "cesta",
            popisek: "Fotka",
            varianta: "galerie",
            popisPole: "popis",
            poziceJmeno: "pozice",
            zoomJmeno: "zoom",
          },
          {
            druh: "text",
            jmeno: "popis",
            popisek: "Popisek fotky",
            max: 160,
          },
        ],
      },
    ],
  },

  {
    klic: "kontakt",
    nazev: "Kontakt",
    popis: "Co nevyplníte, to se na webu neobjeví. Žádný prázdný řádek nevznikne.",
    obnovit: ["/"],
    naWebu: "/#kontakt",
    pole: [
      {
        druh: "text",
        jmeno: "telefon",
        popisek: "Telefon",
        napoveda: "Hlavní akce celého webu. Pište jen číslo, mezery si doplní web sám.",
        skupina: "Telefon a e-mail",
        sirka: "pul",
        povinne: true,
        max: 20,
      },
      {
        druh: "text",
        jmeno: "email",
        popisek: "E-mail",
        skupina: "Telefon a e-mail",
        sirka: "pul",
        max: 120,
      },
      {
        druh: "viceradkovy",
        jmeno: "adresa",
        popisek: "Adresa ordinace",
        napoveda: "Včetně patra nebo čísla dveří. Pro člověka s bolavou nohou je to důležité.",
        skupina: "Adresa a otevírací doba",
        radky: 3,
      },
      {
        druh: "viceradkovy",
        jmeno: "otviraci_doba",
        popisek: "Otevírací doba",
        napoveda: "Každý den na vlastní řádek.",
        skupina: "Adresa a otevírací doba",
        radky: 7,
      },
      {
        druh: "text",
        jmeno: "mapa_hledat",
        popisek: "Adresa pro mapu",
        napoveda:
          "Napište ji tak, jak byste ji zadali do Google Map, například „Lannova 12, České Budějovice“. Když pole necháte prázdné, mapa se na webu nezobrazí.",
        skupina: "Adresa a otevírací doba",
        max: 200,
      },
      {
        druh: "text",
        jmeno: "instagram",
        popisek: "Odkaz na Instagram",
        skupina: "Sociální sítě",
        sirka: "pul",
        max: 200,
      },
      {
        druh: "text",
        jmeno: "facebook",
        popisek: "Odkaz na Facebook",
        skupina: "Sociální sítě",
        sirka: "pul",
        max: 200,
      },
      { druh: "text", jmeno: "ico", popisek: "IČO", dalsi: true, povinne: true, max: 12 },
      {
        druh: "text",
        jmeno: "prijemce",
        popisek: "Kam chodí zprávy z formuláře",
        napoveda:
          "E-mailová adresa. Návštěvníkům se nikde nezobrazí. Chcete-li zprávy na víc adres, oddělte je čárkou.",
        dalsi: true,
        povinne: true,
        max: 120,
      },
    ],
  },

  {
    klic: "sluzba-fyzioterapie",
    kratce: "Fyzioterapie",
    nazev: "Služba — Fyzioterapie",
    obnovit: ["/fyzioterapie"],
    pole: [
      { druh: "text", jmeno: "nadpis", popisek: "Nadpis", skupina: "Úvod stránky", sbalenaSkupina: true, povinne: true, max: 90 },
      {
        druh: "viceradkovy",
        jmeno: "perex",
        popisek: "Úvodní odstavec",
        skupina: "Úvod stránky",
        radky: 4,
      },
      SEKCE_PODSLUZEB,
      ...obrazek("fotka", "Fotka", "galerie"),
    ],
  },

  {
    klic: "sluzba-podologie",
    kratce: "Podologie",
    nazev: "Služba — Podologie",
    popis:
      "Nejdůležitější stránka webu z hlediska vyhledávání. V Budějovicích podologii skoro nikdo nedělá.",
    obnovit: ["/podologie"],
    pole: [
      { druh: "text", jmeno: "nadpis", popisek: "Nadpis", skupina: "Úvod stránky", sbalenaSkupina: true, povinne: true, max: 90 },
      {
        druh: "viceradkovy",
        jmeno: "perex",
        popisek: "Úvodní odstavec",
        skupina: "Úvod stránky",
        radky: 4,
      },
      SEKCE_PODSLUZEB,
      ...obrazek("fotka", "Fotka", "galerie"),
    ],
  },

  {
    klic: "sluzba-detska",
    kratce: "Dětská fyzioterapie",
    nazev: "Služba — Dětská fyzioterapie",
    obnovit: ["/detska-fyzioterapie"],
    pole: [
      { druh: "text", jmeno: "nadpis", popisek: "Nadpis", skupina: "Úvod stránky", sbalenaSkupina: true, povinne: true, max: 90 },
      {
        druh: "viceradkovy",
        jmeno: "perex",
        popisek: "Úvodní odstavec",
        skupina: "Úvod stránky",
        radky: 4,
      },
      SEKCE_PODSLUZEB,
      ...obrazek("fotka", "Fotka", "galerie"),
    ],
  },

  {
    klic: "cenik",
    nazev: "Ceník",
    popis:
      "Co hradí pojišťovna a co si klient platí sám, napište do poznámky u položky.",
    obnovit: ["/cenik"],
    pole: [
      { druh: "text", jmeno: "nadpis", popisek: "Nadpis", skupina: "Úvod stránky", sbalenaSkupina: true, povinne: true, max: 90 },
      {
        druh: "viceradkovy",
        jmeno: "perex",
        popisek: "Úvodní odstavec",
        skupina: "Úvod stránky",
        radky: 3,
      },
      {
        druh: "seznam",
        jmeno: "oblasti",
        popisek: "Oblasti",
        nazevPolozky: "oblast",
        polozka: [
          { druh: "text", jmeno: "nazev", popisek: "Název oblasti", povinne: true, max: 60 },
          {
            druh: "seznam",
            jmeno: "polozky",
            popisek: "Položky",
            nazevPolozky: "položku",
            zobrazeni: "tabulka",
            polozka: [
              { druh: "text", jmeno: "nazev", popisek: "Úkon", povinne: true, max: 90 },
              { druh: "text", jmeno: "delka", popisek: "Délka", sirka: "pul", max: 30 },
              {
                druh: "text",
                jmeno: "cena",
                popisek: "Cena",
                napoveda: "Můžete napsat i „na dotaz“.",
                sirka: "pul",
                max: 40,
              },
              {
                druh: "text",
                jmeno: "poznamka",
                popisek: "Poznámka",
                napoveda:
                  "Nepovinná. Když ji nevyplníte, řádek s poznámkou se na webu vůbec nezobrazí.",
                max: 160,
              },
            ],
          },
        ],
      },
    ],
  },

  {
    klic: "o-mne",
    nazev: "O mně",
    obnovit: ["/o-mne"],
    pole: [
      { druh: "text", jmeno: "nadpis", popisek: "Nadpis", skupina: "Text", povinne: true, max: 90 },
      {
        druh: "viceradkovy",
        jmeno: "text",
        popisek: "Text o vás",
        skupina: "Text",
        napoveda: "Pište v první osobě. Je to váš web, ne leták.",
        radky: 12,
      },
      ...obrazek("portret", "Portrét", "portret"),
      {
        druh: "seznam",
        jmeno: "vzdelani",
        popisek: "Vzdělání a kurzy",
        nazevPolozky: "kurz",
        zobrazeni: "tabulka",
        polozka: [
          { druh: "text", jmeno: "rok", popisek: "Rok", sirka: "pul", povinne: true, max: 9 },
          { druh: "text", jmeno: "nazev", popisek: "Název", povinne: true, max: 140 },
          { druh: "text", jmeno: "poradatel", popisek: "Pořadatel", max: 140 },
        ],
      },
      {
        druh: "prepinac",
        jmeno: "galerie_zobrazit",
        popisek: "Zobrazit galerii na webu",
        skupina: "Galerie",
        vychozi: false,
        napoveda:
          "Vypnuto znamená, že galerie na webu není. Zapněte ji, až budete mít fotky.",
      },
      {
        druh: "seznam",
        jmeno: "galerie",
        popisek: "Fotky v galerii",
        nazevPolozky: "fotku",
        skupina: "Galerie",
        zobrazeni: "mrizka",
        max: 12,
        polozka: [
          {
            druh: "obrazek",
            jmeno: "cesta",
            popisek: "Fotka",
            varianta: "galerie",
            popisPole: "popis",
            poziceJmeno: "pozice",
            zoomJmeno: "zoom",
          },
          { druh: "text", jmeno: "popis", popisek: "Popisek fotky", max: 160 },
        ],
      },
    ],
  },

  {
    klic: "faq",
    nazev: "Časté dotazy",
    popis:
      "Pořadí měníte šipkami. Nahoru patří to, na co se lidé ptají nejčastěji.",
    obnovit: ["/caste-dotazy", "/"],
    pole: [
      { druh: "text", jmeno: "nadpis", popisek: "Nadpis", skupina: "Úvod stránky", sbalenaSkupina: true, povinne: true, max: 90 },
      {
        druh: "viceradkovy",
        jmeno: "perex",
        popisek: "Úvodní odstavec",
        skupina: "Úvod stránky",
        radky: 3,
      },
      {
        druh: "seznam",
        jmeno: "otazky",
        popisek: "Otázky",
        nazevPolozky: "otázku",
        zobrazeni: "sbalene",
        polozka: [
          { druh: "text", jmeno: "otazka", popisek: "Otázka", povinne: true, max: 140 },
          { druh: "viceradkovy", jmeno: "odpoved", popisek: "Odpověď", povinne: true, radky: 5 },
        ],
      },
    ],
  },

  {
    klic: "seo",
    kratce: "Vyhledávače",
    nazev: "Titulky a popisy pro vyhledávače",
    popis:
      "Titulek je to, co se ukáže jako modrý odkaz ve vyhledávání. Popis je šedý text pod ním.",
    obnovit: [
      "/",
      "/fyzioterapie",
      "/podologie",
      "/detska-fyzioterapie",
      "/cenik",
      "/o-mne",
      "/caste-dotazy",
    ],
    pole: [
      {
        druh: "seznam",
        jmeno: "stranky",
        popisek: "Stránky",
        nazevPolozky: "stránku",
        zobrazeni: "sbalene",
        polozka: [
          {
            druh: "vyber",
            jmeno: "href",
            popisek: "Stránka",
            vychozi: "/",
            moznosti: STRANKY_MOZNOSTI,
          },
          {
            druh: "text",
            jmeno: "titulek",
            popisek: "Titulek",
            napoveda: "Ideálně do 60 znaků, ať se nezkrátí. Tvar: Služba Město — Jméno.",
            povinne: true,
            max: 70,
          },
          {
            druh: "viceradkovy",
            jmeno: "popis",
            popisek: "Popis",
            napoveda: "Ideálně do 155 znaků.",
            radky: 3,
            max: 170,
          },
        ],
      },
      ...obrazek(
        "sdileni",
        "Obrázek pro sdílení",
        "sdileni",
        "Ukáže se, když někdo pošle odkaz na váš web do zprávy nebo na sociální síť.",
      ),
    ],
  },

  {
    klic: "pravni",
    kratce: "Právní texty",
    nazev: "Právní dokumenty",
    popis:
      "Texty zásad spravujete sami a odpovídáte za jejich obsah. Každý odstavec oddělte prázdným řádkem.",
    obnovit: ["/zasady-osobnich-udaju", "/zasady-cookies"],
    pole: [
      {
        druh: "viceradkovy",
        jmeno: "osobni_udaje",
        popisek: "Zásady zpracování osobních údajů",
        radky: 20,
      },
      { druh: "viceradkovy", jmeno: "cookies", popisek: "Zásady cookies", radky: 20 },
    ],
  },
] as const;

/**
 * Menu administrace vlevo. Sekce úvodní stránky pohromadě, pak ostatní
 * stránky, nakonec věci, na které se sahá výjimečně.
 */
export const MENU: readonly { nazev: string; klice: readonly string[] }[] = [
  {
    nazev: "Úvodní stránka",
    klice: ["hero", "potize", "postup", "vek", "o-mne-uvod", "ordinace", "kontakt"],
  },
  {
    nazev: "Další stránky",
    klice: [
      "sluzba-fyzioterapie",
      "sluzba-podologie",
      "sluzba-detska",
      "cenik",
      "o-mne",
      "faq",
    ],
  },
  { nazev: "Nastavení", klice: ["seo", "pravni"] },
];

export function najdiSekci(klic: string): Sekce | undefined {
  return SCHEMA.find((s) => s.klic === klic);
}

/** Všechny klíče obsahu. */
export const KLICE = SCHEMA.map((s) => s.klic);
