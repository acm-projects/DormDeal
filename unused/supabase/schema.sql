-- Run this file once in Supabase Dashboard > SQL Editor.
-- Passwords are hashed inside Postgres and the underlying tables are not
-- directly readable through the public API.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  username text not null check (username ~ '^[A-Za-z0-9_]{3,30}$'),
  password_hash text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists app_users_username_lower_idx
  on public.app_users (lower(username));

create table if not exists public.app_sessions (
  token uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

alter table public.app_users enable row level security;
alter table public.app_sessions enable row level security;

revoke all on public.app_users from anon, authenticated;
revoke all on public.app_sessions from anon, authenticated;

create or replace function public.register_user(p_username text, p_password text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  clean_username text := trim(p_username);
begin
  if clean_username !~ '^[A-Za-z0-9_]{3,30}$' then
    raise exception 'Username must be 3–30 characters and use only letters, numbers, or underscores.';
  end if;

  if length(p_password) < 8 then
    raise exception 'Password must be at least 8 characters.';
  end if;

  insert into public.app_users (username, password_hash)
  values (clean_username, crypt(p_password, gen_salt('bf')));
exception
  when unique_violation then
    raise exception 'Username is already taken.';
end;
$$;

create or replace function public.login_user(p_username text, p_password text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  matched_user public.app_users%rowtype;
  session_token uuid;
begin
  select * into matched_user
  from public.app_users
  where lower(username) = lower(trim(p_username));

  if matched_user.id is null
    or matched_user.password_hash <> crypt(p_password, matched_user.password_hash) then
    raise exception 'Invalid username or password.';
  end if;

  delete from public.app_sessions
  where expires_at <= now();

  insert into public.app_sessions (user_id)
  values (matched_user.id)
  returning token into session_token;

  return session_token;
end;
$$;

create or replace function public.validate_session(p_token uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.app_sessions
    where token = p_token and expires_at > now()
  );
$$;

revoke all on function public.register_user(text, text) from public;
revoke all on function public.login_user(text, text) from public;
revoke all on function public.validate_session(uuid) from public;

grant execute on function public.register_user(text, text) to anon, authenticated;
grant execute on function public.login_user(text, text) to anon, authenticated;
grant execute on function public.validate_session(uuid) to anon, authenticated;
