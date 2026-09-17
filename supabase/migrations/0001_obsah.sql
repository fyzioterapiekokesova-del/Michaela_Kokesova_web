-- Fyzioterapie Michaela Kokešová — obsah webu
--
-- Jedna tabulka na celý obsah. Klíč je název sekce, hodnota je JSON, jehož
-- tvar hlídá deklarativní schéma v `lib/admin/obsah-schema.ts`.
--
-- RLS je zapnutá na obou tabulkách, i když má web jediného uživatele:
-- anonymní klíč je veřejný a REST API Supabase se dá zavolat přímo, mimo web.
-- Bez policy by si obsah mohl přepsat kdokoli.
--
-- Už aplikovanou migraci nikdy neměnit — vždy přidat novou.

-- ---------------------------------------------------------------------------
-- Kdo je administrátor
-- ---------------------------------------------------------------------------

create table public.admini (
  user_id uuid primary key references auth.users (id) on delete cascade,
  poznamka text,
  vytvoreno timestamptz not null default now()
);

alter table public.admini enable row level security;

-- Přihlášený vidí jen svůj vlastní řádek. Přidávat a mazat administrátory smí
-- výhradně server pod servisním klíčem, ten RLS obchází.
create policy "admin vidi sam sebe"
  on public.admini
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- `security definer` je tu potřeba: funkce se volá uvnitř policy nad jinou
-- tabulkou a musí umět do `admini` nahlédnout, aniž by ji zastavila její vlastní
-- RLS. Pevný `search_path` brání tomu, aby se podstrčila jiná tabulka `admini`.
create or replace function public.je_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admini where user_id = auth.uid()
  );
$$;

revoke execute on function public.je_admin() from public;
grant execute on function public.je_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Obsah webu
-- ---------------------------------------------------------------------------

create table public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- Číst může kdokoli — je to obsah veřejného webu.
create policy "obsah cte kdokoli"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

-- Zapisovat smí jen administrátor. Skrytí tlačítka v administraci není ochrana;
-- rozhoduje se to tady, na serveru.
create policy "obsah meni jen admin"
  on public.site_content
  for insert
  to authenticated
  with check (public.je_admin());

create policy "obsah upravuje jen admin"
  on public.site_content
  for update
  to authenticated
  using (public.je_admin())
  with check (public.je_admin());

create policy "obsah maze jen admin"
  on public.site_content
  for delete
  to authenticated
  using (public.je_admin());

-- `updated_at` se nastavuje na serveru, ne z prohlížeče.
create or replace function public.nastav_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger site_content_updated_at
  before update on public.site_content
  for each row
  execute function public.nastav_updated_at();
