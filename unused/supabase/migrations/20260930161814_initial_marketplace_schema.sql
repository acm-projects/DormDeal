-- =========================================================
-- Campuses
-- =========================================================

create table public.campuses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  email_domain text not null unique,
  created_at timestamptz not null default now(),

  constraint campuses_name_length
    check (char_length(name) between 1 and 120),

  constraint campuses_email_domain_lowercase
    check (email_domain = lower(email_domain))
);

-- =========================================================
-- Public user profiles
-- Supabase Auth owns authentication records in auth.users.
-- =========================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_path text,
  campus_id uuid references public.campuses(id),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_display_name_length
    check (char_length(display_name) between 1 and 80)
);

-- Automatically create a profile after an Auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(split_part(new.email, '@', 1), ''),
      'Student'
    )
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =========================================================
-- Listings
-- =========================================================

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null
    references public.profiles(id) on delete cascade,

  title text not null,
  description text not null default '',
  price_cents integer not null,

  category text not null,
  condition text not null,
  status text not null default 'active',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint listings_title_length
    check (char_length(title) between 1 and 120),

  constraint listings_description_length
    check (char_length(description) <= 5000),

  constraint listings_price_nonnegative
    check (price_cents >= 0),

  constraint listings_category_valid
    check (
      category in (
        'textbooks',
        'furniture',
        'electronics',
        'dorm_supplies',
        'clothing',
        'other'
      )
    ),

  constraint listings_condition_valid
    check (
      condition in (
        'new',
        'like_new',
        'good',
        'fair',
        'poor'
      )
    ),

  constraint listings_status_valid
    check (
      status in (
        'draft',
        'active',
        'reserved',
        'sold',
        'removed'
      )
    )
);

create index listings_seller_id_idx
  on public.listings (seller_id);

create index listings_feed_idx
  on public.listings (status, created_at desc);

create index listings_category_idx
  on public.listings (category, created_at desc);

-- =========================================================
-- Listing images
-- Store a Storage object path, not a generated URL.
-- =========================================================

create table public.listing_images (
  id bigint generated always as identity primary key,

  listing_id uuid not null
    references public.listings(id) on delete cascade,

  storage_path text not null unique,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),

  constraint listing_images_sort_order_nonnegative
    check (sort_order >= 0),

  constraint listing_images_order_unique
    unique (listing_id, sort_order)
);

create index listing_images_listing_id_idx
  on public.listing_images (listing_id);

-- =========================================================
-- Conversations
-- The seller is derived from listings.seller_id.
-- =========================================================

create table public.conversations (
  id uuid primary key default gen_random_uuid(),

  listing_id uuid not null
    references public.listings(id) on delete cascade,

  buyer_id uuid not null
    references public.profiles(id) on delete cascade,

  last_message_at timestamptz,
  created_at timestamptz not null default now(),

  constraint conversations_listing_buyer_unique
    unique (listing_id, buyer_id)
);

create index conversations_buyer_id_idx
  on public.conversations (buyer_id);

create index conversations_listing_id_idx
  on public.conversations (listing_id);

create index conversations_recent_idx
  on public.conversations (last_message_at desc nulls last);

-- =========================================================
-- Messages
-- =========================================================

create table public.messages (
  id uuid primary key default gen_random_uuid(),

  conversation_id uuid not null
    references public.conversations(id) on delete cascade,

  sender_id uuid not null
    references public.profiles(id) on delete cascade,

  content text not null,
  sent_at timestamptz not null default now(),

  constraint messages_content_length
    check (char_length(content) between 1 and 4000)
);

create index messages_conversation_time_idx
  on public.messages (conversation_id, sent_at);

create index messages_sender_id_idx
  on public.messages (sender_id);

-- Update the conversation whenever a message is sent.
create or replace function public.update_conversation_last_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set last_message_at = new.sent_at
  where id = new.conversation_id;

  return new;
end;
$$;

create trigger on_message_created
after insert on public.messages
for each row execute procedure public.update_conversation_last_message();

-- =========================================================
-- Conversation pins
-- The user/conversation pair is the primary key.
-- =========================================================

create table public.conversation_pins (
  user_id uuid not null
    references public.profiles(id) on delete cascade,

  conversation_id uuid not null
    references public.conversations(id) on delete cascade,

  pinned_at timestamptz not null default now(),

  primary key (user_id, conversation_id)
);

create index conversation_pins_conversation_id_idx
  on public.conversation_pins (conversation_id);

-- =========================================================
-- updated_at trigger
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger listings_set_updated_at
before update on public.listings
for each row execute procedure public.set_updated_at();

alter table public.campuses enable row level security;
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.conversation_pins enable row level security;

