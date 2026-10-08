// Supabase returns snake_case rows. The UI was written against the old NestJS API (camelCase),
// so these mappers keep every component working with the same shapes.

export const mapProfile = (row) =>
  row
    ? {
      id: row.id,
      fullName: row.full_name,
      nickname: row.nickname,
      avatar: row.avatar_url,
    }
    : null;

export const mapNotification = (row) => ({
  id: row.id,
  type: row.type,
  read: row.read,
  createdAt: row.created_at,
  meta: row.friend_request_id,
  sender: mapProfile(row.sender),
});

export const mapTeam = (row) =>
  row
    ? {
      id: row.id,
      userName: row.user_name,
      teamName: row.team_name,
      logoUrl: row.logo_url,
    }
    : null;

export const mapGame = (row) => ({
  id: row.id,
  tournamentId: row.tournament_id,
  team1: mapTeam(row.team1),
  team2: mapTeam(row.team2),
  score1: row.score1,
  score2: row.score2,
  nextMatchId: row.next_match_id,
  nextMatchPlace: row.next_match_place,
  tournamentRoundText: row.round_text,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapStanding = (row) => ({
  teamId: row.team_id,
  team: {
    id: row.team_id,
    userName: row.user_name,
    teamName: row.team_name,
    logoUrl: row.logo_url,
  },
  gamesPlayed: row.games_played,
  wins: row.wins,
  draws: row.draws,
  losses: row.losses,
  goalsScored: row.goals_scored,
  goalsConceded: row.goals_conceded,
  points: row.points,
  lastFiveGameResults: (row.last_five ?? []).map((result) => ({
    value: result.value,
    playedAt: result.playedAt,
  })),
});
