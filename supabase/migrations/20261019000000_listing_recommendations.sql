-- Explainable, category-based recommendations for marketplace listings.
-- Interaction weights are intentionally simple so they are easy to tune and test.

create table public.listing_interactions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid()
    references public."app-users"(user_id) on delete cascade,
  listing_id bigint not null
    references public.listings(listing_id) on delete cascade,
  event_type text not null,
  created_at timestamptz not null default now(),

  constraint listing_interactions_event_type_valid
    check (event_type in ('view', 'message', 'purchase', 'dismiss'))
);

create index listing_interactions_user_time_idx
  on public.listing_interactions (user_id, created_at desc);

create index listing_interactions_listing_time_idx
  on public.listing_interactions (listing_id, created_at desc);

alter table public.listing_interactions enable row level security;

revoke all on public.listing_interactions from anon, authenticated;
grant select, insert on public.listing_interactions to authenticated;
grant usage, select on sequence public.listing_interactions_id_seq to authenticated;

create policy "Users can read their recommendation activity"
on public.listing_interactions
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can record their recommendation activity"
on public.listing_interactions
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.listings
    where listings.listing_id = listing_interactions.listing_id
      and listings.seller_id <> (select auth.uid())
  )
);

create or replace function public.get_user_category_preferences()
returns table (
  category text,
  affinity_score numeric,
  views bigint,
  messages bigint,
  purchases bigint,
  dismissals bigint
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select
    listings.category::text,
    round(sum(
      (case listing_interactions.event_type
        when 'view' then 1
        when 'message' then 5
        when 'purchase' then 8
        when 'dismiss' then -3
      end)
      * exp(-extract(epoch from (now() - listing_interactions.created_at)) / 2592000.0)
    )::numeric, 2) as affinity_score,
    count(*) filter (where listing_interactions.event_type = 'view') as views,
    count(*) filter (where listing_interactions.event_type = 'message') as messages,
    count(*) filter (where listing_interactions.event_type = 'purchase') as purchases,
    count(*) filter (where listing_interactions.event_type = 'dismiss') as dismissals
  from public.listing_interactions
  join public.listings
    on listings.listing_id = listing_interactions.listing_id
  where listing_interactions.user_id = (select auth.uid())
    and listing_interactions.created_at >= now() - interval '90 days'
  group by listings.category
  order by affinity_score desc, listings.category;
$$;

create or replace function public.get_recommended_listings(p_limit integer default 20)
returns table (
  listing_id bigint,
  title text,
  description text,
  price numeric,
  category text,
  created_at timestamp,
  seller_id uuid,
  seller_name text,
  image_url text,
  recommendation_score numeric,
  recommendation_reason text
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  with category_preferences as (
    select * from public.get_user_category_preferences()
  ),
  listing_activity as (
    select
      listing_id,
      sum(case event_type
        when 'view' then 0.15
        when 'message' then 0.75
        when 'purchase' then 1.25
        else 0
      end) as popularity_score
    from public.listing_interactions
    where created_at >= now() - interval '30 days'
    group by listing_id
  ),
  viewer_activity as (
    select
      listing_id,
      sum(case event_type
        when 'view' then 0.35
        when 'message' then 1
        when 'purchase' then 3
        when 'dismiss' then 8
      end) as seen_penalty
    from public.listing_interactions
    where user_id = (select auth.uid())
      and created_at >= now() - interval '30 days'
    group by listing_id
  )
  select
    listings.listing_id,
    listings.title::text,
    listings.description,
    listings.price,
    listings.category::text,
    listings.created_at,
    listings.seller_id,
    users.name::text,
    (
      select listing_images.image_url::text
      from public.listing_images
      where listing_images.listing_id = listings.listing_id
      order by listing_images.image_id
      limit 1
    ),
    round((
      greatest(coalesce(category_preferences.affinity_score, 0), 0) * 10
      + coalesce(listing_activity.popularity_score, 0)
      + greatest(0, 3 - extract(epoch from (now() - listings.created_at)) / 604800.0)
      - coalesce(viewer_activity.seen_penalty, 0)
    )::numeric, 2) as recommendation_score,
    case
      when coalesce(category_preferences.affinity_score, 0) > 0
        then 'Matches your ' || replace(listings.category, '_', ' ') || ' activity'
      when coalesce(listing_activity.popularity_score, 0) > 0
        then 'Related to your recent activity'
      else 'New on your campus'
    end as recommendation_reason
  from public.listings
  join public."app-users" as users on users.user_id = listings.seller_id
  left join category_preferences on category_preferences.category = listings.category
  left join listing_activity on listing_activity.listing_id = listings.listing_id
  left join viewer_activity on viewer_activity.listing_id = listings.listing_id
  where listings.status = 'active'
    and listings.seller_id <> (select auth.uid())
  order by recommendation_score desc, listings.created_at desc
  limit least(greatest(coalesce(p_limit, 20), 1), 100);
$$;

revoke all on function public.get_user_category_preferences() from public;
revoke all on function public.get_recommended_listings(integer) from public;
grant execute on function public.get_user_category_preferences() to authenticated;
grant execute on function public.get_recommended_listings(integer) to authenticated;

comment on function public.get_user_category_preferences() is
  'Debuggable per-user category affinities based on the last 90 days of listing interactions.';

comment on function public.get_recommended_listings(integer) is
  'Ranks accessible active listings by user category affinity, freshness, and prior exposure.';