-- Remove broad default access.
revoke all on public.campuses from anon, authenticated;
revoke all on public.profiles from anon, authenticated;
revoke all on public.listings from anon, authenticated;
revoke all on public.listing_images from anon, authenticated;
revoke all on public.conversations from anon, authenticated;
revoke all on public.messages from anon, authenticated;
revoke all on public.conversation_pins from anon, authenticated;

-- Give only the operations needed by the application.
grant select on public.campuses to authenticated;

grant select on public.profiles to authenticated;
grant update (display_name, avatar_path)
  on public.profiles to authenticated;

grant select, insert, update, delete
  on public.listings to authenticated;

grant select, insert, update, delete
  on public.listing_images to authenticated;

grant select, insert
  on public.conversations to authenticated;

grant select, insert
  on public.messages to authenticated;

grant select, insert, delete
  on public.conversation_pins to authenticated;

grant usage, select
  on sequence public.listing_images_id_seq to authenticated;

-- Campuses can be seen by signed-in users.
create policy "Authenticated users can read campuses"
on public.campuses
for select
to authenticated
using (true);

-- Profiles contain only public profile information.
create policy "Authenticated users can read profiles"
on public.profiles
for select
to authenticated
using (true);

create policy "Users can update their profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Users can see their own listings, plus marketplace listings
-- from verified students at the same campus.
create policy "Users can read accessible listings"
on public.listings
for select
to authenticated
using (
  seller_id = (select auth.uid())
  or (
    status in ('active', 'reserved', 'sold')
    and exists (
      select 1
      from public.profiles as viewer
      join public.profiles as seller
        on seller.id = listings.seller_id
      where viewer.id = (select auth.uid())
        and viewer.verified_at is not null
        and seller.verified_at is not null
        and viewer.campus_id = seller.campus_id
    )
  )
);

create policy "Verified users can create their own listings"
on public.listings
for insert
to authenticated
with check (
  seller_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and campus_id is not null
      and verified_at is not null
  )
);

create policy "Sellers can update their listings"
on public.listings
for update
to authenticated
using (seller_id = (select auth.uid()))
with check (seller_id = (select auth.uid()));

create policy "Sellers can delete their listings"
on public.listings
for delete
to authenticated
using (seller_id = (select auth.uid()));

-- Listing images follow listing ownership and visibility.
create policy "Users can read accessible listing images"
on public.listing_images
for select
to authenticated
using (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
  )
);

create policy "Sellers can add listing images"
on public.listing_images
for insert
to authenticated
with check (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
      and listings.seller_id = (select auth.uid())
  )
);

create policy "Sellers can update listing images"
on public.listing_images
for update
to authenticated
using (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
      and listings.seller_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
      and listings.seller_id = (select auth.uid())
  )
);

create policy "Sellers can delete listing images"
on public.listing_images
for delete
to authenticated
using (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
      and listings.seller_id = (select auth.uid())
  )
);

-- Only the buyer and seller can access a conversation.
create policy "Participants can read conversations"
on public.conversations
for select
to authenticated
using (
  buyer_id = (select auth.uid())
  or exists (
    select 1
    from public.listings
    where listings.id = conversations.listing_id
      and listings.seller_id = (select auth.uid())
  )
);

create policy "Buyers can start conversations"
on public.conversations
for insert
to authenticated
with check (
  buyer_id = (select auth.uid())
  and exists (
    select 1
    from public.listings
    where listings.id = conversations.listing_id
      and listings.status = 'active'
      and listings.seller_id <> (select auth.uid())
  )
);

-- Messages inherit conversation membership.
create policy "Participants can read messages"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversations
    join public.listings
      on listings.id = conversations.listing_id
    where conversations.id = messages.conversation_id
      and (
        conversations.buyer_id = (select auth.uid())
        or listings.seller_id = (select auth.uid())
      )
  )
);

create policy "Participants can send messages"
on public.messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from public.conversations
    join public.listings
      on listings.id = conversations.listing_id
    where conversations.id = messages.conversation_id
      and (
        conversations.buyer_id = (select auth.uid())
        or listings.seller_id = (select auth.uid())
      )
  )
);

-- Pins are private to their owner.
create policy "Users can read their pins"
on public.conversation_pins
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can create their pins"
on public.conversation_pins
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.conversations
    join public.listings
      on listings.id = conversations.listing_id
    where conversations.id = conversation_pins.conversation_id
      and (
        conversations.buyer_id = (select auth.uid())
        or listings.seller_id = (select auth.uid())
      )
  )
);

create policy "Users can delete their pins"
on public.conversation_pins
for delete
to authenticated
using (user_id = (select auth.uid()));




insert into public.campuses (name, email_domain)
values ('University of Texas at Dallas', 'utdallas.edu');