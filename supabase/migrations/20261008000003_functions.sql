-- Business logic ported from the NestJS services into SQL functions (called with supabase.rpc).
-- Write paths are security definer and check auth.uid() themselves; read helpers are security invoker so RLS applies.

-- ---------------------------------------------------------------------------
-- create_tournament: tournaments.service.ts#create + generateLeague.ts + generateCup.ts
-- p_teams = [{ "playerName": "...", "teamName": "...", "logoUrl": "..." }, ...]
-- ---------------------------------------------------------------------------
create function public.create_tournament(
  p_name text,
  p_type smallint,
  p_sport smallint,
  p_teams jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_tid bigint;
  v_n int;
  v_k int;
  v_tmp int;
  v_item jsonb;
  v_team_id bigint;
  v_team_ids bigint[] := '{}';
  v_shuffled bigint[];
  v_cur_ids bigint[];
  v_next_ids bigint[] := '{}';
  v_game_id bigint;
  v_count int;
  i int;
  j int;
  r int;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;
  if p_name is null or char_length(trim(p_name)) = 0 then
    raise exception 'Tournament name is required';
  end if;
  if p_type is null or p_type not in (1, 2) then
    raise exception 'Invalid tournament type';
  end if;
  if p_sport is null or p_sport not in (1, 2) then
    raise exception 'Invalid sport';
  end if;
  if p_teams is null or jsonb_typeof(p_teams) <> 'array' then
    raise exception 'Teams must be an array';
  end if;

  v_n := jsonb_array_length(p_teams);
  if p_type = 1 and (v_n < 2 or v_n > 32) then
    raise exception 'A league needs between 2 and 32 players';
  end if;
  if p_type = 2 and v_n not in (4, 8, 16) then
    raise exception 'A knockout needs 4, 8 or 16 teams';
  end if;

  for v_item in select value from jsonb_array_elements(p_teams) loop
    if coalesce(trim(v_item ->> 'playerName'), '') = '' or coalesce(trim(v_item ->> 'teamName'), '') = '' then
      raise exception 'Every team needs a player name and a team name';
    end if;
  end loop;

  insert into public.tournaments (name, type, sport, admin_id)
  values (trim(p_name), p_type, p_sport, v_uid)
  returning id into v_tid;

  for v_item in select value from jsonb_array_elements(p_teams) with ordinality as t(value, ord) order by ord loop
    insert into public.teams (tournament_id, user_name, team_name, logo_url)
    values (
      v_tid,
      trim(v_item ->> 'playerName'),
      trim(v_item ->> 'teamName'),
      nullif(trim(coalesce(v_item ->> 'logoUrl', '')), '')
    )
    returning id into v_team_id;
    v_team_ids := v_team_ids || v_team_id;
  end loop;

  if p_type = 1 then
    -- League: every pair plays twice (home and away).
    for i in 1 .. v_n loop
      for j in i + 1 .. v_n loop
        insert into public.games (tournament_id, team1_id, team2_id)
        values (v_tid, v_team_ids[i], v_team_ids[j]);
        insert into public.games (tournament_id, team1_id, team2_id)
        values (v_tid, v_team_ids[j], v_team_ids[i]);
      end loop;
    end loop;
  else
    -- Knockout: shuffle, then build the bracket from the final backwards.
    select array_agg(x order by random()) into v_shuffled from unnest(v_team_ids) as x;

    v_k := 0;
    v_tmp := v_n;
    while v_tmp > 1 loop
      v_tmp := v_tmp / 2;
      v_k := v_k + 1;
    end loop;

    for r in reverse v_k .. 1 loop
      v_count := 1 << (v_k - r);
      v_cur_ids := '{}';
      for i in 0 .. v_count - 1 loop
        insert into public.games (
          tournament_id, round_text, team1_id, team2_id, next_match_id, next_match_place
        )
        values (
          v_tid,
          r::text,
          case when r = 1 then v_shuffled[i + 1] end,
          case when r = 1 then v_shuffled[i + 1 + v_n / 2] end,
          case when r = v_k then null else v_next_ids[(i / 2) + 1] end,
          case when r = v_k then null when i % 2 = 0 then 'home' else 'away' end
        )
        returning id into v_game_id;
        v_cur_ids := v_cur_ids || v_game_id;
      end loop;
      v_next_ids := v_cur_ids;
    end loop;
  end if;

  return v_tid;
end;
$$;

-- ---------------------------------------------------------------------------
-- save_game_result: games.service.ts#update (+ no ties for knockout and for MLB)
-- ---------------------------------------------------------------------------
create function public.save_game_result(
  p_game_id bigint,
  p_score1 integer,
  p_score2 integer
)
returns public.games
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_game public.games;
  v_tournament public.tournaments;
  v_next public.games;
  v_winner bigint;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select * into v_game from public.games where id = p_game_id for update;
  if not found then
    raise exception 'Game not found';
  end if;

  if not public.can_manage_tournament(v_game.tournament_id) then
    raise exception 'You are not allowed to edit this tournament' using errcode = '42501';
  end if;

  select * into v_tournament from public.tournaments where id = v_game.tournament_id;

  if v_game.team1_id is null or v_game.team2_id is null then
    raise exception 'Both teams must be defined before saving a result';
  end if;
  if p_score1 is null or p_score2 is null or p_score1 < 0 or p_score2 < 0 then
    raise exception 'Scores must be zero or greater';
  end if;
  if p_score1 = p_score2 and (v_tournament.type = 2 or v_tournament.sport = 2) then
    raise exception 'This game cannot end in a tie';
  end if;

  if v_game.next_match_id is not null then
    select * into v_next from public.games where id = v_game.next_match_id for update;
    if not found then
      raise exception 'Next Match not found';
    end if;
    if v_next.score1 is not null or v_next.score2 is not null then
      raise exception 'Next Match has already been played';
    end if;

    v_winner := case when p_score1 > p_score2 then v_game.team1_id else v_game.team2_id end;

    if v_game.next_match_place = 'home' then
      update public.games set team1_id = v_winner where id = v_next.id;
    elsif v_game.next_match_place = 'away' then
      update public.games set team2_id = v_winner where id = v_next.id;
    end if;
  end if;

  update public.games
  set score1 = p_score1, score2 = p_score2
  where id = p_game_id
  returning * into v_game;

  return v_game;
end;
$$;

-- ---------------------------------------------------------------------------
-- get_tournament_standings: getTournamentStandings.ts
-- 3 points per win, 1 per draw. Sorted by points then scored. Last 5 results newest first.
-- ---------------------------------------------------------------------------
create function public.get_tournament_standings(p_tournament_id bigint)
returns table (
  ranking integer,
  team_id bigint,
  user_name text,
  team_name text,
  logo_url text,
  games_played integer,
  wins integer,
  draws integer,
  losses integer,
  goals_scored integer,
  goals_conceded integer,
  points integer,
  last_five jsonb
)
language sql
stable
set search_path = ''
as $$
  with results as (
    select g.id as game_id, g.team1_id as tid, g.score1 as gf, g.score2 as ga, g.updated_at
    from public.games g
    where g.tournament_id = p_tournament_id
      and g.team1_id is not null and g.score1 is not null and g.score2 is not null
    union all
    select g.id, g.team2_id, g.score2, g.score1, g.updated_at
    from public.games g
    where g.tournament_id = p_tournament_id
      and g.team2_id is not null and g.score1 is not null and g.score2 is not null
  ),
  scored as (
    select
      r.*,
      case when r.gf > r.ga then 3 when r.gf = r.ga then 1 else 0 end as pts,
      case when r.gf > r.ga then 'W' when r.gf = r.ga then 'D' else 'L' end as res
    from results r
  ),
  agg as (
    select
      s.tid,
      count(*)::int as gp,
      (count(*) filter (where s.pts = 3))::int as w,
      (count(*) filter (where s.pts = 1))::int as d,
      (count(*) filter (where s.pts = 0))::int as l,
      sum(s.gf)::int as gs,
      sum(s.ga)::int as gc,
      sum(s.pts)::int as pt
    from scored s
    group by s.tid
  ),
  last5 as (
    select
      x.tid,
      jsonb_agg(
        jsonb_build_object('value', x.res, 'playedAt', x.updated_at)
        order by x.updated_at desc, x.game_id desc
      ) as arr
    from (
      select s.*, row_number() over (partition by s.tid order by s.updated_at desc, s.game_id desc) as rn
      from scored s
    ) x
    where x.rn <= 5
    group by x.tid
  )
  select
    (row_number() over (
      order by coalesce(a.pt, 0) desc, coalesce(a.gs, 0) desc, t.id
    ))::int as ranking,
    t.id as team_id,
    t.user_name,
    t.team_name,
    t.logo_url,
    coalesce(a.gp, 0) as games_played,
    coalesce(a.w, 0) as wins,
    coalesce(a.d, 0) as draws,
    coalesce(a.l, 0) as losses,
    coalesce(a.gs, 0) as goals_scored,
    coalesce(a.gc, 0) as goals_conceded,
    coalesce(a.pt, 0) as points,
    coalesce(l5.arr, '[]'::jsonb) as last_five
  from public.teams t
  left join agg a on a.tid = t.id
  left join last5 l5 on l5.tid = t.id
  where t.tournament_id = p_tournament_id
  order by ranking;
$$;

-- ---------------------------------------------------------------------------
-- get_my_tournaments: tournaments.service.ts#findAllWithAdmin (camelCase keys, same shape as before)
-- ---------------------------------------------------------------------------
create function public.get_my_tournaments()
returns jsonb
language sql
stable
set search_path = ''
as $$
  select coalesce(jsonb_agg(x.item order by x.created_at desc), '[]'::jsonb)
  from (
    select
      t.created_at,
      jsonb_build_object(
        'id', t.id,
        'tournamentName', t.name,
        'type', t.type,
        'sport', t.sport,
        'uniqueId', t.unique_id,
        'adminId', t.admin_id,
        'createdAt', t.created_at,
        'sharedAdmins', coalesce((
          select jsonb_agg(m.user_id) from public.tournament_members m
          where m.tournament_id = t.id and m.role = 'shared_admin'
        ), '[]'::jsonb),
        'sharedGuests', coalesce((
          select jsonb_agg(m.user_id) from public.tournament_members m
          where m.tournament_id = t.id and m.role = 'guest'
        ), '[]'::jsonb),
        'teams', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id', tm.id,
              'userName', tm.user_name,
              'teamName', tm.team_name,
              'logoUrl', tm.logo_url
            ) order by tm.id
          )
          from public.teams tm where tm.tournament_id = t.id
        ), '[]'::jsonb),
        'gamesTotal', gc.total,
        'gamesPlayed', gc.played,
        'status', case
          when gc.total > 0 and gc.total = gc.played then (
            select s.user_name from public.get_tournament_standings(t.id) s order by s.ranking limit 1
          )
          else 'In progress.......'
        end
      ) as item
    from public.tournaments t
    cross join lateral (
      select
        count(*)::int as total,
        (count(*) filter (where g.score1 is not null and g.score2 is not null))::int as played
      from public.games g where g.tournament_id = t.id
    ) gc
  ) x;
