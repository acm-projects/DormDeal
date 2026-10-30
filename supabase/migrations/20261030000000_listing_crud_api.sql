-- Listing CRUD permissions for the Supabase REST Data API.
-- The publishable client key is safe only because these grants are paired with RLS.

update public.listings
set category = 'other'
where category is null or btrim(category::text) = '';

alter table public.listings
  alter column category set default 'other',
  alter column category set not null;

alter table public.listings enable row level security;

revoke all on public.listings from anon, authenticated;
grant select, insert, update, delete on public.listings to authenticated;

do $$
declare
  listing_id_sequence text;
begin
  listing_id_sequence := pg_get_serial_sequence('public.listings', 'listing_id');
  if listing_id_sequence is not null then
    execute format('grant usage, select on sequence %s to authenticated', listing_id_sequence);
  end if;
end
$$;

drop policy if exists "Authenticated users can read active or owned listings" on public.listings;
drop policy if exists "Users can read accessible listings" on public.listings;
create policy "Authenticated users can read active or owned listings"
on public.listings
for select
to authenticated
using (status = 'active' or seller_id = (select auth.uid()));

drop policy if exists "Authenticated users can create their own listings" on public.listings;
drop policy if exists "Verified users can create their own listings" on public.listings;
create policy "Authenticated users can create their own listings"
on public.listings
for insert
to authenticated
with check (
  seller_id = (select auth.uid())
  and exists (
    select 1
    from public."app-users"
    where "app-users".user_id = (select auth.uid())
  )
);

drop policy if exists "Sellers can update their own listings" on public.listings;
drop policy if exists "Sellers can update their listings" on public.listings;
create policy "Sellers can update their own listings"
on public.listings
for update
to authenticated
using (seller_id = (select auth.uid()))
with check (seller_id = (select auth.uid()));

drop policy if exists "Sellers can delete their own listings" on public.listings;
drop policy if exists "Sellers can delete their listings" on public.listings;
create policy "Sellers can delete their own listings"
on public.listings
for delete
to authenticated
using (seller_id = (select auth.uid()));
