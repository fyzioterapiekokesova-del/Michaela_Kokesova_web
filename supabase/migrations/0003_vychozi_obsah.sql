-- Výchozí obsah webu.
--
-- VYGENEROVÁNO — needitovat ručně. Zdroj je `src/lib/obsah/vychozi.ts`,
-- přegenerovat se dá příkazem `npm run seed`.
--
-- `on conflict do nothing` je tu schválně: migrace naplní prázdnou databázi,
-- ale nikdy nepřepíše obsah, který si klientka v administraci změnila.

insert into public.site_content (key, value) values
  ('hero', $json${
  "stitek": "Fyzioterapie · podologie · České Budějovice",
  "nadpis": "Fyzioterapie a podologie v Českých Budějovicích",
  "perex": "Jmenuji se Michaela Kokešová. Věnuji se fyzioterapii, podologii a dětské fyzioterapii. Pracuji sama, takže se vám věnuji celou dobu já.",
  "poznamka": "Nevíte, jestli jdete správně? Zavolejte a probereme to.",
  "tlacitko_1": "Zavolat",
  "tlacitko_2": "Napsat zprávu",
  "rozvrzeni": "dva-sloupce",
  "vyplneni": "cele",
  "fotka": "logo/logo-uvod.webp",
  "fotka_popis": "Logo Fyzioterapie Mgr. Michaela Kokešová — akvarelová kresba kostry chodidla"
}$json$::jsonb),
  ('potize', $json${
  "polozky": [
    {
      "_id": "potiz-pata",
      "text": "Bolí mě pata nebo chodidlo",
      "href": "/podologie"
    },
    {
      "_id": "potiz-nehet",
      "text": "Zarostlý nehet nebo otlak",
      "href": "/podologie"
    },
    {
      "_id": "potiz-zada",
      "text": "Bolí mě záda nebo krk",
      "href": "/fyzioterapie"
    },
    {
      "_id": "potiz-kloub",
      "text": "Bolí mě koleno, kyčel nebo rameno",
      "href": "/fyzioterapie"
    },
    {
      "_id": "potiz-uraz",
      "text": "Vracím se do formy po úrazu",
      "href": "/fyzioterapie"
    },
    {
      "_id": "potiz-dite",
      "text": "Dítě špatně došlapuje nebo se hrbí",
      "href": "/detska-fyzioterapie"
    },
    {
      "_id": "potiz-miminko",
      "text": "Miminko se přetáčí jen na jednu stranu",
      "href": "/detska-fyzioterapie"
    },
    {
      "_id": "potiz-cena",
      "text": "Chci vědět, co to bude stát",
      "href": "/cenik"
    }
  ],
  "telefon_text": "Nevím — radši zavolám"
}$json$::jsonb),
  ('postup', $json${
  "kroky": [
    {
      "_id": "krok-1",
      "nadpis": "Zavoláte",
      "text": "Domluvíme termín, který vám vyhovuje. Řeknu vám, co si vzít s sebou."
    },
    {
      "_id": "krok-2",
      "nadpis": "Projdeme, co vás trápí",
      "text": "Vyptám se na vaše potíže, prohlédnu si, jak se hýbete, a podívám se, odkud potíž vychází."
    },
    {
      "_id": "krok-3",
      "nadpis": "Domluvíme se na postupu",
      "text": "Vysvětlím vám, co navrhuji a proč. Kolik sezení bude potřeba, si řekneme rovnou."
    }
  ]
}$json$::jsonb),
  ('vek', $json${
  "karty": [
    {
      "_id": "vek-miminka",
      "nadpis": "Miminka",
      "text": "Už od šestinedělí."
    },
    {
      "_id": "vek-deti",
      "nadpis": "Děti",
      "text": "Držení těla, došlap, ploché nohy."
    },
    {
      "_id": "vek-dospeli",
      "nadpis": "Dospělí",
      "text": "Záda, klouby, návrat po úrazu."
    },
    {
      "_id": "vek-seniori",
      "nadpis": "Senioři",
      "text": "Jistota v každém kroku."
    }
  ]
}$json$::jsonb),
  ('o-mne-uvod', $json${
  "jmeno": "Michaela Kokešová",
  "claim": "Hledám příčinu, ne jen bolest",
  "tlacitko": "Více o mně",
  "portret": "fotky/michaela-portret.webp",
  "portret_popis": "Michaela Kokešová, fyzioterapeutka"
}$json$::jsonb),
  ('ordinace', $json${
  "zobrazit": false,
  "nadpis": "Ordinace",
  "fotky": []
}$json$::jsonb),
  ('kontakt', $json${
  "telefon": "728234820",
  "email": "",
  "adresa": "",
  "otviraci_doba": "",
  "ico": "19355173",
  "instagram": "",
  "facebook": "",
  "mapa_lat": "",
  "mapa_lon": "",
  "prijemce": ""
}$json$::jsonb),
  ('sluzba-fyzioterapie', $json${
  "nadpis": "Fyzioterapie České Budějovice",
  "perex": "Bolesti zad, krku, kloubů, návrat k pohybu po úrazu nebo operaci. Podívám se, jak se hýbete jako celek — bolest bývá jinde než její příčina.",
  "casti": [
    {
      "_id": "fyzio-vysetreni",
      "nadpis": "Vstupní vyšetření",
      "text": "Projdeme vaše potíže, dosavadní léčbu a to, co vás v běžném dni omezuje. Podívám se, jak stojíte, chodíte a jak se hýbete."
    },
    {
      "_id": "fyzio-terapie",
      "nadpis": "Terapie měkkých tkání a kloubů",
      "text": "Práce se svaly, vazy a klouby. Cílem je uvolnit, co je zatuhlé, a vrátit pohyb tam, kde chybí."
    },
    {
      "_id": "fyzio-cviceni",
      "nadpis": "Cvičení, které si odnesete domů",
      "text": "Ukážu vám pár cviků na doma. Radši tři, které budete opravdu dělat, než dvacet, na které nemáte čas."
    }
  ],
  "fotka": "",
  "fotka_popis": ""
}$json$::jsonb),
  ('sluzba-podologie', $json${
  "nadpis": "Podologie České Budějovice",
  "perex": "Odborná péče o chodidla a nehty. V Českých Budějovicích ji dělá málokdo — proto sem za mnou lidé jezdí i z okolí.",
  "casti": [
    {
      "_id": "podo-vysetreni",
      "nadpis": "Vyšetření chodidla",
      "text": "Podívám se na tvar chodidla, na to, jak došlapujete, a na obuv, ve které chodíte."
    },
    {
      "_id": "podo-nehty",
      "nadpis": "Zarostlý nehet",
      "text": "Ošetření zarostlého nehtu a rada, jak se k tomu nevracet."
    },
    {
      "_id": "podo-otlaky",
      "nadpis": "Otlaky a kuří oka",
      "text": "Odborné ošetření a hledání toho, co je způsobuje."
    },
    {
      "_id": "podo-stelky",
      "nadpis": "Individuálně formované stélky",
      "text": "Stélky tvarované přímo podle vaší nohy, ne kupované podle velikosti."
    }
  ],
  "fotka": "",
  "fotka_popis": ""
}$json$::jsonb),
  ('sluzba-detska', $json${
  "nadpis": "Dětská fyzioterapie České Budějovice",
  "perex": "Od miminek po školáky. U dětí se pracuje hrou a hlavně s rodičem — většina toho, co pomáhá, se odehraje doma.",
  "casti": [
    {
      "_id": "detska-miminka",
      "nadpis": "Miminka",
      "text": "Přetáčení jen na jednu stranu, nesymetrické držení, opoždění v pohybovém vývoji. Ukážu vám, jak s miminkem doma pracovat."
    },
    {
      "_id": "detska-predskolaci",
      "nadpis": "Předškoláci a školáci",
      "text": "Držení těla, ploché nohy, došlap, bolesti zad ze sezení ve škole."
    },
    {
      "_id": "detska-rodice",
      "nadpis": "Práce s rodiči",
      "text": "Vysvětlím vám, co a proč doma dělat. Bez vás to nefunguje."
    }
  ],
  "fotka": "",
  "fotka_popis": ""
}$json$::jsonb),
  ('cenik', $json${
  "nadpis": "Ceník",
  "perex": "Ceny doplním, jakmile budou platné. Do té doby vám je ráda řeknu po telefonu.",
  "oblasti": [
    {
      "_id": "oblast-fyzio",
      "nazev": "Fyzioterapie",
      "polozky": [
        {
          "_id": "cena-fyzio-vstup",
          "nazev": "Vstupní vyšetření a terapie",
          "delka": "",
          "cena": "na dotaz",
          "poznamka": ""
        },
        {
          "_id": "cena-fyzio-navazna",
          "nazev": "Navazující terapie",
          "delka": "",
          "cena": "na dotaz",
          "poznamka": ""
        }
      ]
    },
    {
      "_id": "oblast-podo",
      "nazev": "Podologie",
      "polozky": [
        {
          "_id": "cena-podo-vstup",
          "nazev": "Vstupní podologické vyšetření",
          "delka": "",
          "cena": "na dotaz",
          "poznamka": ""
        },
        {
          "_id": "cena-podo-nehet",
          "nazev": "Ošetření zarostlého nehtu",
          "delka": "",
          "cena": "na dotaz",
          "poznamka": ""
        },
        {
          "_id": "cena-podo-stelky",
          "nazev": "Individuálně formované stélky",
          "delka": "",
          "cena": "na dotaz",
          "poznamka": ""
        }
      ]
    },
    {
      "_id": "oblast-detska",
      "nazev": "Dětská fyzioterapie",
      "polozky": [
        {
          "_id": "cena-detska-vstup",
          "nazev": "Vstupní vyšetření dítěte",
          "delka": "",
          "cena": "na dotaz",
          "poznamka": ""
        },
        {
          "_id": "cena-detska-navazna",
          "nazev": "Navazující terapie",
          "delka": "",
          "cena": "na dotaz",
          "poznamka": ""
        }
      ]
    }
  ]
}$json$::jsonb),
  ('o-mne', $json${
  "nadpis": "Hledám příčinu, ne jen bolest",
  "text": "Jmenuji se Michaela Kokešová a jsem fyzioterapeutka.\n\nTenhle text si prosím přepište vlastními slovy — kdo jste, co vás k fyzioterapii přivedlo, čemu se věnujete nejradši a jak s lidmi pracujete. Pište v první osobě, je to váš web.",
  "portret": "",
  "portret_popis": "",
  "vzdelani": [],
  "galerie_zobrazit": false,
  "galerie": []
}$json$::jsonb),
  ('faq', $json${
  "nadpis": "Časté dotazy",
  "perex": "Na co se lidé ptají nejčastěji, než ke mně poprvé přijdou.",
  "otazky": [
    {
      "_id": "faq-doporuceni",
      "otazka": "Potřebuju doporučení od lékaře?",
      "odpoved": "Doplňte prosím odpověď podle toho, jak to u vás doopravdy chodí — a rozlište, co hradí pojišťovna a co si klient platí sám."
    },
    {
      "_id": "faq-prvni-navsteva",
      "otazka": "Jak dlouho trvá první návštěva?",
      "odpoved": "Doplňte prosím délku první návštěvy."
    },
    {
      "_id": "faq-co-si-vzit",
      "otazka": "Co si mám vzít s sebou?",
      "odpoved": "Pohodlné oblečení, ve kterém se dá hýbat. Pokud máte lékařské zprávy nebo snímky, vezměte je s sebou."
    },
    {
      "_id": "faq-podologie",
      "otazka": "Co je podologie?",
      "odpoved": "Odborná péče o chodidla a nehty — zarostlé nehty, otlaky, kuří oka, tvar chodidla a došlap. V Českých Budějovicích ji dělá málokdo."
    },
    {
      "_id": "faq-deti",
      "otazka": "Od kolika let berete děti?",
      "odpoved": "Pracuji s dětmi už od šestinedělí."
    },
    {
      "_id": "faq-objednani",
      "otazka": "Jak se objednám?",
      "odpoved": "Zavolejte mi, nebo mi napište přes formulář v kontaktu. Ozvu se zpátky a domluvíme termín."
    }
  ]
}$json$::jsonb),
  ('seo', $json${
  "stranky": [
    {
      "_id": "seo-uvod",
      "href": "/",
      "titulek": "Fyzioterapie a podologie České Budějovice — Michaela Kokešová",
      "popis": "Fyzioterapie, podologie a dětská fyzioterapie v Českých Budějovicích. Zavolejte a domluvíme termín."
    },
    {
      "_id": "seo-fyzio",
      "href": "/fyzioterapie",
      "titulek": "Fyzioterapie České Budějovice — Michaela Kokešová",
      "popis": "Bolesti zad, krku a kloubů, návrat k pohybu po úrazu. Fyzioterapie v Českých Budějovicích."
    },
    {
      "_id": "seo-podo",
      "href": "/podologie",
      "titulek": "Podologie České Budějovice — Michaela Kokešová",
      "popis": "Zarostlé nehty, otlaky, kuří oka a individuálně formované stélky. Podologie v Českých Budějovicích."
    },
    {
      "_id": "seo-detska",
      "href": "/detska-fyzioterapie",
      "titulek": "Dětská fyzioterapie České Budějovice — Michaela Kokešová",
      "popis": "Dětská fyzioterapie od šestinedělí po školáky. České Budějovice."
    },
    {
      "_id": "seo-cenik",
      "href": "/cenik",
      "titulek": "Ceník — Michaela Kokešová, fyzioterapie a podologie",
      "popis": "Ceník fyzioterapie, podologie a dětské fyzioterapie v Českých Budějovicích."
    },
    {
      "_id": "seo-o-mne",
      "href": "/o-mne",
      "titulek": "O mně — Michaela Kokešová, fyzioterapeutka",
      "popis": "Kdo jsem, čemu se věnuji a jaké mám vzdělání a kurzy."
    },
    {
      "_id": "seo-faq",
      "href": "/caste-dotazy",
      "titulek": "Časté dotazy — Michaela Kokešová",
      "popis": "Na co se lidé ptají, než přijdou poprvé na fyzioterapii nebo podologii."
    }
  ],
  "sdileni": "",
  "sdileni_popis": ""
}$json$::jsonb),
  ('pravni', $json${
  "osobni_udaje": "Tenhle text doplní Reponik před spuštěním webu. Bude v něm pravdivě popsané, že formulář se nikam neukládá a zpráva se posílá e-mailem.",
  "cookies": "Tenhle text doplní Reponik před spuštěním webu. Bude v něm, jaké cookies web používá a jak souhlas odvolat."
}$json$::jsonb)
on conflict (key) do nothing;
