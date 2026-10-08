-- Core schema for TourneyForge (replaces the NestJS + TypeORM entities).
-- Every table has RLS enabled right away; policies and grants live in the next migration.

create type public.notification_type as enum (
  'friend_request',
  'tournament_request',
  'invitation_tournament'
);

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 1 and 100),
  nickname text not null unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ---------------------------------------------------------------------------
-- tournaments, members, invites, teams, games
-- ---------------------------------------------------------------------------
create table public.tournaments (
  id bigint generated always as identity primary key,
  name text not null check (char_length(trim(name)) > 0),
  type smallint not null check (type in (1, 2)),   -- 1 = League, 2 = Knockout
  sport smallint not null check (sport in (1, 2)), -- 1 = FIFA, 2 = MLB The Show
  unique_id uuid not null unique default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index tournaments_admin_id_idx on public.tournaments (admin_id);
alter table public.tournaments enable row level security;

create table public.tournament_members (
  tournament_id bigint not null references public.tournaments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('shared_admin', 'guest')),
  created_at timestamptz not null default now(),
  primary key (tournament_id, user_id)
);
create index tournament_members_user_id_idx on public.tournament_members (user_id);
alter table public.tournament_members enable row level security;

create table public.tournament_invites (
  token uuid primary key default gen_random_uuid(),
  tournament_id bigint not null references public.tournaments (id) on delete cascade,
  access_type text not null check (access_type in ('shared_admin', 'guest')),
  created_by uuid not null references public.profiles (id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '1 day'),
  created_at timestamptz not null default now()
);
create index tournament_invites_tournament_id_idx on public.tournament_invites (tournament_id);
alter table public.tournament_invites enable row level security;

create table public.teams (
  id bigint generated always as identity primary key,
  tournament_id bigint not null references public.tournaments (id) on delete cascade,
  user_name text not null,
  team_name text not null,
  logo_url text,
  created_at timestamptz not null default now()
);
create index teams_tournament_id_idx on public.teams (tournament_id);
alter table public.teams enable row level security;

create table public.games (
  id bigint generated always as identity primary key,
  tournament_id bigint not null references public.tournaments (id) on delete cascade,
  team1_id bigint references public.teams (id) on delete cascade,
  team2_id bigint references public.teams (id) on delete cascade,
  score1 integer check (score1 >= 0),
  score2 integer check (score2 >= 0),
  next_match_id bigint references public.games (id) on delete set null,
  next_match_place text check (next_match_place in ('home', 'away')),
  round_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index games_tournament_id_idx on public.games (tournament_id);
create index games_team1_id_idx on public.games (team1_id);
create index games_team2_id_idx on public.games (team2_id);
create index games_next_match_id_idx on public.games (next_match_id);
alter table public.games enable row level security;

-- ---------------------------------------------------------------------------
-- friends and notifications
-- ---------------------------------------------------------------------------
create table public.friend_requests (
  id bigint generated always as identity primary key,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint friend_requests_not_self check (creator_id <> receiver_id),
  constraint friend_requests_unique_pair unique (creator_id, receiver_id)
);
create index friend_requests_receiver_id_idx on public.friend_requests (receiver_id);
alter table public.friend_requests enable row level security;

-- Two rows per friendship (a -> b and b -> a), like TypeORM's users_friends_users.
create table public.friendships (
  user_id uuid not null references public.profiles (id) on delete cascade,
  friend_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  constraint friendships_not_self check (user_id <> friend_id)
);
create index friendships_friend_id_idx on public.friendships (friend_id);
alter table public.friendships enable row level security;

create table public.notifications (
  id bigint generated always as identity primary key,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  read boolean not null default false,
  friend_request_id bigint references public.friend_requests (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index notifications_receiver_idx on public.notifications (receiver_id, created_at desc);
create index notifications_sender_id_idx on public.notifications (sender_id);
create index notifications_friend_request_id_idx on public.notifications (friend_request_id);
alter table public.notifications enable row level security;

-- ---------------------------------------------------------------------------
-- triggers
-- ---------------------------------------------------------------------------

-- Creates the profile (with unique nickname and default avatar) for every new auth user.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
  v_base text;
  v_nick text;
  v_avatar text;
  v_tries int := 0;
begin
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'player'
  );
  v_name := left(v_name, 100);

  v_base := lower(regexp_replace(v_name, '\s+', '', 'g'));

  loop
    v_nick := v_base || (floor(random() * 9000) + 1000)::int::text;
    exit when not exists (select 1 from public.profiles where nickname = v_nick);
    v_tries := v_tries + 1;
    if v_tries > 100 then
      raise exception 'Could not generate a unique nickname';
    end if;
  end loop;

  v_avatar := coalesce(
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_user_meta_data ->> 'picture', ''),
    'https://ui-avatars.com/api/?name='
      || replace(coalesce(nullif(regexp_replace(v_name, '[^A-Za-z0-9 ]', '', 'g'), ''), 'P'), ' ', '+')
      || '&background=0D8ABC&color=fff&size=128&font-size=0.33&rounded=true&bold=true'
  );

  insert into public.profiles (id, full_name, nickname, avatar_url)
  values (new.id, v_name, v_nick, v_avatar);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users that already exist in auth.users (signed up before this migration) get a profile too.
do $$
declare
  u record;
  v_name text;
  v_base text;
  v_nick text;
begin
  for u in select id, email, raw_user_meta_data from auth.users loop
    v_name := left(coalesce(
      nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
      'player'
    ), 100);
    v_base := lower(regexp_replace(v_name, '\s+', '', 'g'));
    loop
      v_nick := v_base || (floor(random() * 9000) + 1000)::int::text;
      exit when not exists (select 1 from public.profiles where nickname = v_nick);
    end loop;
    insert into public.profiles (id, full_name, nickname, avatar_url)
    values (
      u.id,
      v_name,
      v_nick,
      coalesce(
        nullif(u.raw_user_meta_data ->> 'avatar_url', ''),
        nullif(u.raw_user_meta_data ->> 'picture', ''),
        'https://ui-avatars.com/api/?name='
          || replace(coalesce(nullif(regexp_replace(v_name, '[^A-Za-z0-9 ]', '', 'g'), ''), 'P'), ' ', '+')
          || '&background=0D8ABC&color=fff&size=128&font-size=0.33&rounded=true&bold=true'
      )
    )
    on conflict (id) do nothing;
  end loop;
end;
$$;

-- Clients can only change full_name / avatar_url. The nickname follows full_name and keeps its 4 digit suffix.
create function public.profiles_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.id := old.id;
  new.created_at := old.created_at;
  new.updated_at := now();

  if new.full_name is distinct from old.full_name then
    new.nickname := lower(regexp_replace(new.full_name, '\s+', '', 'g')) || right(old.nickname, 4);
  else
    new.nickname := old.nickname;
  end if;

  return new;
end;
$$;

create trigger profiles_before_update
  before update on public.profiles
  for each row execute function public.profiles_before_update();

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger games_set_updated_at
  before update on public.games
  for each row execute function public.set_updated_at();

-- Declining a friend request notification also removes the pending request.
create function public.notifications_after_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.friend_request_id is not null then
    delete from public.friend_requests where id = old.friend_request_id;
  end if;
  return old;
end;
$$;

create trigger notifications_after_delete
  after delete on public.notifications
  for each row execute function public.notifications_after_delete();

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.profiles_before_update() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.notifications_after_delete() from public, anon, authenticated;
