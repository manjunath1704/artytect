alter table public.categories
add column if not exists parent_category_id uuid null references public.categories(id) on delete restrict,
add column if not exists updated_at timestamptz not null default now();

create index if not exists categories_parent_category_id_idx
on public.categories(parent_category_id);

create or replace function public.set_categories_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_categories_updated_at();

create or replace function public.validate_category_hierarchy()
returns trigger
language plpgsql
as $$
declare
  parent_parent_id uuid;
  child_count integer;
begin
  if new.parent_category_id is null then
    return new;
  end if;

  if new.parent_category_id = new.id then
    raise exception 'A category cannot be its own parent.';
  end if;

  select parent_category_id
  into parent_parent_id
  from public.categories
  where id = new.parent_category_id;

  if not found then
    raise exception 'Parent category does not exist.';
  end if;

  if parent_parent_id is not null then
    raise exception 'Child categories cannot be used as parent categories.';
  end if;

  select count(*)
  into child_count
  from public.categories
  where parent_category_id = new.id;

  if child_count > 0 then
    raise exception 'Categories with children cannot be assigned to another parent.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_category_hierarchy on public.categories;
create trigger validate_category_hierarchy
before insert or update on public.categories
for each row
execute function public.validate_category_hierarchy();
