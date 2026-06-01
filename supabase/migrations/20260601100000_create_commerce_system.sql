create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  description text not null default '',
  short_description text not null default '',
  price numeric(10, 2) not null default 0,
  compare_at_price numeric(10, 2),
  quantity integer not null default 0,
  sizes text[] not null default array['S', 'M', 'L', 'XL']::text[],
  colors text[] not null default '{}'::text[],
  measurement_table jsonb not null default '[]'::jsonb,
  thumbnail_url text not null default '',
  gallery_urls text[] not null default '{}'::text[],
  status text not null default 'draft' check (status in ('draft', 'published')),
  sku text not null default '',
  tags text[] not null default '{}'::text[],
  dimensions text not null default '',
  materials text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_status_idx on public.products(status);
create index if not exists products_category_idx on public.products(category);
create index if not exists products_created_at_idx on public.products(created_at desc);

create table if not exists public.admin_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  user_id uuid,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  address text not null,
  ordered_products jsonb not null default '[]'::jsonb,
  selected_sizes text[] not null default '{}'::text[],
  selected_colors text[] not null default '{}'::text[],
  quantities integer[] not null default '{}'::integer[],
  total_amount numeric(10, 2) not null default 0,
  payment_screenshot text not null,
  payment_status text not null default 'Pending Verification'
    check (payment_status in ('Pending Verification', 'Verified', 'Rejected')),
  order_status text not null default 'Payment Review'
    check (order_status in ('Payment Review', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists orders_order_status_idx on public.orders(order_status);

alter table public.products enable row level security;
alter table public.admin_settings enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Published products are public" on public.products;
create policy "Published products are public"
on public.products for select
using (status = 'published');

drop policy if exists "Payment QR is public" on public.admin_settings;
create policy "Payment QR is public"
on public.admin_settings for select
using (key = 'payment_qr');

drop policy if exists "Users can read their orders" on public.orders;
create policy "Users can read their orders"
on public.orders for select
using (auth.uid() = user_id);
