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
  pitcher1Name: row.pitcher1_name,
  pitcher1Id: row.pitcher1_id,
  pitcher2Name: row.pitcher2_name,
  pitcher2Id: row.pitcher2_id,
  seriesId: row.series_id,
  gameNumber: row.game_number,
  tournamentRoundText: row.round_text,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapSeries = (row) => ({
  id: row.id,
  tournamentId: row.tournament_id,
  round: row.round,
  slot: row.slot,
  bestOf: row.best_of,
  team1: mapTeam(row.team1),
  team2: mapTeam(row.team2),
  seed1: row.seed1,
  seed2: row.seed2,
  wins1: row.wins1,
  wins2: row.wins2,
  winnerId: row.winner_id,
  nextSeriesId: row.next_series_id,
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
  runDiff: row.goals_scored - row.goals_conceded,
  playoffSeed: row.playoff_seed,
  points: row.points,
  lastFiveGameResults: (row.last_five ?? []).map((result) => ({
    value: result.value,
    playedAt: result.playedAt,
  })),
});
