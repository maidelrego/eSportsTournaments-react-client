-- Smoke test for MLB "Season + Playoffs" (tournament type 3).
-- Runs inside a transaction that is ALWAYS rolled back (nothing is persisted):
--   npx supabase db query --linked -f supabase/tests/smoke_season.sql
-- No assertion error = everything passed.

begin;

do $$
declare
  a uuid := gen_random_uuid();   -- owner
  c uuid := gen_random_uuid();   -- stranger
  t5 bigint;
  t6 bigint;
  t9 bigint;
  t3 bigint;
  t3b bigint;
  tcyc bigint;
  tbo1 bigint;
  v_row record;
  v_ids bigint[];
  v_sid bigint;
  v_s14 bigint;
  v_s23 bigint;
  v_final bigint;
  v_g1 bigint;
  v_g2 bigint;
  v_g3 bigint;
  v_game public.games;
  v_json jsonb;
  v_failed boolean;
  v_msg text;
  v_teams3 jsonb := (select jsonb_agg(jsonb_build_object('playerName', 'p' || n, 'teamName', 't' || n)) from generate_series(1, 3) n);
  v_teams5 jsonb := (select jsonb_agg(jsonb_build_object('playerName', 'p' || n, 'teamName', 't' || n)) from generate_series(1, 5) n);
  v_teams6 jsonb := (select jsonb_agg(jsonb_build_object('playerName', 'p' || n, 'teamName', 't' || n)) from generate_series(1, 6) n);
  v_teams9 jsonb := (select jsonb_agg(jsonb_build_object('playerName', 'p' || n, 'teamName', 't' || n)) from generate_series(1, 9) n);
