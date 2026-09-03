-- BMB WEAR — base durable (Supabase Postgres + Storage)
-- À coller dans Supabase > SQL Editor > New query > Run

create table if not exists products (
  id text primary key,
  name text not null,
  cat text not null default 'windbreaker',
  price int not null default 0,
  old_price int not null default 0,
  description text default '',
  images text[] default '{}',
  emoji text default '👕',
  trend boolean default false,
  is_new boolean default true,
  created_at timestamptz default now()
);

create table if not exists colors (
  id bigserial primary key,
  product_id text references products(id) on delete cascade,
  name text not null default 'Unique',
  hex text not null default '#ffffff',
  img text default '',
  sizes jsonb not null default '{}'
);
create index if not exists colors_product on colors(product_id);

create table if not exists customers (
  tel text primary key,
  name text not null,
  email text unique not null,
  pass text not null,
  addr text default '',
  created_at timestamptz default now()
);

create table if not exists orders (
  num text primary key,
  name text not null,
  tel text not null,
  zone text default '',
  quartier text default '',
  adr text default '',
  pay text default 'Wave',
  code text default '',
  note text default '',
  items jsonb not null default '[]',
  total int not null default 0,
  status text not null default 'En attente',
  created_at timestamptz default now(),
  deadline bigint default 0
);

create table if not exists settings (
  key text primary key,
  value jsonb not null
);

create table if not exists messages (
  id text primary key,
  name text not null,
  tel text not null,
  msg text not null,
  lu boolean default false,
  created_at timestamptz default now()
);

-- Stockage photos durable (URLs publiques, pas de base64)
insert into storage.buckets (id, name, public)
values ('product-photos','product-photos', true)
on conflict (id) do nothing;

-- Lecture publique catalogue (boutique sans login)
alter table products enable row level security;
alter table colors enable row level security;
drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (true);
drop policy if exists "public read colors" on colors;
create policy "public read colors" on colors for select using (true);

-- Écriture via clé anon : à REMPLACER par Supabase Auth (admin) dès que possible.
-- En attendant, politiques ouvertes INSERT/UPDATE/DELETE pour anon (site vitrine simple).
drop policy if exists "anon write products" on products;
create policy "anon write products" on products for all using (true) with check (true);
drop policy if exists "anon write colors" on colors;
create policy "anon write colors" on colors for all using (true) with check (true);
alter table customers enable row level security;
drop policy if exists "anon write customers" on customers;
create policy "anon write customers" on customers for all using (true) with check (true);
alter table orders enable row level security;
drop policy if exists "anon write orders" on orders;
create policy "anon write orders" on orders for all using (true) with check (true);
alter table settings enable row level security;
drop policy if exists "anon write settings" on settings;
create policy "anon write settings" on settings for all using (true) with check (true);
alter table messages enable row level security;
drop policy if exists "anon write messages" on messages;
create policy "anon write messages" on messages for all using (true) with check (true);

-- Bucket public : lecture OK ; upload via anon
drop policy if exists "public read photos" on storage.objects;
create policy "public read photos" on storage.objects for select using (bucket_id='product-photos');
drop policy if exists "anon upload photos" on storage.objects;
create policy "anon upload photos" on storage.objects for insert with check (bucket_id='product-photos');
drop policy if exists "anon update photos" on storage.objects;
create policy "anon update photos" on storage.objects for update using (bucket_id='product-photos');
