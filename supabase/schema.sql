create extension if not exists "uuid-ossp";

insert into storage.buckets (id, name, public)
values ('stock-images', 'stock-images', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('shopkeeper-proofs', 'shopkeeper-proofs', false)
on conflict (id) do nothing;

do $$ begin create type user_role as enum ('citizen', 'shopkeeper', 'admin'); exception when duplicate_object then null; end $$;
do $$ begin create type stock_status as enum ('available', 'low_stock', 'out_of_stock', 'unknown'); exception when duplicate_object then null; end $$;
do $$ begin create type verification_status as enum ('shop_verified', 'ai_assisted', 'community_report'); exception when duplicate_object then null; end $$;

create table if not exists shops (
  id uuid primary key default uuid_generate_v4(), name text not null, address text,
  latitude double precision not null, longitude double precision not null, created_at timestamptz default now()
);
create table if not exists items (
  id uuid primary key default uuid_generate_v4(), name text not null unique,
  localized_names jsonb not null default '{}', unit text default 'kg'
);
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade, name text,
  role user_role not null default 'citizen', language text default 'en',
  shop_id uuid references shops(id), created_at timestamptz default now(),
  verification_status text not null default 'pending' check (verification_status in ('pending','approved','rejected')),
  license_number text, proof_image_path text, phone text
);
create table if not exists stock (
  id uuid primary key default uuid_generate_v4(), shop_id uuid not null references shops(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade, quantity numeric default 0,
  status stock_status default 'unknown', last_updated_at timestamptz default now(),
  verification_status verification_status default 'shop_verified', updated_by uuid references profiles(id),
  unique(shop_id, item_id)
);
create table if not exists stock_updates (
  id uuid primary key default uuid_generate_v4(), shop_id uuid not null references shops(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade, old_quantity numeric, new_quantity numeric,
  old_status stock_status, new_status stock_status, method text not null,
  updated_by uuid references profiles(id), human_confirmed boolean default true, created_at timestamptz default now()
);
create table if not exists alerts (
  id uuid primary key default uuid_generate_v4(), user_id uuid not null references profiles(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade, shop_id uuid not null references shops(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'triggered', 'cancelled')), created_at timestamptz default now(),
  unique(user_id, item_id, shop_id, status)
);
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(), user_id uuid not null references profiles(id) on delete cascade,
  message text, read boolean default false, created_at timestamptz default now()
);

alter table shops enable row level security;
alter table items enable row level security;
alter table profiles enable row level security;
alter table stock enable row level security;
alter table stock_updates enable row level security;
alter table alerts enable row level security;
alter table notifications enable row level security;

drop policy if exists "public can read shops" on shops;
create policy "public can read shops" on shops for select using (true);
drop policy if exists "public can read items" on items;
create policy "public can read items" on items for select using (true);
drop policy if exists "public can read stock" on stock;
create policy "public can read stock" on stock for select using (true);
drop policy if exists "users read own profile" on profiles;
create policy "users read own profile" on profiles for select using (auth.uid() = id);

drop policy if exists "admins read all profiles" on profiles;
create policy "admins read all profiles" on profiles for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "admins update all profiles" on profiles;
create policy "admins update all profiles" on profiles for update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "users can upload their own proof" on storage.objects;
create policy "users can upload their own proof" on storage.objects for insert
with check ( bucket_id = 'shopkeeper-proofs' and auth.uid() = owner );

drop policy if exists "admins can read all proofs" on storage.objects;
create policy "admins can read all proofs" on storage.objects for select
using ( bucket_id = 'shopkeeper-proofs' and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin') );

drop policy if exists "users can read own proof" on storage.objects;
create policy "users can read own proof" on storage.objects for select
using ( bucket_id = 'shopkeeper-proofs' and auth.uid() = owner );

drop policy if exists "users create own profile" on profiles;
create policy "users create own profile" on profiles for insert with check (auth.uid() = id);
drop policy if exists "shopkeepers update their stock" on stock;
create policy "shopkeepers update their stock" on stock for update using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'shopkeeper' and profiles.shop_id = stock.shop_id)
) with check (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'shopkeeper' and profiles.shop_id = stock.shop_id)
);
drop policy if exists "shopkeepers insert their stock" on stock;
create policy "shopkeepers insert their stock" on stock for insert with check (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'shopkeeper' and profiles.shop_id = stock.shop_id)
);
drop policy if exists "shopkeepers audit their stock" on stock_updates;
create policy "shopkeepers audit their stock" on stock_updates for insert with check (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'shopkeeper' and profiles.shop_id = stock_updates.shop_id)
);
drop policy if exists "users manage own alerts" on alerts;
create policy "users manage own alerts" on alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users read own notifications" on notifications;
create policy "users read own notifications" on notifications for select using (auth.uid() = user_id);

insert into shops (id, name, address, latitude, longitude) values
  ('00000000-0000-0000-0000-000000000001', 'Puthiyara FPS', 'Puthiyara Road, Kozhikode', 11.2551, 75.7809),
  ('00000000-0000-0000-0000-000000000002', 'Mavoor Road FPS', 'Mavoor Road, Kozhikode', 11.2642, 75.7871),
  ('00000000-0000-0000-0000-000000000003', 'Palayam FPS', 'Palayam, Kozhikode', 11.2518, 75.7736)
on conflict (id) do nothing;
insert into items (id, name, localized_names, unit) values
  ('00000000-0000-0000-0000-000000000011', 'Rice', '{"ml":"അരി"}', 'kg'),
  ('00000000-0000-0000-0000-000000000012', 'Wheat', '{"ml":"ഗോതമ്പ്"}', 'kg'),
  ('00000000-0000-0000-0000-000000000013', 'Sugar', '{"ml":"പഞ്ചസാര"}', 'kg')
on conflict (id) do nothing;
insert into stock (shop_id, item_id, quantity, status, verification_status)
select s.id, i.id, v.quantity, v.status::stock_status, 'shop_verified'::verification_status
from (values
  ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011',48,'available'),
  ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000012',9,'low_stock'),
  ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000013',0,'out_of_stock'),
  ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000011',6,'low_stock'),
  ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000012',22,'available'),
  ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000011',0,'out_of_stock')
) as v(shop_id, item_id, quantity, status)
join shops s on s.id = v.shop_id::uuid join items i on i.id = v.item_id::uuid
on conflict (shop_id, item_id) do update set quantity = excluded.quantity, status = excluded.status;
