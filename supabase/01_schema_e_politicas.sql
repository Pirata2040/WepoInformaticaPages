-- Wepo Informática — executar uma vez no SQL Editor do Supabase.
-- NUNCA insira credenciais, service_role ou senhas neste arquivo.
-- Crie o administrador pelo painel Authentication > Users e adicione o UUID com o SQL do README.


create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.site_admins enable row level security;
revoke all on table public.site_admins from anon, authenticated;
-- Sem políticas: visitantes e usuários autenticados não podem editar sua própria autorização.

create or replace function public.is_site_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.site_admins a where a.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_site_admin() from public, anon, authenticated;
grant execute on function public.is_site_admin() to authenticated;

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('produto', 'servico')),
  title text not null check (char_length(trim(title)) between 3 and 100),
  description text not null check (char_length(trim(description)) between 10 and 1200),
  category text not null check (char_length(trim(category)) between 2 and 60),
  price numeric(12,2) check (price is null or (price >= 0 and price <= 9999999999.99)),
  image_url text check (image_url is null or char_length(image_url) <= 1000),
  sort_order integer not null default 0 check (sort_order between 0 and 9999),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_has_no_price check (kind = 'produto' or price is null)
);
create index if not exists catalog_items_public_idx on public.catalog_items(kind, active, sort_order);
alter table public.catalog_items enable row level security;

-- Menor privilégio: somente leitura pública, escrita apenas aos autenticados
-- QUE TAMBÉM PASSEM NA POLÍTICA DE ADMIN (RLS).
revoke all on table public.catalog_items from anon, authenticated;
grant select on table public.catalog_items to anon, authenticated;
grant insert, update, delete on table public.catalog_items to authenticated;

drop policy if exists "Public can read active catalog" on public.catalog_items;
create policy "Public can read active catalog" on public.catalog_items
  for select to anon, authenticated using (active = true);
drop policy if exists "Admins can read entire catalog" on public.catalog_items;
create policy "Admins can read entire catalog" on public.catalog_items
  for select to authenticated using ((select public.is_site_admin()));
drop policy if exists "Admins can insert catalog" on public.catalog_items;
create policy "Admins can insert catalog" on public.catalog_items
  for insert to authenticated with check ((select public.is_site_admin()));
drop policy if exists "Admins can update catalog" on public.catalog_items;
create policy "Admins can update catalog" on public.catalog_items
  for update to authenticated
  using ((select public.is_site_admin()))
  with check ((select public.is_site_admin()));
drop policy if exists "Admins can delete catalog" on public.catalog_items;
create policy "Admins can delete catalog" on public.catalog_items
  for delete to authenticated using ((select public.is_site_admin()));

create or replace function public.catalog_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists catalog_updated_at on public.catalog_items;
create trigger catalog_updated_at before update on public.catalog_items
  for each row execute function public.catalog_set_updated_at();

-- Fotos públicas de produtos, sem dados pessoais. O conteúdo continua público mesmo
-- após ocultar o item, se alguém souber a URL antiga; não use para arquivos privados.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog-images','catalog-images',true,3145728,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Wepo admins upload images" on storage.objects;
create policy "Wepo admins upload images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'catalog-images' and (select public.is_site_admin()));
drop policy if exists "Wepo admins view images" on storage.objects;
create policy "Wepo admins view images" on storage.objects
  for select to authenticated
  using (bucket_id = 'catalog-images' and (select public.is_site_admin()));
drop policy if exists "Wepo admins remove images" on storage.objects;
create policy "Wepo admins remove images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'catalog-images' and (select public.is_site_admin()));

-- Dados de demonstração. Execute opcionalmente o segundo arquivo com os 12 itens.
