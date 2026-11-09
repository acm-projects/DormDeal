insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do update set public = excluded.public;

grant insert on public.listing_images to authenticated;

create policy "Sellers can add images to their listings"
on public.listing_images
for insert
to authenticated
with check (
  exists (
    select 1
    from public.listings
    where listings.listing_id = listing_images.listing_id
      and listings.seller_id = (select auth.uid())
  )
);

create policy "Sellers can upload their listing images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Anyone can view listing images"
on storage.objects
for select
to public
using (bucket_id = 'listing-images');

create policy "Sellers can delete their listing images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