begin
  insert into auth.users (id, aud, role, email, raw_user_meta_data) values
    (a, 'authenticated', 'authenticated', 'season-a@example.test', '{"full_name":"Alice Season"}'),
    (c, 'authenticated', 'authenticated', 'season-c@example.test', '{"full_name":"Cara Season"}');

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  -- ------------------------------------------------------------------ defaults and validation
  assert public.default_playoff_teams(3) = 2 and public.default_playoff_teams(4) = 4
     and public.default_playoff_teams(5) = 4 and public.default_playoff_teams(6) = 5
     and public.default_playoff_teams(8) = 5 and public.default_playoff_teams(9) = 6
     and public.default_playoff_teams(12) = 6, 'default playoff teams table';

  v_failed := false;
  begin
    perform public.create_tournament('x', 3::smallint, 1::smallint, v_teams5);
  exception when others then v_failed := true; v_msg := sqlerrm;
  end;
  assert v_failed and v_msg like '%MLB%', 'season is MLB only';

  v_failed := false;
  begin
    perform public.create_tournament('x', 3::smallint, 2::smallint, '[{"playerName":"a","teamName":"a"},{"playerName":"b","teamName":"b"}]'::jsonb);
  exception when others then v_failed := true;
  end;
  assert v_failed, 'season needs 3+ players';

  v_failed := false;
  begin
    perform public.create_tournament('x', 3::smallint, 2::smallint, v_teams6, 7::smallint, 3::smallint);
  exception when others then v_failed := true;
  end;
  assert v_failed, 'playoff teams cannot exceed players';

  v_failed := false;
  begin
    perform public.create_tournament('x', 3::smallint, 2::smallint, v_teams6, 1::smallint, 3::smallint);
  exception when others then v_failed := true;
  end;
  assert v_failed, 'playoff teams must be at least 2';

  v_failed := false;
  begin
    perform public.create_tournament('x', 3::smallint, 2::smallint, v_teams6, 4::smallint, 2::smallint);
  exception when others then v_failed := true;
  end;
  assert v_failed, 'series length must be 1, 3, 5 or 7';

  -- ------------------------------------------------------------------ 5 players (odd): season + 4 team playoffs
  t5 := public.create_tournament('season5', 3::smallint, 2::smallint, v_teams5);
  assert (select playoff_teams from public.tournaments where id = t5) = 4, 'default playoff teams for 5';
  assert (select best_of from public.tournaments where id = t5) = 3, 'default best of 3';
  assert (select count(*) from public.games where tournament_id = t5) = 10, '5 players = 10 games';
  assert (select count(*) from public.games where tournament_id = t5 and series_id is not null) = 0, 'season games have no series';
  assert not exists (
    select 1 from public.teams tm where tm.tournament_id = t5
      and (select count(*) from public.games g where g.tournament_id = t5 and (g.team1_id = tm.id or g.team2_id = tm.id)) <> 4
  ), 'everybody plays 4 games';
  assert not exists (
    select 1 from public.teams tm where tm.tournament_id = t5
      and (select count(*) from public.games g where g.tournament_id = t5 and g.team1_id = tm.id) not between 1 and 3
  ), 'home games are balanced';
  assert (select count(*) from public.get_tournament_standings(t5) where playoff_seed is not null) = 4, 'projected seeds';

  -- cannot start before the season is over
  v_failed := false;
  begin
    perform public.start_playoffs(t5);
  exception when others then v_failed := true; v_msg := sqlerrm;
  end;
  assert v_failed and v_msg like '%regular season%', 'season must finish first';

  -- a stranger cannot start the playoffs
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_failed := false;
  begin
    perform public.start_playoffs(t5);
  exception when others then v_failed := true; v_msg := sqlerrm;
  end;
  assert v_failed and v_msg like '%not allowed%', 'stranger cannot start playoffs';
  assert (select count(*) from public.playoff_series) = 0, 'stranger sees no series';

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  -- lower team id always wins, so seeds follow team ids
  for v_row in select id, team1_id, team2_id from public.games where tournament_id = t5 and series_id is null order by id loop
    if v_row.team1_id < v_row.team2_id then
      perform public.save_game_result(v_row.id, 5, 2);
    else
      perform public.save_game_result(v_row.id, 2, 5);
    end if;
  end loop;
  select array_agg(id order by id) into v_ids from public.teams where tournament_id = t5;
  assert (select team_id from public.get_tournament_standings(t5) where ranking = 1) = v_ids[1], 'seed 1';
  assert (select wins from public.get_tournament_standings(t5) where ranking = 1) = 4, 'seed 1 won all';
  assert (select playoff_seed from public.get_tournament_standings(t5) where team_id = v_ids[4]) = 4, 'seed 4 in';
  assert (select playoff_seed from public.get_tournament_standings(t5) where team_id = v_ids[5]) is null, 'seed 5 out';

  perform public.start_playoffs(t5);

  assert (select count(*) from public.playoff_series where tournament_id = t5) = 3, 'P-1 series';
  assert (select count(*) from public.playoff_series where tournament_id = t5 and round = 1) = 2, 'two first round series';
  select id into v_s14 from public.playoff_series where tournament_id = t5 and seed1 = 1 and seed2 = 4;
  select id into v_s23 from public.playoff_series where tournament_id = t5 and seed1 = 2 and seed2 = 3;
  select id into v_final from public.playoff_series where tournament_id = t5 and round = 2;
  assert v_s14 is not null and v_s23 is not null and v_final is not null, 'bracket 1v4 2v3 final';
  assert (select team1_id from public.playoff_series where id = v_s14) = v_ids[1]
     and (select team2_id from public.playoff_series where id = v_s14) = v_ids[4], 'higher seed is team1';
  assert (select count(*) from public.games where tournament_id = t5 and series_id is not null) = 2, 'game 1 of each first round series';
  assert (select team1_id is null and team2_id is null from public.playoff_series where id = v_final), 'final not set yet';
  assert (select next_series_id from public.playoff_series where id = v_s14) = v_final, 'winner feeds the final';

  v_failed := false;
  begin
    perform public.start_playoffs(t5);
  exception when others then v_failed := true; v_msg := sqlerrm;
  end;
  assert v_failed and v_msg like '%already started%', 'cannot start twice';

  select id into v_g1 from public.games where tournament_id = t5 and series_id is null order by id limit 1;
  v_failed := false;
  begin
    perform public.save_game_result(v_g1, 9, 0);
  exception when others then v_failed := true; v_msg := sqlerrm;
  end;
  assert v_failed and v_msg like '%locked%', 'regular season locked after start';

  -- ------------------------------------------------------------------ series 1v4 (best of 3)
  select id into v_g1 from public.games where series_id = v_s14 and game_number = 1;
  assert (select team1_id from public.games where id = v_g1) = v_ids[1], 'higher seed hosts game 1';
  v_failed := false;
  begin
    perform public.save_game_result(v_g1, 3, 3);
  exception when others then v_failed := true; v_msg := sqlerrm;
  end;
  assert v_failed and v_msg like '%tie%', 'no ties in a series';

  perform public.save_game_result(v_g1, 5, 2);
  assert (select wins1 from public.playoff_series where id = v_s14) = 1 and (select winner_id from public.playoff_series where id = v_s14) is null, '1-0';
  assert (select count(*) from public.games where series_id = v_s14) = 2, 'game 2 created';
  select id into v_g2 from public.games where series_id = v_s14 and game_number = 2;
  assert (select team1_id from public.games where id = v_g2) = v_ids[1], 'bo3: higher seed hosts game 2';

  perform public.save_game_result(v_g2, 5, 2);
  assert (select winner_id from public.playoff_series where id = v_s14) = v_ids[1], 'seed 1 clinched';
  assert (select count(*) from public.games where series_id = v_s14) = 2, 'no game 3 after a sweep';
  assert (select team1_id from public.playoff_series where id = v_final) = v_ids[1]
     and (select seed1 from public.playoff_series where id = v_final) = 1, 'winner placed in the final';
  assert (select count(*) from public.games where series_id = v_final) = 0, 'final waits for its second team';

  v_failed := false;
  begin
    perform public.save_game_result(v_g1, 9, 1);
  exception when others then v_failed := true; v_msg := sqlerrm;
  end;
  assert v_failed and v_msg like '%latest game%', 'only the latest game can be edited';

  -- flip the clincher: series is 1-1 again, final slot is cleared, game 3 appears
  perform public.save_game_result(v_g2, 2, 5);
  assert (select winner_id from public.playoff_series where id = v_s14) is null, 'series open again';
  assert (select team1_id is null from public.playoff_series where id = v_final), 'final slot cleared';
  assert (select count(*) from public.games where series_id = v_s14) = 3, 'game 3 created';
  select id into v_g3 from public.games where series_id = v_s14 and game_number = 3;

  perform public.save_game_result(v_g3, 1, 2);  -- seed 4 wins game 3
  assert (select winner_id from public.playoff_series where id = v_s14) = v_ids[4], 'seed 4 won 2-1';
  assert (select team1_id from public.playoff_series where id = v_final) = v_ids[4]
     and (select seed1 from public.playoff_series where id = v_final) = 4, 'seed 4 in the final';

  -- ------------------------------------------------------------------ series 2v3, final seeding order
  select id into v_g1 from public.games where series_id = v_s23 and game_number = 1;
  perform public.save_game_result(v_g1, 5, 2);
  select id into v_g2 from public.games where series_id = v_s23 and game_number = 2;
  perform public.save_game_result(v_g2, 5, 2);
  assert (select winner_id from public.playoff_series where id = v_s23) = v_ids[2], 'seed 2 clinched';
  assert (select team1_id from public.playoff_series where id = v_final) = v_ids[2]
     and (select team2_id from public.playoff_series where id = v_final) = v_ids[4]
     and (select seed1 from public.playoff_series where id = v_final) = 2, 'final: better seed is team1';
  select id into v_g1 from public.games where series_id = v_final and game_number = 1;
  assert (select team1_id from public.games where id = v_g1) = v_ids[2], 'better seed hosts final game 1';

  perform public.set_game_pitchers(v_g1, 1::smallint, 'Playoff Ace', 1);
  assert (select pitcher1_name from public.games where id = v_g1) = 'Playoff Ace', 'pitchers work in playoff games';

  perform public.save_game_result(v_g1, 5, 2);

  -- series 1v4 is decided and the final has started: its outcome cannot change any more
  v_failed := false;
  begin
    perform public.save_game_result(v_g3, 5, 2);
  exception when others then v_failed := true; v_msg := sqlerrm;
  end;
  assert v_failed and v_msg like '%next series has already started%', 'cannot flip a series feeding a played series';
  perform public.save_game_result(v_g3, 1, 4);  -- same winner, different score: fine
  assert (select score2 from public.games where id = v_g3) = 4, 'same winner edit allowed';

  select id into v_g2 from public.games where series_id = v_final and game_number = 2;
  perform public.save_game_result(v_g2, 5, 2);
  assert (select winner_id from public.playoff_series where id = v_final) = v_ids[2], 'champion decided';
  assert (select count(*) from public.games where series_id = v_final) = 2, 'no game 3 in the final';

  select x into v_json from jsonb_array_elements(public.get_my_tournaments()) x where x ->> 'id' = t5::text;
  assert v_json ->> 'status' = 'p2' and (v_json ->> 'type')::int = 3 and (v_json ->> 'bestOf')::int = 3 and (v_json ->> 'playoffTeams')::int = 4, 'champion in my tournaments';

  -- ------------------------------------------------------------------ 6 players: 5 playoff teams = one wild card game, seeds 1-3 rest
  t6 := public.create_tournament('season6', 3::smallint, 2::smallint, v_teams6);
  assert (select playoff_teams from public.tournaments where id = t6) = 5, 'default 5 for 6 players';
  for v_row in select id, team1_id, team2_id from public.games where tournament_id = t6 order by id loop
    if v_row.team1_id < v_row.team2_id then perform public.save_game_result(v_row.id, 5, 2);
    else perform public.save_game_result(v_row.id, 2, 5); end if;
  end loop;
  select array_agg(id order by id) into v_ids from public.teams where tournament_id = t6;
  perform public.start_playoffs(t6);
  assert (select count(*) from public.playoff_series where tournament_id = t6) = 4, 'P=5 -> 4 series';
  assert (select count(*) from public.playoff_series where tournament_id = t6 and round = 1) = 1, 'only 4v5 in round 1';
  assert exists (select 1 from public.playoff_series where tournament_id = t6 and round = 1 and seed1 = 4 and seed2 = 5), 'wild card 4v5';
  assert exists (select 1 from public.playoff_series where tournament_id = t6 and round = 2 and seed1 = 1 and team2_id is null and team1_id = v_ids[1]), 'seed 1 waits (bye)';
  assert exists (select 1 from public.playoff_series where tournament_id = t6 and round = 2 and seed1 = 2 and seed2 = 3 and team1_id = v_ids[2]), 'seeds 2 and 3 meet in round 2';
  assert (select count(*) from public.games where tournament_id = t6 and series_id is not null) = 2, 'games for 4v5 and 2v3 only';

  -- ------------------------------------------------------------------ 9 players: 6 playoff teams, two wild cards, seeds 1-2 rest
  t9 := public.create_tournament('season9', 3::smallint, 2::smallint, v_teams9);
  assert (select count(*) from public.games where tournament_id = t9) = 36, '9 players = 36 games';
  assert (select playoff_teams from public.tournaments where id = t9) = 6, 'default 6 for 9 players';
  for v_row in select id, team1_id, team2_id from public.games where tournament_id = t9 order by id loop
    if v_row.team1_id < v_row.team2_id then perform public.save_game_result(v_row.id, 5, 2);
    else perform public.save_game_result(v_row.id, 2, 5); end if;
  end loop;
  perform public.start_playoffs(t9);
  assert (select count(*) from public.playoff_series where tournament_id = t9) = 5, 'P=6 -> 5 series';
  assert exists (select 1 from public.playoff_series where tournament_id = t9 and round = 1 and seed1 = 4 and seed2 = 5), 'wild card 4v5';
  assert exists (select 1 from public.playoff_series where tournament_id = t9 and round = 1 and seed1 = 3 and seed2 = 6), 'wild card 3v6';
  assert (select count(*) from public.playoff_series where tournament_id = t9 and round = 2 and team1_id is not null and team2_id is null) = 2, 'seeds 1 and 2 wait for the winners';
  -- 4v5 winner meets seed 1, 3v6 winner meets seed 2
  select id into v_sid from public.playoff_series where tournament_id = t9 and round = 1 and seed1 = 4;
  assert (select next_series_id from public.playoff_series where id = v_sid) = (select id from public.playoff_series where tournament_id = t9 and round = 2 and seed1 = 1), '4/5 winner plays seed 1';
  select id into v_sid from public.playoff_series where tournament_id = t9 and round = 1 and seed1 = 3;
  assert (select next_series_id from public.playoff_series where id = v_sid) = (select id from public.playoff_series where tournament_id = t9 and round = 2 and seed1 = 2), '3/6 winner plays seed 2';

  -- ------------------------------------------------------------------ best of 1 (custom P = 6 with 6 players, no byes shape: 1,2 rest)
  tbo1 := public.create_tournament('bo1', 3::smallint, 2::smallint, v_teams6, 6::smallint, 1::smallint);
  for v_row in select id, team1_id, team2_id from public.games where tournament_id = tbo1 order by id loop
    if v_row.team1_id < v_row.team2_id then perform public.save_game_result(v_row.id, 5, 2);
    else perform public.save_game_result(v_row.id, 2, 5); end if;
  end loop;
  perform public.start_playoffs(tbo1);
  assert (select count(*) from public.playoff_series where tournament_id = tbo1) = 5, 'custom P=6';
  select id into v_sid from public.playoff_series where tournament_id = tbo1 and round = 1 and seed1 = 4;
  select id into v_g1 from public.games where series_id = v_sid and game_number = 1;
  perform public.save_game_result(v_g1, 5, 2);
  assert (select winner_id from public.playoff_series where id = v_sid) is not null, 'best of 1 decided by one game';
  assert (select count(*) from public.games where series_id = v_sid) = 1, 'no second game in a best of 1';

  -- ------------------------------------------------------------------ 3 players: final only, best of 5 home pattern 2-2-1
  t3 := public.create_tournament('season3', 3::smallint, 2::smallint, v_teams3, null, 5::smallint);
  assert (select count(*) from public.games where tournament_id = t3) = 3, '3 players = 3 games';
  for v_row in select id, team1_id, team2_id from public.games where tournament_id = t3 order by id loop
    if v_row.team1_id < v_row.team2_id then perform public.save_game_result(v_row.id, 5, 2);
    else perform public.save_game_result(v_row.id, 2, 5); end if;
  end loop;
  select array_agg(id order by id) into v_ids from public.teams where tournament_id = t3;
  perform public.start_playoffs(t3);
  select id into v_sid from public.playoff_series where tournament_id = t3;
  assert (select count(*) from public.playoff_series where tournament_id = t3) = 1 and (select round from public.playoff_series where id = v_sid) = 1, 'final only';
  assert (select next_series_id from public.playoff_series where id = v_sid) is null, 'final feeds nothing';

  select id into v_g1 from public.games where series_id = v_sid and game_number = 1;
  perform public.save_game_result(v_g1, 5, 2);               -- seed 1 wins g1 (1-0)
  select id into v_g2 from public.games where series_id = v_sid and game_number = 2;
  assert (select team1_id from public.games where id = v_g2) = v_ids[1], 'bo5: higher seed hosts game 2';
  perform public.save_game_result(v_g2, 2, 5);               -- seed 2 wins g2 (1-1)
  select id into v_g3 from public.games where series_id = v_sid and game_number = 3;
  assert (select team1_id from public.games where id = v_g3) = v_ids[2], 'bo5: lower seed hosts game 3';
  perform public.save_game_result(v_g3, 5, 2);               -- seed 2 wins g3 (1-2)
  select id into v_g1 from public.games where series_id = v_sid and game_number = 4;
  assert (select team1_id from public.games where id = v_g1) = v_ids[2], 'bo5: lower seed hosts game 4';
  perform public.save_game_result(v_g1, 2, 5);               -- seed 1 wins g4 (2-2)
  select id into v_g2 from public.games where series_id = v_sid and game_number = 5;
  assert (select team1_id from public.games where id = v_g2) = v_ids[1], 'bo5: higher seed hosts game 5';
  perform public.save_game_result(v_g2, 5, 2);               -- seed 1 wins g5 (3-2)
  assert (select winner_id from public.playoff_series where id = v_sid) = v_ids[1], 'seed 1 wins the series 3-2';
  assert (select count(*) from public.games where series_id = v_sid) = 5, 'exactly 5 games';

  -- ------------------------------------------------------------------ MLB tie-break: run differential before runs scored
  tcyc := public.create_tournament('cycle', 3::smallint, 2::smallint, v_teams3);
  select array_agg(id order by id) into v_ids from public.teams where tournament_id = tcyc;
  for v_row in select id, team1_id, team2_id from public.games where tournament_id = tcyc order by id loop
    -- 1 beats 2 (30-29), 2 beats 3 (2-1), 3 beats 1 (8-0): every team 1-1, run differential decides
    if (v_row.team1_id = v_ids[1] and v_row.team2_id = v_ids[2]) then perform public.save_game_result(v_row.id, 30, 29);
    elsif (v_row.team1_id = v_ids[2] and v_row.team2_id = v_ids[1]) then perform public.save_game_result(v_row.id, 29, 30);
    elsif (v_row.team1_id = v_ids[2] and v_row.team2_id = v_ids[3]) then perform public.save_game_result(v_row.id, 2, 1);
    elsif (v_row.team1_id = v_ids[3] and v_row.team2_id = v_ids[2]) then perform public.save_game_result(v_row.id, 1, 2);
    elsif (v_row.team1_id = v_ids[3] and v_row.team2_id = v_ids[1]) then perform public.save_game_result(v_row.id, 8, 0);
    else perform public.save_game_result(v_row.id, 0, 8);
    end if;
  end loop;
  assert (select array_agg(team_id order by ranking) from public.get_tournament_standings(tcyc)) = array[v_ids[3], v_ids[2], v_ids[1]], 'run differential decides (+7, 0, -7)';
  perform public.start_playoffs(tcyc);
  select id into v_sid from public.playoff_series where tournament_id = tcyc;
  assert (select team1_id from public.playoff_series where id = v_sid) = v_ids[3] and (select team2_id from public.playoff_series where id = v_sid) = v_ids[2], 'seeds follow run differential';

  -- ------------------------------------------------------------------ strangers see nothing
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  set local role authenticated;
  assert (select count(*) from public.playoff_series) = 0, 'C sees no series';
  assert (select count(*) from public.tournaments) = 0, 'C sees no tournaments';

  reset role;
  raise notice 'SMOKE SEASON OK';
end;
$$;

rollback;
