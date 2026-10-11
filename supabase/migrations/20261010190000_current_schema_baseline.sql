-- Executable baseline for the current DormDeal schema supplied to the
-- recommendation implementation. Existing remote tables are left in place.

create table if not exists public."app-users" (
  user_id bigint generated always as identity primary key,
  name character varying,
  email character varying,
  trust_score numeric,
  created_at timestamp without time zone default now()
);

create table if not exists public.listings (
  listing_id bigint generated always as identity primary key,
  seller_id bigint not null references public."app-users"(user_id),
  title character varying,
  description text,
  price numeric,
  category character varying,
  status character varying,
  created_at timestamp without time zone default now()
);

create table if not exists public.listing_images (
  image_id bigint generated always as identity primary key,
  listing_id bigint not null references public.listings(listing_id),
  image_url character varying
);

create table if not exists public.conversations (
  conversation_id bigint generated always as identity primary key,
  listing_id bigint not null references public.listings(listing_id),
  buyer_id bigint not null references public."app-users"(user_id),
  seller_id bigint not null references public."app-users"(user_id),
  last_message_at timestamp without time zone,
  created_at timestamp without time zone default now()
);

create table if not exists public.messages (
  message_id bigint generated always as identity primary key,
  conversation_id bigint not null references public.conversations(conversation_id),
  sender_id bigint not null references public."app-users"(user_id),
  content text,
  proposed_meetup_time timestamp without time zone,
  proposed_meetup_location character varying,
  sent_at timestamp without time zone default now()
);

create table if not exists public.conversation_pins (
  pin_id bigint generated always as identity primary key,
  user_id bigint not null references public."app-users"(user_id),
  conversation_id bigint not null references public.conversations(conversation_id),
  pinned_at timestamp without time zone default now()
);

create table if not exists public.activities (
  activity_id bigint generated always as identity primary key,
  recipient_id bigint not null references public."app-users"(user_id),
  actor_id bigint not null references public."app-users"(user_id),
  type character varying,
  listing_id bigint references public.listings(listing_id),
  conversation_id bigint references public.conversations(conversation_id),
  is_read boolean default false,
  created_at timestamp without time zone default now()
);

create table if not exists public.reviews (
  review_id bigint generated always as identity primary key,
  reviewer_id bigint not null references public."app-users"(user_id),
  reviewee_id bigint not null references public."app-users"(user_id),
  rating integer,
  comment text,
  created_at timestamp without time zone default now()
);
