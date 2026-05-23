create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  featured_image text,
  short_description text not null,
  content text not null,
  category text not null,
  tags text[] not null default '{}',
  author text not null,
  meta_title text,
  meta_description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blogs_status_published_at_idx on public.blogs (status, published_at desc);
create index if not exists blogs_category_idx on public.blogs (category);
create index if not exists blogs_slug_idx on public.blogs (slug);

create or replace function public.set_blogs_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_blogs_updated_at on public.blogs;
create trigger set_blogs_updated_at
before update on public.blogs
for each row
execute function public.set_blogs_updated_at();
