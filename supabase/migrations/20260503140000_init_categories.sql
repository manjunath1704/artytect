create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  thumbnail_url text not null,
  hover_thumbnail_url text not null,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
on public.categories
for select
using (true);

drop policy if exists "Authenticated can insert categories" on public.categories;
create policy "Authenticated can insert categories"
on public.categories
for insert
with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated can update categories" on public.categories;
create policy "Authenticated can update categories"
on public.categories
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated can delete categories" on public.categories;
create policy "Authenticated can delete categories"
on public.categories
for delete
using (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public)
values ('category-thumbnails', 'category-thumbnails', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can read category thumbnails" on storage.objects;
create policy "Public can read category thumbnails"
on storage.objects
for select
using (bucket_id = 'category-thumbnails');

drop policy if exists "Authenticated can upload category thumbnails" on storage.objects;
create policy "Authenticated can upload category thumbnails"
on storage.objects
for insert
with check (bucket_id = 'category-thumbnails' and auth.role() = 'authenticated');

drop policy if exists "Authenticated can update category thumbnails" on storage.objects;
create policy "Authenticated can update category thumbnails"
on storage.objects
for update
using (bucket_id = 'category-thumbnails' and auth.role() = 'authenticated')
with check (bucket_id = 'category-thumbnails' and auth.role() = 'authenticated');

