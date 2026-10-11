-- Add a flexible category catalog and explicit per-user category preferences.

create table if not exists public.listing_categories (
  category_key character varying primary key,
  display_name character varying not null unique,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamp without time zone not null default now(),

  constraint listing_categories_key_format
    check (category_key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$')
);

insert into public.listing_categories
  (category_key, display_name, sort_order)
values
  ('textbooks', 'Textbooks & Course Materials', 10),
  ('electronics', 'Electronics', 20),
  ('furniture', 'Furniture', 30),
  ('dorm_supplies', 'Dorm Supplies & Decor', 40),
  ('kitchen_appliances', 'Kitchen & Appliances', 50),
  ('clothing_accessories', 'Clothing & Accessories', 60),
  ('school_supplies', 'School Supplies', 70),
  ('bikes_transportation', 'Bikes & Transportation', 80),
  ('gaming_entertainment', 'Gaming & Entertainment', 90),
  ('other', 'Other', 100)
on conflict (category_key) do update
set
  display_name = excluded.display_name,
  sort_order = excluded.sort_order;

-- Normalize existing values before adding the foreign key. Unknown values are
-- preserved as generated keys and added to the catalog rather than discarded.
update public.listings
set category = case
  when category is null or trim(category) = '' then 'other'
  when lower(trim(category)) in ('book', 'books', 'textbook', 'textbooks') then 'textbooks'
  when lower(trim(category)) in ('electronic', 'electronics') then 'electronics'
  when lower(trim(category)) in ('furniture') then 'furniture'
  when lower(trim(category)) in ('dorm', 'dorm supplies', 'dorm-supplies', 'dorm_supplies') then 'dorm_supplies'
  when lower(trim(category)) in ('kitchen', 'appliances', 'kitchen appliances', 'kitchen_appliances') then 'kitchen_appliances'
  when lower(trim(category)) in ('clothes', 'clothing', 'clothing accessories', 'clothing_accessories') then 'clothing_accessories'
  when lower(trim(category)) in ('school supplies', 'school-supplies', 'school_supplies') then 'school_supplies'
  when lower(trim(category)) in ('bikes', 'transportation', 'bikes transportation', 'bikes_transportation') then 'bikes_transportation'
  when lower(trim(category)) in ('gaming', 'entertainment', 'gaming entertainment', 'gaming_entertainment') then 'gaming_entertainment'
  else coalesce(
    nullif(
      trim(both '_' from regexp_replace(lower(trim(category)), '[^a-z0-9]+', '_', 'g')),
      ''
    ),
    'other'
  )
end;

insert into public.listing_categories (category_key, display_name, sort_order)
select distinct
  category,
  initcap(replace(category, '_', ' ')),
  1000
from public.listings
where category is not null
on conflict (category_key) do nothing;

alter table public.listings
  alter column category set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'listings_category_fkey'
      and conrelid = 'public.listings'::regclass
  ) then
    alter table public.listings
      add constraint listings_category_fkey
      foreign key (category)
      references public.listing_categories(category_key);
  end if;
end;
$$;

create table if not exists public.user_liked_categories (
  user_id bigint not null
    references public."app-users"(user_id) on delete cascade,
  category_key character varying not null
    references public.listing_categories(category_key) on delete cascade,
  liked_at timestamp without time zone not null default now(),
  primary key (user_id, category_key)
);

create index if not exists user_liked_categories_category_idx
  on public.user_liked_categories (category_key, user_id);

create index if not exists listings_active_category_created_idx
  on public.listings (status, category, created_at desc);

alter table public.listing_categories enable row level security;
alter table public.user_liked_categories enable row level security;

revoke all on public.listing_categories from anon, authenticated;
revoke all on public.user_liked_categories from anon, authenticated;
grant select on public.listing_categories to authenticated;
grant select, insert, delete on public.user_liked_categories to authenticated;

create policy "Authenticated users can read active listing categories"
on public.listing_categories
for select
to authenticated
using (is_active = true);

create policy "Users can read their liked categories"
on public.user_liked_categories
for select
to authenticated
using (
  exists (
    select 1
    from public."app-users" as app_user
    where app_user.user_id = user_liked_categories.user_id
      and app_user.auth_user_id = (select auth.uid())
  )
);

create policy "Users can like active categories"
on public.user_liked_categories
for insert
to authenticated
with check (
  exists (
    select 1
    from public."app-users" as app_user
    where app_user.user_id = user_liked_categories.user_id
      and app_user.auth_user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.listing_categories as category
    where category.category_key = user_liked_categories.category_key
      and category.is_active = true
  )
);

create policy "Users can remove their liked categories"
on public.user_liked_categories
for delete
to authenticated
using (
  exists (
    select 1
    from public."app-users" as app_user
    where app_user.user_id = user_liked_categories.user_id
      and app_user.auth_user_id = (select auth.uid())
  )
);
