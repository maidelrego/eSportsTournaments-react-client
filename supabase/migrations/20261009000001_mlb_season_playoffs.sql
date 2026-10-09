-- MLB The Show "Season + Playoffs" (tournament type 3):
--   regular season = single round robin (every pair plays once, any number of players >= 3)
--   playoffs       = seeded wild card style bracket with byes, best-of-N series (1/3/5/7)
-- Classic leagues (type 1) and knockouts (type 2) are untouched: games.series_id is null for them.

-- ---------------------------------------------------------------------------
-- schema
-- ---------------------------------------------------------------------------
alter table public.tournaments drop constraint tournaments_type_check;
alter table public.tournaments add constraint tournaments_type_check check (type in (1, 2, 3));

alter table public.tournaments
  add column playoff_teams smallint,
  add column best_of smallint;

alter table public.tournaments add constraint tournaments_season_options check (
  type <> 3 or (sport = 2 and playoff_teams >= 2 and best_of in (1, 3, 5, 7))
);

-- One row per playoff matchup. team1 is always the higher seed.
create table public.playoff_series (
  id bigint generated always as identity primary key,
  tournament_id bigint not null references public.tournaments (id) on delete cascade,
  round smallint not null check (round >= 1),   -- 1 = first round, highest = final
  slot smallint not null check (slot >= 0),     -- position inside the round
  best_of smallint not null check (best_of in (1, 3, 5, 7)),
  team1_id bigint references public.teams (id) on delete cascade,
  team2_id bigint references public.teams (id) on delete cascade,
  seed1 smallint,
  seed2 smallint,
  wins1 smallint not null default 0,
  wins2 smallint not null default 0,
  winner_id bigint references public.teams (id) on delete set null,
  next_series_id bigint references public.playoff_series (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (tournament_id, round, slot)
);
create index playoff_series_tournament_id_idx on public.playoff_series (tournament_id);
create index playoff_series_team1_id_idx on public.playoff_series (team1_id);
create index playoff_series_team2_id_idx on public.playoff_series (team2_id);
create index playoff_series_winner_id_idx on public.playoff_series (winner_id);
create index playoff_series_next_series_id_idx on public.playoff_series (next_series_id);
alter table public.playoff_series enable row level security;

alter table public.games
  add column series_id bigint references public.playoff_series (id) on delete cascade,
  add column game_number smallint;
create index games_series_id_idx on public.games (series_id);

revoke all on table public.playoff_series from anon, authenticated;
grant select on table public.playoff_series to authenticated;

create policy playoff_series_select on public.playoff_series
  for select to authenticated
  using (public.is_tournament_member(tournament_id));

-- ---------------------------------------------------------------------------
-- small helpers
-- ---------------------------------------------------------------------------

-- Default number of playoff teams for N players (the client mirrors this table for its form default).
create function public.default_playoff_teams(p_players integer)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when p_players <= 3 then 2
    when p_players <= 5 then 4
    when p_players <= 8 then 5
    else 6
  end;
$$;

-- Does the higher seed (series team1) host this game? bo3 all at the higher seed, bo5 2-2-1, bo7 2-3-2.
create function public.series_higher_seed_hosts(p_best_of integer, p_game_number integer)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case p_best_of
    when 5 then p_game_number in (1, 2, 5)
    when 7 then p_game_number in (1, 2, 6, 7)
    else true
  end;
$$;

-- Internal: adds the next game (n+1) to a series whose two teams are known.
create function public.create_series_game(p_series_id bigint)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_series public.playoff_series;
  v_n integer;
  v_higher_hosts boolean;
  v_id bigint;
begin
  select * into v_series from public.playoff_series where id = p_series_id;
  if v_series.team1_id is null or v_series.team2_id is null then
    raise exception 'Both teams of the series must be known';
  end if;

  select coalesce(max(game_number), 0) + 1 into v_n from public.games where series_id = p_series_id;
  v_higher_hosts := public.series_higher_seed_hosts(v_series.best_of, v_n);

  insert into public.games (tournament_id, series_id, game_number, team1_id, team2_id, round_text)
  values (
    v_series.tournament_id,
    p_series_id,
    v_n,
    case when v_higher_hosts then v_series.team1_id else v_series.team2_id end,
    case when v_higher_hosts then v_series.team2_id else v_series.team1_id end,
    v_series.round::text
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- Internal: after a team is placed in a series, put the better seed first and open game 1.
create function public.open_series_if_ready(p_series_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_series public.playoff_series;
begin
  select * into v_series from public.playoff_series where id = p_series_id for update;
  if v_series.team1_id is null or v_series.team2_id is null then
    return;
  end if;

  if v_series.seed1 > v_series.seed2 then
    update public.playoff_series
    set team1_id = team2_id, team2_id = team1_id, seed1 = seed2, seed2 = seed1
    where id = p_series_id;
  end if;

  if not exists (select 1 from public.games where series_id = p_series_id) then
    perform public.create_series_game(p_series_id);
  end if;
end;
$$;

revoke all on function public.create_series_game(bigint) from public, anon, authenticated;
revoke all on function public.open_series_if_ready(bigint) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- create_tournament: adds type 3 (and the two optional playoff settings)
-- ---------------------------------------------------------------------------
drop function public.create_tournament(text, smallint, smallint, jsonb);

create function public.create_tournament(
  p_name text,
  p_type smallint,
  p_sport smallint,
  p_teams jsonb,
  p_playoff_teams smallint default null,
  p_best_of smallint default null
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
  v_playoff_teams smallint := null;
  v_best_of smallint := null;
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
  if p_type is null or p_type not in (1, 2, 3) then
    raise exception 'Invalid tournament type';
  end if;
  if p_sport is null or p_sport not in (1, 2) then
    raise exception 'Invalid sport';
  end if;
  if p_type = 3 and p_sport <> 2 then
    raise exception 'Season + Playoffs is only available for MLB The Show';
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
  if p_type = 3 then
    if v_n < 3 or v_n > 32 then
      raise exception 'A season needs between 3 and 32 players';
    end if;
    v_playoff_teams := coalesce(p_playoff_teams, public.default_playoff_teams(v_n)::smallint);
    v_best_of := coalesce(p_best_of, 3::smallint);
    if v_playoff_teams < 2 or v_playoff_teams > v_n then
      raise exception 'Playoff teams must be between 2 and the number of players';
    end if;
    if v_best_of not in (1, 3, 5, 7) then
      raise exception 'Series length must be 1, 3, 5 or 7';
    end if;
  end if;

  for v_item in select value from jsonb_array_elements(p_teams) loop
    if coalesce(trim(v_item ->> 'playerName'), '') = '' or coalesce(trim(v_item ->> 'teamName'), '') = '' then
      raise exception 'Every team needs a player name and a team name';
    end if;
  end loop;

  insert into public.tournaments (name, type, sport, admin_id, playoff_teams, best_of)
  values (trim(p_name), p_type, p_sport, v_uid, v_playoff_teams, v_best_of)
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
  elsif p_type = 3 then
    -- Season: every pair plays once. Home alternates with the parity of i + j to stay balanced.
    for i in 1 .. v_n loop
      for j in i + 1 .. v_n loop
        if (i + j) % 2 = 0 then
          insert into public.games (tournament_id, team1_id, team2_id)
          values (v_tid, v_team_ids[i], v_team_ids[j]);
        else
          insert into public.games (tournament_id, team1_id, team2_id)
          values (v_tid, v_team_ids[j], v_team_ids[i]);
        end if;
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
-- get_tournament_standings: regular games only, MLB tie-break by run differential, playoff seed
-- ---------------------------------------------------------------------------
drop function public.get_tournament_standings(bigint);

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
  last_five jsonb,
  playoff_seed integer
)
language sql
stable
set search_path = ''
as $$
  with tour as (
    select t.sport, t.type, t.playoff_teams from public.tournaments t where t.id = p_tournament_id
  ),
  results as (
    select g.id as game_id, g.team1_id as tid, g.score1 as gf, g.score2 as ga, g.updated_at
    from public.games g
    where g.tournament_id = p_tournament_id and g.series_id is null
      and g.team1_id is not null and g.score1 is not null and g.score2 is not null
    union all
    select g.id, g.team2_id, g.score2, g.score1, g.updated_at
    from public.games g
    where g.tournament_id = p_tournament_id and g.series_id is null
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
  ),
  ranked as (
    select
      (row_number() over (
        order by
          coalesce(a.pt, 0) desc,
          case when tour.sport = 2 then coalesce(a.gs, 0) - coalesce(a.gc, 0) end desc nulls last,
          coalesce(a.gs, 0) desc,
          t.id
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
      coalesce(l5.arr, '[]'::jsonb) as last_five,
      tour.type as tournament_type,
      tour.playoff_teams
    from public.teams t
    cross join tour
    left join agg a on a.tid = t.id
    left join last5 l5 on l5.tid = t.id
    where t.tournament_id = p_tournament_id
  )
  select
    k.ranking,
    k.team_id,
    k.user_name,
    k.team_name,
    k.logo_url,
    k.games_played,
    k.wins,
    k.draws,
    k.losses,
    k.goals_scored,
    k.goals_conceded,
    k.points,
    k.last_five,
    case when k.tournament_type = 3 and k.ranking <= k.playoff_teams then k.ranking end as playoff_seed
  from ranked k
  order by k.ranking;
$$;

-- ---------------------------------------------------------------------------
-- get_my_tournaments: adds playoffTeams / bestOf and the champion for seasons
-- ---------------------------------------------------------------------------
create or replace function public.get_my_tournaments()
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
        'playoffTeams', t.playoff_teams,
        'bestOf', t.best_of,
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
          when t.type = 3 then coalesce((
            select tm.user_name
            from public.playoff_series s
            join public.teams tm on tm.id = s.winner_id
            where s.tournament_id = t.id and s.next_series_id is null
          ), 'In progress.......')
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
-- start_playoffs: seeds the bracket from the final standings
-- ---------------------------------------------------------------------------
create function public.start_playoffs(p_tournament_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_t public.tournaments;
  v_p int;
  v_seeds bigint[];
  v_s int := 1;
  v_k int := 0;
  v_order int[] := array[1];
  v_new int[];
  v_len int;
  x int;
  r int;
  q int;
  v_count int;
  v_a int;
  v_b int;
  v_sid bigint;
  v_cur_ids bigint[];
  v_next_ids bigint[] := '{}';
  v_target bigint;
  v_row record;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select * into v_t from public.tournaments where id = p_tournament_id for update;
  if not found then
    raise exception 'Tournament not found';
  end if;
  if not public.can_manage_tournament(p_tournament_id) then
    raise exception 'You are not allowed to start the playoffs' using errcode = '42501';
  end if;
  if v_t.type <> 3 then
    raise exception 'This tournament has no playoffs';
  end if;
  if exists (select 1 from public.playoff_series where tournament_id = p_tournament_id) then
    raise exception 'The playoffs have already started';
  end if;
  if exists (
    select 1 from public.games
    where tournament_id = p_tournament_id and series_id is null and (score1 is null or score2 is null)
  ) then
    raise exception 'Finish the regular season first';
  end if;

  v_p := v_t.playoff_teams;
  select array_agg(s.team_id order by s.ranking) into v_seeds
  from public.get_tournament_standings(p_tournament_id) s
  where s.ranking <= v_p;
  if coalesce(array_length(v_seeds, 1), 0) < 2 then
    raise exception 'Not enough teams for the playoffs';
  end if;
  v_p := array_length(v_seeds, 1);

  -- S = next power of two >= P, k = number of rounds
  while v_s < v_p loop
    v_s := v_s * 2;
    v_k := v_k + 1;
  end loop;

  -- standard seeded order: S=8 -> 1,8,4,5,2,7,3,6 (adjacent entries meet in round 1)
  while array_length(v_order, 1) < v_s loop
    v_len := array_length(v_order, 1);
    v_new := '{}';
    foreach x in array v_order loop
      v_new := v_new || x || (2 * v_len + 1 - x);
    end loop;
    v_order := v_new;
  end loop;

  -- build the series from the final backwards; round 1 slots without an opponent are byes
  for r in reverse v_k .. 1 loop
    v_count := v_s / (1 << r);
    v_cur_ids := '{}';
    for q in 0 .. v_count - 1 loop
      v_target := case when r = v_k then null else v_next_ids[(q / 2) + 1] end;

      if r = 1 then
        v_a := v_order[2 * q + 1];
        v_b := v_order[2 * q + 2];
        if v_b > v_p then
          -- bye: seed a goes straight to the next round
          v_sid := null;
          update public.playoff_series
          set team1_id = case when team1_id is null then v_seeds[v_a] else team1_id end,
              seed1 = case when team1_id is null then v_a else seed1 end,
              team2_id = case when team1_id is null then team2_id else v_seeds[v_a] end,
              seed2 = case when team1_id is null then seed2 else v_a end
          where id = v_target;
        else
          insert into public.playoff_series (
            tournament_id, round, slot, best_of, team1_id, team2_id, seed1, seed2, next_series_id
          )
          values (
            p_tournament_id, r, q, v_t.best_of, v_seeds[v_a], v_seeds[v_b], v_a, v_b, v_target
          )
          returning id into v_sid;
        end if;
      else
        insert into public.playoff_series (tournament_id, round, slot, best_of, next_series_id)
        values (p_tournament_id, r, q, v_t.best_of, v_target)
        returning id into v_sid;
      end if;

      v_cur_ids := v_cur_ids || v_sid;
    end loop;
    v_next_ids := v_cur_ids;
  end loop;

  -- open every series that already has both teams (round 1 matchups, bye vs bye in round 2)
  for v_row in
    select id from public.playoff_series
    where tournament_id = p_tournament_id and team1_id is not null and team2_id is not null
    order by round, slot
  loop
    perform public.open_series_if_ready(v_row.id);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- apply_series_game_result: playoff games (series) part of save_game_result
-- ---------------------------------------------------------------------------
create function public.apply_series_game_result(
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
  v_game public.games;
  v_series public.playoff_series;
  v_last_played integer;
  v_need integer;
  v_w1 integer;
  v_w2 integer;
  v_old_winner bigint;
  v_new_winner bigint;
  v_new_seed smallint;
begin
  select * into v_game from public.games where id = p_game_id;
  select * into v_series from public.playoff_series where id = v_game.series_id for update;
  v_old_winner := v_series.winner_id;

  -- only the latest played game (or the one still to play) can be edited
  select max(game_number) into v_last_played
  from public.games
  where series_id = v_series.id and score1 is not null and score2 is not null;
  if v_game.game_number < coalesce(v_last_played, 0) then
    raise exception 'Only the latest game of a series can be edited';
  end if;

  update public.games set score1 = p_score1, score2 = p_score2
  where id = p_game_id returning * into v_game;

  select
    (count(*) filter (where (g.score1 > g.score2 and g.team1_id = v_series.team1_id)
                         or (g.score2 > g.score1 and g.team2_id = v_series.team1_id)))::int,
    (count(*) filter (where (g.score1 > g.score2 and g.team1_id = v_series.team2_id)
                         or (g.score2 > g.score1 and g.team2_id = v_series.team2_id)))::int
  into v_w1, v_w2
  from public.games g
  where g.series_id = v_series.id and g.score1 is not null and g.score2 is not null;

  v_need := (v_series.best_of + 1) / 2;
  v_new_winner := case
    when v_w1 >= v_need then v_series.team1_id
    when v_w2 >= v_need then v_series.team2_id
  end;

  -- the outcome of the series changed: the next series must still be untouched
  if v_old_winner is distinct from v_new_winner and v_series.next_series_id is not null then
    if v_old_winner is not null then
      if exists (
        select 1 from public.games
        where series_id = v_series.next_series_id and score1 is not null and score2 is not null
      ) then
        raise exception 'The next series has already started';
      end if;
      delete from public.games where series_id = v_series.next_series_id;
      update public.playoff_series
      set team1_id = case when team1_id = v_old_winner then null else team1_id end,
          seed1 = case when team1_id = v_old_winner then null else seed1 end,
          team2_id = case when team2_id = v_old_winner then null else team2_id end,
          seed2 = case when team2_id = v_old_winner then null else seed2 end
      where id = v_series.next_series_id;
    end if;
  end if;

  update public.playoff_series
  set wins1 = v_w1, wins2 = v_w2, winner_id = v_new_winner
  where id = v_series.id;

  if v_new_winner is not null then
    -- decided: drop games that will not be played
    delete from public.games
    where series_id = v_series.id and score1 is null and score2 is null;

    if v_series.next_series_id is not null and v_old_winner is distinct from v_new_winner then
      v_new_seed := case when v_new_winner = v_series.team1_id then v_series.seed1 else v_series.seed2 end;
      update public.playoff_series
      set team1_id = case when team1_id is null then v_new_winner else team1_id end,
          seed1 = case when team1_id is null then v_new_seed else seed1 end,
          team2_id = case when team1_id is null then team2_id else v_new_winner end,
          seed2 = case when team1_id is null then seed2 else v_new_seed end
      where id = v_series.next_series_id;
      perform public.open_series_if_ready(v_series.next_series_id);
    end if;
  elsif not exists (
    select 1 from public.games
    where series_id = v_series.id and score1 is null and score2 is null
  ) then
    perform public.create_series_game(v_series.id);
  end if;

  return v_game;
end;
$$;

revoke all on function public.apply_series_game_result(bigint, integer, integer) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- save_game_result: same as before, plus series games and the regular season lock
-- ---------------------------------------------------------------------------
create or replace function public.save_game_result(
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

  if v_game.series_id is not null then
    return public.apply_series_game_result(p_game_id, p_score1, p_score2);
  end if;

  if v_tournament.type = 3 and exists (
    select 1 from public.playoff_series where tournament_id = v_game.tournament_id
  ) then
    raise exception 'The playoffs have started: the regular season is locked';
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

    -- a different winner means a different team in that slot: its starting pitcher no longer applies
    if v_game.next_match_place = 'home' and v_next.team1_id is distinct from v_winner then
      update public.games
      set team1_id = v_winner, pitcher1_name = null, pitcher1_id = null
      where id = v_next.id;
    elsif v_game.next_match_place = 'away' and v_next.team2_id is distinct from v_winner then
      update public.games
      set team2_id = v_winner, pitcher2_name = null, pitcher2_id = null
      where id = v_next.id;
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
-- execute privileges
-- ---------------------------------------------------------------------------
revoke all on function public.default_playoff_teams(integer) from public, anon;
revoke all on function public.series_higher_seed_hosts(integer, integer) from public, anon;
revoke all on function public.create_tournament(text, smallint, smallint, jsonb, smallint, smallint) from public, anon;
revoke all on function public.get_tournament_standings(bigint) from public, anon;
revoke all on function public.get_my_tournaments() from public, anon;
revoke all on function public.start_playoffs(bigint) from public, anon;
revoke all on function public.save_game_result(bigint, integer, integer) from public, anon;

grant execute on function public.default_playoff_teams(integer) to authenticated;
grant execute on function public.series_higher_seed_hosts(integer, integer) to authenticated;
grant execute on function public.create_tournament(text, smallint, smallint, jsonb, smallint, smallint) to authenticated;
grant execute on function public.get_tournament_standings(bigint) to authenticated;
grant execute on function public.get_my_tournaments() to authenticated;
grant execute on function public.start_playoffs(bigint) to authenticated;
grant execute on function public.save_game_result(bigint, integer, integer) to authenticated;
