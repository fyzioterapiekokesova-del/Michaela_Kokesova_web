/**
 * Vygeneruje migraci s výchozím obsahem ze souboru `src/lib/obsah/vychozi.ts`.
 *
 * Spuštění:  npm run seed
 *
 * Migrace používá `on conflict do nothing`, takže se pustí jen při prvním
 * nasazení a **nikdy nepřepíše to, co si Michaela v administraci změnila.**
 */

import { writeFileSync } from "node:fs";
import { VYCHOZI_OBSAH } from "../src/lib/obsah/vychozi.ts";

const CIL = "supabase/migrations/0003_vychozi_obsah.sql";

const radky = Object.entries(VYCHOZI_OBSAH).map(([klic, hodnota]) => {
  const json = JSON.stringify(hodnota, null, 2);
  if (json.includes("$json$")) {
    throw new Error(`Obsah „${klic}" obsahuje $json$ a rozbil by SQL.`);
  }
  return `  ('${klic}', $json$${json}$json$::jsonb)`;
});

const sql = `-- Výchozí obsah webu.
--
-- VYGENEROVÁNO — needitovat ručně. Zdroj je \`src/lib/obsah/vychozi.ts\`,
-- přegenerovat se dá příkazem \`npm run seed\`.
--
-- \`on conflict do nothing\` je tu schválně: migrace naplní prázdnou databázi,
-- ale nikdy nepřepíše obsah, který si klientka v administraci změnila.

insert into public.site_content (key, value) values
${radky.join(",\n")}
on conflict (key) do nothing;
`;

writeFileSync(CIL, sql, "utf8");
console.log(`Zapsáno ${Object.keys(VYCHOZI_OBSAH).length} sekcí do ${CIL}`);
