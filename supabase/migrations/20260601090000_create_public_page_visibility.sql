create table if not exists public.public_page_visibility (
  page_key text primary key,
  label text not null,
  path text not null,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.public_page_visibility (page_key, label, path, is_visible, sort_order)
values
  ('categories', 'Categories', '/categories', true, 10),
  ('products', 'Products', '/products', true, 20),
  ('classes', 'Classes', '/classes', true, 30),
  ('blog', 'Blog', '/blog', true, 40),
  ('contact', 'Contact', '/contact', true, 50)
on conflict (page_key) do nothing;

create or replace function public.set_public_page_visibility_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_public_page_visibility_updated_at on public.public_page_visibility;
create trigger set_public_page_visibility_updated_at
before update on public.public_page_visibility
for each row
execute function public.set_public_page_visibility_updated_at();

alter table public.public_page_visibility enable row level security;

drop policy if exists "Public can read page visibility" on public.public_page_visibility;
create policy "Public can read page visibility"
on public.public_page_visibility
for select
using (true);

drop policy if exists "Authenticated can update page visibility" on public.public_page_visibility;
create policy "Authenticated can update page visibility"
on public.public_page_visibility
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
