-- The live marketplace tables had RLS enabled without SELECT policies,
-- which made every listing and seller invisible to signed-in users.

grant select on public.listings to authenticated;
grant select on public.listing_images to authenticated;

create policy "Authenticated users can read active or owned listings"
on public.listings
for select
to authenticated
using (
  status = 'active'
  or seller_id = (select auth.uid())
);

create policy "Authenticated users can read images for visible listings"
on public.listing_images
for select
to authenticated
using (
  exists (
    select 1
    from public.listings
    where listings.listing_id = listing_images.listing_id
  )
);

-- The function returns only the seller's display name, never email or trust data.
-- Its WHERE clause still restricts results to active listings owned by other users.
alter function public.get_recommended_listings(integer) security definer;
