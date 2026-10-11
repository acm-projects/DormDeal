-- Support the TypeScript recommendation endpoint without changing existing IDs.
-- The quoted name is required because the current users table contains a hyphen.

alter table public."app-users"
  add column if not exists auth_user_id uuid
  references auth.users(id) on delete set null;

create unique index if not exists app_users_auth_user_id_unique_idx
  on public."app-users" (auth_user_id)
  where auth_user_id is not null;

create index if not exists app_users_email_lookup_idx
  on public."app-users" (email)
  where email is not null;

create index if not exists listings_recommendation_candidates_idx
  on public.listings (status, created_at desc);

create index if not exists listings_recommendation_category_idx
  on public.listings (category, created_at desc);

create index if not exists conversations_recommendation_buyer_idx
  on public.conversations (buyer_id, created_at desc);

create index if not exists conversations_recommendation_listing_idx
  on public.conversations (listing_id);

create index if not exists reviews_recommendation_reviewee_idx
  on public.reviews (reviewee_id);
