-- Smoke test for the TourneyForge schema, RLS and RPCs.
-- Runs against the live project inside a transaction that is ALWAYS rolled back (nothing is persisted):
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/smoke.sql
-- Prints "SMOKE OK" when every assertion passes.

begin;

do $$
declare
  a uuid := gen_random_uuid();   -- tournament owner
  b uuid := gen_random_uuid();   -- guest / friend
  c uuid := gen_random_uuid();   -- stranger, later shared admin
  g uuid := gen_random_uuid();   -- google style signup
  t_league bigint;
  t_ko4 bigint;
  t_ko8 bigint;
  t_ko16 bigint;
  v_nick_b text;
  v_nick_c text;
  v_game public.games;
  v_gid bigint;
  v_gid2 bigint;
  v_final bigint;
  v_team1 bigint;
  v_team2 bigint;
  v_json jsonb;
  v_token uuid;
  v_req bigint;
  v_failed boolean;
  v_msg text;
  v_rows int;
  v_row record;
begin
  -- ---------------------------------------------------------------- users + profiles
  insert into auth.users (id, aud, role, email, raw_user_meta_data) values
    (a, 'authenticated', 'authenticated', 'smoke-a@example.test', '{"full_name":"Alice Smith"}'),
    (b, 'authenticated', 'authenticated', 'smoke-b@example.test', '{"full_name":"Bob Jones"}'),
    (c, 'authenticated', 'authenticated', 'smoke-c@example.test', '{"full_name":"Cara Lee"}'),
    (g, 'authenticated', 'authenticated', 'smoke-g@example.test', '{"name":"Gina G","picture":"https://example.test/p.png"}');

  assert (select nickname from public.profiles where id = a) ~ '^alicesmith[0-9]{4}$', 'nickname format';
  assert (select avatar_url from public.profiles where id = a) like 'https://ui-avatars.com/api/?name=Alice+Smith%', 'default avatar';
  assert (select avatar_url from public.profiles where id = g) = 'https://example.test/p.png', 'google avatar kept';
  select nickname into v_nick_b from public.profiles where id = b;
  select nickname into v_nick_c from public.profiles where id = c;

  -- ---------------------------------------------------------------- anon is locked out
  reset role;
  set local role anon;
  v_failed := false;
  begin
    perform count(*) from public.tournaments;
  exception when insufficient_privilege then
    v_failed := true;
  end;
  assert v_failed, 'anon must not read tournaments';
  v_failed := false;
  begin
    perform public.create_tournament('x', 1::smallint, 1::smallint, '[]'::jsonb);
  exception when insufficient_privilege then
    v_failed := true;
  end;
  assert v_failed, 'anon must not execute RPCs';

  -- ---------------------------------------------------------------- create tournaments as A
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  -- MLB league, 4 players -> 12 games
  t_league := public.create_tournament(
    'MLB league', 1::smallint, 2::smallint,
    (select jsonb_agg(jsonb_build_object('playerName', 'p' || n, 'teamName', 'Team ' || n, 'logoUrl', '')) from generate_series(1, 4) n)
  );
  assert (select count(*) from public.games where tournament_id = t_league) = 12, 'league 4 players = 12 games';
  assert (select count(*) from public.teams where tournament_id = t_league) = 4, 'league teams';

  -- invalid inputs
  v_failed := false;
  begin
    perform public.create_tournament('bad', 2::smallint, 1::smallint,
      (select jsonb_agg(jsonb_build_object('playerName', 'p' || n, 'teamName', 't' || n)) from generate_series(1, 5) n));
  exception when others then v_failed := true;
  end;
  assert v_failed, 'knockout with 5 teams must fail';
  v_failed := false;
  begin
    perform public.create_tournament('bad', 1::smallint, 3::smallint,
      (select jsonb_agg(jsonb_build_object('playerName', 'p' || n, 'teamName', 't' || n)) from generate_series(1, 4) n));
  exception when others then v_failed := true;
  end;
  assert v_failed, 'sport 3 must fail';
  v_failed := false;
  begin
    perform public.create_tournament('bad', 1::smallint, 1::smallint,
      '[{"playerName":"","teamName":"x"},{"playerName":"y","teamName":"z"}]'::jsonb);
  exception when others then v_failed := true;
  end;
  assert v_failed, 'empty player name must fail';

  -- knockout bracket shapes
  t_ko4 := public.create_tournament('ko4', 2::smallint, 1::smallint,
    (select jsonb_agg(jsonb_build_object('playerName', 'p' || n, 'teamName', 't' || n)) from generate_series(1, 4) n));
  t_ko8 := public.create_tournament('ko8', 2::smallint, 2::smallint,
    (select jsonb_agg(jsonb_build_object('playerName', 'p' || n, 'teamName', 't' || n)) from generate_series(1, 8) n));
  t_ko16 := public.create_tournament('ko16', 2::smallint, 1::smallint,
    (select jsonb_agg(jsonb_build_object('playerName', 'p' || n, 'teamName', 't' || n)) from generate_series(1, 16) n));

  assert (select count(*) from public.games where tournament_id = t_ko4) = 3, 'ko4 = 3 games';
  assert (select count(*) from public.games where tournament_id = t_ko8) = 7, 'ko8 = 7 games';
  assert (select count(*) from public.games where tournament_id = t_ko16) = 15, 'ko16 = 15 games';
  assert (select count(*) from public.games where tournament_id = t_ko8 and round_text = '1') = 4, 'ko8 round 1';
  assert (select count(*) from public.games where tournament_id = t_ko8 and round_text = '2') = 2, 'ko8 round 2';
  assert (select count(*) from public.games where tournament_id = t_ko8 and round_text = '3') = 1, 'ko8 final';
  assert (select count(*) from public.games where tournament_id = t_ko8 and round_text = '1' and team1_id is not null and team2_id is not null) = 4, 'ko8 round 1 teams set';
  assert (select count(*) from public.games where tournament_id = t_ko8 and round_text <> '1' and (team1_id is not null or team2_id is not null)) = 0, 'later rounds start empty';
  assert (select count(distinct x) from (select team1_id as x from public.games where tournament_id = t_ko8 union select team2_id from public.games where tournament_id = t_ko8) s where x is not null) = 8, 'each team once in round 1';
  -- every non final game feeds a game of the next round; each target gets one home + one away feeder
  assert (select count(*) from public.games where tournament_id = t_ko16 and next_match_id is null) = 1, 'single final';
  assert not exists (
    select 1 from (
      select next_match_id, count(*) c, count(distinct next_match_place) p
      from public.games where tournament_id = t_ko16 and next_match_id is not null group by next_match_id
    ) s where s.c <> 2 or s.p <> 2
  ), 'each game has exactly one home and one away feeder';
  assert not exists (
    select 1 from public.games g join public.games n on n.id = g.next_match_id
    where g.tournament_id = t_ko16 and n.round_text::int <> g.round_text::int + 1
  ), 'feeders go to the next round';

  -- ---------------------------------------------------------------- league results + standings (MLB: no ties)
  select id into v_gid from public.games where tournament_id = t_league order by id limit 1;
  select team1_id, team2_id into v_team1, v_team2 from public.games where id = v_gid;

  v_failed := false;
  begin
    perform public.save_game_result(v_gid, 3, 3);
  exception when others then
    v_failed := true; v_msg := sqlerrm;
  end;
  assert v_failed and v_msg like '%tie%', 'MLB league tie rejected: ' || coalesce(v_msg, '');

  v_game := public.save_game_result(v_gid, 7, 2);
  assert v_game.score1 = 7 and v_game.score2 = 2, 'result saved';

  select * into v_row from public.get_tournament_standings(t_league) order by ranking limit 1;
  assert v_row.team_id = v_team1 and v_row.wins = 1 and v_row.points = 3 and v_row.goals_scored = 7 and v_row.goals_conceded = 2, 'standings leader';
  assert (select count(*) from public.get_tournament_standings(t_league)) = 4, 'all teams in standings';
  assert (select losses from public.get_tournament_standings(t_league) where team_id = v_team2) = 1, 'loser recorded';
  assert jsonb_array_length((select last_five from public.get_tournament_standings(t_league) where team_id = v_team1)) = 1, 'last five';

  -- FIFA league allows draws
  -- (t_ko4 is sport 1 / knockout so use a quick sport 1 league)
  v_gid2 := null;

  -- ---------------------------------------------------------------- knockout flow (4 teams)
  select id into v_final from public.games where tournament_id = t_ko4 and round_text = '2';
  select id into v_gid from public.games where tournament_id = t_ko4 and round_text = '1' and next_match_place = 'home';
  select id into v_gid2 from public.games where tournament_id = t_ko4 and round_text = '1' and next_match_place = 'away';

  v_failed := false;
  begin
    perform public.save_game_result(v_final, 1, 0);
  exception when others then
    v_failed := true; v_msg := sqlerrm;
  end;
  assert v_failed and v_msg like '%teams must be defined%', 'final needs teams: ' || coalesce(v_msg, '');

  v_failed := false;
  begin
    perform public.save_game_result(v_gid, 2, 2);
  exception when others then
    v_failed := true; v_msg := sqlerrm;
  end;
  assert v_failed and v_msg like '%tie%', 'knockout tie rejected';

  perform public.save_game_result(v_gid, 2, 1);
  assert (select team1_id from public.games where id = v_final) = (select team1_id from public.games where id = v_gid), 'winner goes to home slot';

  -- editing the result before the next match is played flips the winner
  perform public.save_game_result(v_gid, 0, 1);
  assert (select team1_id from public.games where id = v_final) = (select team2_id from public.games where id = v_gid), 'winner updated';

  perform public.save_game_result(v_gid2, 5, 4);
  assert (select team2_id from public.games where id = v_final) = (select team1_id from public.games where id = v_gid2), 'winner goes to away slot';

  perform public.save_game_result(v_final, 3, 1);

  v_failed := false;
  begin
    perform public.save_game_result(v_gid, 9, 1);
  exception when others then
    v_failed := true; v_msg := sqlerrm;
  end;
  assert v_failed and v_msg like '%already been played%', 'cannot edit after next match played';

  -- ---------------------------------------------------------------- get_my_tournaments
  v_json := public.get_my_tournaments();
  assert jsonb_array_length(v_json) = 4, 'A sees own 4 tournaments';
  select x into v_json from jsonb_array_elements(public.get_my_tournaments()) x where x ->> 'id' = t_ko4::text;
  assert v_json ->> 'status' = (select user_name from public.get_tournament_standings(t_ko4) order by ranking limit 1), 'finished tournament shows winner';
  select x into v_json from jsonb_array_elements(public.get_my_tournaments()) x where x ->> 'id' = t_league::text;
  assert v_json ->> 'status' = 'In progress.......' and (v_json ->> 'gamesPlayed')::int = 1 and (v_json ->> 'gamesTotal')::int = 12, 'in progress status';

  -- ---------------------------------------------------------------- stranger C sees nothing, can do nothing
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  set local role authenticated;
  assert (select count(*) from public.tournaments) = 0, 'C sees no tournaments';
  assert (select count(*) from public.games) = 0, 'C sees no games';
  assert (select count(*) from public.teams) = 0, 'C sees no teams';
  assert (select count(*) from public.profiles where id = a) = 0, 'C cannot see A profile';
  assert (select count(*) from public.profiles where id = c) = 1, 'C sees self';
  v_failed := false;
  begin
    perform public.save_game_result(v_gid, 1, 0);
  exception when others then v_failed := true;
  end;
  assert v_failed, 'C cannot edit A game';
  v_failed := false;
  begin
    perform public.create_tournament_invite((select unique_id from public.tournaments where id = t_league), 'guest');
  exception when others then v_failed := true;
  end;
  assert v_failed, 'C cannot mint invites';

  -- ---------------------------------------------------------------- invites: B guest, C shared admin
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_token := public.create_tournament_invite((select unique_id from public.tournaments where id = t_league), 'guest');

  v_failed := false;
  begin
    perform public.join_tournament(v_token);
  exception when others then v_failed := true; v_msg := sqlerrm;
  end;
  assert v_failed and v_msg like '%own tournament%', 'owner cannot join own tournament';

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  assert public.join_tournament(v_token) = t_league, 'B joins';
  v_failed := false;
  begin
    perform public.join_tournament(v_token);
  exception when others then v_failed := true; v_msg := sqlerrm;
  end;
  assert v_failed and v_msg like '%already part%', 'cannot join twice';
  assert (select count(*) from public.tournaments) = 1, 'B sees the shared tournament only';
  assert (select count(*) from public.games where tournament_id = t_league) = 12, 'B sees games';
  v_json := public.get_my_tournaments();
  assert (v_json -> 0 -> 'sharedGuests') ? b::text, 'B listed as guest';

  select id into v_gid from public.games where tournament_id = t_league order by id offset 1 limit 1;
  v_failed := false;
  begin
    perform public.save_game_result(v_gid, 1, 0);
  exception when others then v_failed := true;
  end;
  assert v_failed, 'guest cannot save results';

  delete from public.tournaments where id = t_league;
  get diagnostics v_rows = row_count;
  assert v_rows = 0, 'guest cannot delete tournament';

  -- shared admin
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_token := public.create_tournament_invite((select unique_id from public.tournaments where id = t_league), 'shared_admin');

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.join_tournament(v_token);
  perform public.save_game_result(v_gid, 1, 0);
  assert (select score1 from public.games where id = v_gid) = 1, 'shared admin can save results';

  -- expired invite
  reset role;
  update public.tournament_invites set expires_at = now() - interval '1 minute' where token = v_token;
  perform set_config('request.jwt.claims', json_build_object('sub', g, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_failed := false;
  begin
    perform public.join_tournament(v_token);
  exception when others then v_failed := true; v_msg := sqlerrm;
  end;
  assert v_failed and v_msg like '%expired%', 'expired invite rejected';

  -- ---------------------------------------------------------------- profile guard
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_failed := false;
  begin
    update public.profiles set nickname = 'hacker' where id = a;
  exception when insufficient_privilege then v_failed := true;
  end;
  assert v_failed, 'nickname is not writable by clients';
  update public.profiles set full_name = 'Alice Jones' where id = a;
  assert (select nickname from public.profiles where id = a) ~ '^alicejones[0-9]{4}$', 'nickname follows full_name';
  update public.profiles set full_name = 'Alice Hacked' where id = b;
  get diagnostics v_rows = row_count;
  assert v_rows = 0, 'cannot edit another profile';

  -- ---------------------------------------------------------------- friends
  v_json := public.send_friend_request('does-not-exist');
  assert (v_json ->> 'ok')::boolean = false and v_json ->> 'msg' = 'Nickname not found', 'unknown nickname';
  v_json := public.send_friend_request(v_nick_b);
  assert (v_json ->> 'ok')::boolean, 'request sent';
  v_json := public.send_friend_request(v_nick_b);
  assert (v_json ->> 'ok')::boolean = false and v_json ->> 'msg' like '%pending%', 'duplicate request';
  assert (select count(*) from public.friend_requests where creator_id = a) = 1, 'A sees pending request';

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  assert (select count(*) from public.notifications) = 1, 'B has one notification';
  assert (select count(*) from public.profiles where id = a) = 1, 'B can see sender profile';
  select friend_request_id into v_req from public.notifications limit 1;

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_failed := false;
  begin
    perform public.accept_friend_request(v_req);
  exception when others then v_failed := true; v_msg := sqlerrm;
  end;
  assert v_failed and v_msg like '%not found%', 'only the receiver can accept';

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.accept_friend_request(v_req);
  assert (select count(*) from public.friendships) = 1, 'B has a friend';
  assert (select count(*) from public.notifications) = 0, 'notification removed after accept';

  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  assert (select count(*) from public.friendships where friend_id = b) = 1, 'A has B as friend';
  v_json := public.send_friend_request(v_nick_b);
  assert v_json ->> 'msg' = 'You are already friends', 'already friends';

  -- decline path: A -> C, C deletes the notification, request disappears
  v_json := public.send_friend_request(v_nick_c);
  assert (select count(*) from public.profiles where id = c) = 1, 'A can see C after request';
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  set local role authenticated;
  delete from public.notifications;
  reset role;
  assert (select count(*) from public.friend_requests where creator_id = a and receiver_id = c) = 0, 'decline removes request';

  -- mark read: only the read column is writable
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_json := public.send_friend_request(v_nick_c);
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  set local role authenticated;
  update public.notifications set read = true;
  assert (select count(*) from public.notifications where read) = 1, 'mark as read';
  v_failed := false;
  begin
    update public.notifications set type = 'invitation_tournament';
  exception when insufficient_privilege then v_failed := true;
  end;
  assert v_failed, 'notification type is not writable';

  -- ---------------------------------------------------------------- owner deletes tournament, cascade
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  delete from public.tournaments where id = t_ko8;
  get diagnostics v_rows = row_count;
  assert v_rows = 1, 'owner can delete';
  reset role;
  assert (select count(*) from public.games where tournament_id = t_ko8) = 0, 'games cascade';
  assert (select count(*) from public.teams where tournament_id = t_ko8) = 0, 'teams cascade';

  raise notice 'SMOKE OK';
end;
$$;

rollback;
