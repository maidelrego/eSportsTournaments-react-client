-- MLB The Show: starting pitcher per game side, so each player's rotation can be tracked.
-- pitcher*_id is the MLB Stats API person id (null when the name was typed by hand).

alter table public.games
  add column pitcher1_name text check (pitcher1_name is null or char_length(pitcher1_name) between 1 and 100),
  add column pitcher1_id integer,
  add column pitcher2_name text check (pitcher2_name is null or char_length(pitcher2_name) between 1 and 100),
  add column pitcher2_id integer;

create function public.set_game_pitchers(
  p_game_id bigint,
  p_side smallint,
  p_pitcher_name text,
  p_pitcher_id integer default null
)
returns public.games
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_game public.games;
  v_sport smallint;
  v_name text := nullif(trim(coalesce(p_pitcher_name, '')), '');
  v_id integer := case when nullif(trim(coalesce(p_pitcher_name, '')), '') is null then null else p_pitcher_id end;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;
  if p_side is null or p_side not in (1, 2) then
    raise exception 'Invalid side';
  end if;
  if v_name is not null and char_length(v_name) > 100 then
    raise exception 'Pitcher name is too long';
  end if;

  select * into v_game from public.games where id = p_game_id for update;
  if not found then
    raise exception 'Game not found';
  end if;
  if not public.can_manage_tournament(v_game.tournament_id) then
    raise exception 'You are not allowed to edit this tournament' using errcode = '42501';
  end if;

  select sport into v_sport from public.tournaments where id = v_game.tournament_id;
  if v_sport <> 2 then
    raise exception 'Pitchers are only tracked in MLB The Show tournaments';
  end if;
  if (p_side = 1 and v_game.team1_id is null) or (p_side = 2 and v_game.team2_id is null) then
    raise exception 'That team is not defined yet';
  end if;

  if p_side = 1 then
    update public.games set pitcher1_name = v_name, pitcher1_id = v_id where id = p_game_id returning * into v_game;
  else
    update public.games set pitcher2_name = v_name, pitcher2_id = v_id where id = p_game_id returning * into v_game;
  end if;

  return v_game;
end;
$$;

revoke all on function public.set_game_pitchers(bigint, smallint, text, integer) from public, anon;
grant execute on function public.set_game_pitchers(bigint, smallint, text, integer) to authenticated;

-- save_game_result: same as before, but clears the pitcher of a slot whose team changes (knockout winner flipped).
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

revoke all on function public.save_game_result(bigint, integer, integer) from public, anon;
grant execute on function public.save_game_result(bigint, integer, integer) to authenticated;