$$;

-- ---------------------------------------------------------------------------
-- invites: replaces generateJWT / join (token is now a uuid, valid 1 day like the old JWT)
-- ---------------------------------------------------------------------------
create function public.create_tournament_invite(p_unique_id uuid, p_access_type text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_tid bigint;
  v_token uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;
  if p_access_type is null or p_access_type not in ('shared_admin', 'guest') then
    raise exception 'Invalid access type.';
  end if;

  select id into v_tid from public.tournaments where unique_id = p_unique_id;
  if v_tid is null then
    raise exception 'Tournament not found.';
  end if;
  if not public.can_manage_tournament(v_tid) then
    raise exception 'You are not allowed to share this tournament' using errcode = '42501';
  end if;

  insert into public.tournament_invites (tournament_id, access_type, created_by)
  values (v_tid, p_access_type, v_uid)
  returning token into v_token;

  return v_token;
end;
$$;

create function public.join_tournament(p_token uuid)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_invite public.tournament_invites;
  v_tournament public.tournaments;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select * into v_invite from public.tournament_invites where token = p_token;
  if not found or v_invite.expires_at < now() then
    raise exception 'Invalid or expired invitation.';
  end if;

  select * into v_tournament from public.tournaments where id = v_invite.tournament_id;
  if not found then
    raise exception 'Tournament not found.';
  end if;
  if v_tournament.admin_id = v_uid then
    raise exception 'You cannot join your own tournament.';
  end if;
  if exists (
    select 1 from public.tournament_members m
    where m.tournament_id = v_tournament.id and m.user_id = v_uid
  ) then
    raise exception 'You are already part of this tournament.';
  end if;

  insert into public.tournament_members (tournament_id, user_id, role)
  values (v_tournament.id, v_uid, v_invite.access_type);

  return v_tournament.id;
end;
$$;

-- ---------------------------------------------------------------------------
-- friends: notifications.service.ts#create and friends.service.ts#approveFriendRequest
-- ---------------------------------------------------------------------------
create function public.send_friend_request(p_nickname text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_receiver uuid;
  v_request_id bigint;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select id into v_receiver from public.profiles where nickname = lower(trim(p_nickname));
  if v_receiver is null then
    return jsonb_build_object('ok', false, 'msg', 'Nickname not found');
  end if;
  if v_receiver = v_uid then
    return jsonb_build_object('ok', false, 'msg', 'You cannot add yourself');
  end if;
  if exists (select 1 from public.friendships where user_id = v_uid and friend_id = v_receiver) then
    return jsonb_build_object('ok', false, 'msg', 'You are already friends');
  end if;
  if exists (
    select 1 from public.friend_requests
    where (creator_id = v_uid and receiver_id = v_receiver)
       or (creator_id = v_receiver and receiver_id = v_uid)
  ) then
    return jsonb_build_object('ok', false, 'msg', 'You already have a pending friend request');
  end if;

  insert into public.friend_requests (creator_id, receiver_id)
  values (v_uid, v_receiver)
  returning id into v_request_id;

  insert into public.notifications (receiver_id, sender_id, type, friend_request_id)
  values (v_receiver, v_uid, 'friend_request', v_request_id);

  return jsonb_build_object('ok', true, 'msg', 'Request sent successfully');
end;
$$;

create function public.accept_friend_request(p_request_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_request public.friend_requests;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select * into v_request
  from public.friend_requests
  where id = p_request_id and receiver_id = v_uid
  for update;
  if not found then
    raise exception 'Request not found';
  end if;

  insert into public.friendships (user_id, friend_id)
  values (v_request.creator_id, v_request.receiver_id), (v_request.receiver_id, v_request.creator_id)
  on conflict do nothing;

  -- cascades to the notification
  delete from public.friend_requests where id = v_request.id;
end;
$$;

-- ---------------------------------------------------------------------------
-- execute privileges: authenticated only
-- ---------------------------------------------------------------------------
revoke all on function public.create_tournament(text, smallint, smallint, jsonb) from public, anon;
revoke all on function public.save_game_result(bigint, integer, integer) from public, anon;
revoke all on function public.get_tournament_standings(bigint) from public, anon;
revoke all on function public.get_my_tournaments() from public, anon;
revoke all on function public.create_tournament_invite(uuid, text) from public, anon;
revoke all on function public.join_tournament(uuid) from public, anon;
revoke all on function public.send_friend_request(text) from public, anon;
revoke all on function public.accept_friend_request(bigint) from public, anon;

grant execute on function public.create_tournament(text, smallint, smallint, jsonb) to authenticated;
grant execute on function public.save_game_result(bigint, integer, integer) to authenticated;
grant execute on function public.get_tournament_standings(bigint) to authenticated;
grant execute on function public.get_my_tournaments() to authenticated;
grant execute on function public.create_tournament_invite(uuid, text) to authenticated;
grant execute on function public.join_tournament(uuid) to authenticated;
grant execute on function public.send_friend_request(text) to authenticated;
grant execute on function public.accept_friend_request(bigint) to authenticated;
