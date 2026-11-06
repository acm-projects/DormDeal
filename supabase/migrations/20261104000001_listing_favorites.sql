create table if not exists public.listing_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id bigint not null references public.listings(listing_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.listing_favorites enable row level security;

revoke all on public.listing_favorites from anon, authenticated;
grant select, insert, delete on public.listing_favorites to authenticated;

create policy "Users can read their own favorites"
on public.listing_favorites for select to authenticated
using (user_id = (select auth.uid()));

create policy "Users can add their own favorites"
on public.listing_favorites for insert to authenticated
with check (user_id = (select auth.uid()));

create policy "Users can remove their own favorites"
on public.listing_favorites for delete to authenticated
using (user_id = (select auth.uid()));

create index if not exists listing_favorites_listing_id_idx
on public.listing_favorites(listing_id);
