-- Row level security: helper functions, policies and grants.
-- Writes to games/teams/members/invites/friendships/friend_requests happen only through the RPCs
-- defined in the next migration, so there are no insert/update policies for them.

-- ---------------------------------------------------------------------------
-- helper functions (security definer to avoid recursive RLS)
-- ---------------------------------------------------------------------------

-- Owner or any member (shared admin / guest).
create function public.is_tournament_member(p_tournament_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tournaments t
    where t.id = p_tournament_id and t.admin_id = (select auth.uid())
  ) or exists (
    select 1 from public.tournament_members m
    where m.tournament_id = p_tournament_id and m.user_id = (select auth.uid())
  );
$$;

-- Owner or shared admin.
create function public.can_manage_tournament(p_tournament_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tournaments t
    where t.id = p_tournament_id and t.admin_id = (select auth.uid())
  ) or exists (
    select 1 from public.tournament_members m
    where m.tournament_id = p_tournament_id
      and m.user_id = (select auth.uid())
      and m.role = 'shared_admin'
  );
$$;

-- Self, friends, and anyone with a pending friend request to/from me.
create function public.can_view_profile(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_profile_id = (select auth.uid())
    or exists (
      select 1 from public.friendships f
      where f.user_id = (select auth.uid()) and f.friend_id = p_profile_id
    )
    or exists (
      select 1 from public.friend_requests r
      where (r.creator_id = (select auth.uid()) and r.receiver_id = p_profile_id)
         or (r.receiver_id = (select auth.uid()) and r.creator_id = p_profile_id)
    );
$$;

revoke all on function public.is_tournament_member(bigint) from public, anon;
revoke all on function public.can_manage_tournament(bigint) from public, anon;
revoke all on function public.can_view_profile(uuid) from public, anon;
grant execute on function public.is_tournament_member(bigint) to authenticated;
grant execute on function public.can_manage_tournament(bigint) to authenticated;
grant execute on function public.can_view_profile(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- grants: start from nothing, then open exactly what the app needs
-- ---------------------------------------------------------------------------
revoke all on table
  public.profiles,
  public.tournaments,
  public.tournament_members,
  public.tournament_invites,
  public.teams,
  public.games,
  public.friend_requests,
  public.friendships,
  public.notifications
from anon, authenticated;

grant select on table
  public.profiles,
  public.tournaments,
  public.tournament_members,
  public.teams,
  public.games,
  public.friend_requests,
  public.friendships,
  public.notifications
to authenticated;

grant update (full_name, avatar_url) on public.profiles to authenticated;
grant delete on public.tournaments to authenticated;
grant delete on public.friend_requests to authenticated;
grant update (read) on public.notifications to authenticated;
grant delete on public.notifications to authenticated;

-- ---------------------------------------------------------------------------
-- policies
-- ---------------------------------------------------------------------------
create policy profiles_select on public.profiles
  for select to authenticated
  using (public.can_view_profile(id));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy tournaments_select on public.tournaments
  for select to authenticated
  using (public.is_tournament_member(id));

create policy tournaments_delete on public.tournaments
  for delete to authenticated
  using (public.can_manage_tournament(id));

create policy tournament_members_select on public.tournament_members
  for select to authenticated
  using (user_id = (select auth.uid()) or public.can_manage_tournament(tournament_id));

create policy teams_select on public.teams
  for select to authenticated
  using (public.is_tournament_member(tournament_id));

create policy games_select on public.games
  for select to authenticated
  using (public.is_tournament_member(tournament_id));

create policy friend_requests_select on public.friend_requests
  for select to authenticated
  using (creator_id = (select auth.uid()) or receiver_id = (select auth.uid()));

create policy friend_requests_delete on public.friend_requests
  for delete to authenticated
  using (creator_id = (select auth.uid()) or receiver_id = (select auth.uid()));

create policy friendships_select on public.friendships
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy notifications_select_own on public.notifications
  for select to authenticated
  using (receiver_id = (select auth.uid()));

create policy notifications_update_own on public.notifications
  for update to authenticated
  using (receiver_id = (select auth.uid()))
  with check (receiver_id = (select auth.uid()));

create policy notifications_delete_own on public.notifications
  for delete to authenticated
  using (receiver_id = (select auth.uid()));

-- tournament_invites: no policies on purpose. Only the RPCs (security definer) touch it.
