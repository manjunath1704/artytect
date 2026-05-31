create table if not exists public.public_section_visibility (
  section_key text primary key,
  label text not null,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.public_section_visibility (section_key, label, is_visible, sort_order)
values
  ('hero', 'Hero', true, 10),
  ('categories', 'Categories', true, 20),
  ('featured_products', 'Featured Products', true, 30),
  ('featured_classes', 'Featured Classes', true, 40),
  ('about', 'About', true, 50),
  ('process', 'Process', true, 60),
  ('testimonials', 'Testimonials', true, 70),
  ('crafted_moments', 'Crafted Moments', true, 80)
on conflict (section_key) do nothing;

create or replace function public.set_public_section_visibility_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_public_section_visibility_updated_at on public.public_section_visibility;
create trigger set_public_section_visibility_updated_at
before update on public.public_section_visibility
for each row
execute function public.set_public_section_visibility_updated_at();

alter table public.public_section_visibility enable row level security;

drop policy if exists "Public can read section visibility" on public.public_section_visibility;
create policy "Public can read section visibility"
on public.public_section_visibility
for select
using (true);

drop policy if exists "Authenticated can update section visibility" on public.public_section_visibility;
create policy "Authenticated can update section visibility"
on public.public_section_visibility
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
