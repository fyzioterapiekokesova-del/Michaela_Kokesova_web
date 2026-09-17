-- Úložiště fotek.
--
-- Číst může kdokoli (jsou to fotky na veřejném webu), nahrávat a mazat jen
-- administrátor. Povolené typy a velikost hlídá i server v aplikaci — tohle
-- je druhá vrstva, aby se nedalo nahrávat přímo přes REST API Supabase.
--
-- SVG je zakázané schválně: může obsahovat skript a otevřené ze stejné domény
-- by ho prohlížeč spustil.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotky',
  'fotky',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "fotky cte kdokoli"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'fotky');

create policy "fotky nahrava jen admin"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'fotky' and public.je_admin());

create policy "fotky meni jen admin"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'fotky' and public.je_admin())
  with check (bucket_id = 'fotky' and public.je_admin());

create policy "fotky maze jen admin"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'fotky' and public.je_admin());
