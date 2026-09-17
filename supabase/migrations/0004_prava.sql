-- Přístupová práva pro role, pod kterými jezdí API.
--
-- RLS říká, které řádky role vidí. Grant říká, jestli se na tabulku vůbec
-- smí podívat. Bez grantu vrátí PostgREST 401 „permission denied" ještě
-- předtím, než se na RLS dostane — což je přesně to, co se stalo:
-- projekt založený v roce 2026 už nedává rolím `anon` a `authenticated`
-- práva na nové tabulky automaticky.
--
-- Obojí je potřeba. Grant sám o sobě nic neotevírá — pořád platí policy
-- z migrace 0001, takže zapisovat smí jedině administrátor.
--
-- Už aplikovanou migraci nikdy neměnit — vždy přidat novou.

grant usage on schema public to anon, authenticated, service_role;

-- Obsah webu: čte kdokoli, mění jen administrátor (hlídá policy).
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant all privileges on public.site_content to service_role;

-- Seznam administrátorů: přihlášený vidí jen svůj řádek (hlídá policy),
-- přidávat a mazat smí jen server pod servisním klíčem.
grant select on public.admini to authenticated;
grant all privileges on public.admini to service_role;

-- Aby stejná past nesklapla u tabulek, které přibudou později.
alter default privileges in schema public
  grant select on tables to anon, authenticated;
alter default privileges in schema public
  grant all privileges on tables to service_role;
