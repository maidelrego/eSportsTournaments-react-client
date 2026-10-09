const tournamentTypeOptions = [
  {
    value: "League",
    key: 1,
  },
  {
    value: "Knockout",
    key: 2,
  },
  {
    // MLB only: single round robin season, then wild card style playoffs
    value: "Season + Playoffs",
    key: 3,
  }
];

export const TYPE = {
  LEAGUE: 1,
  KNOCKOUT: 2,
  SEASON: 3,
};

export const SPORT = {
  FIFA: 1,
  MLB: 2,
};

const sportTypeOptions = [
  {
    value: "FIFA",
    key: SPORT.FIFA,
  },
  {
    value: "MLB The Show",
    key: SPORT.MLB,
  }
];

const numberOfTeamsInKnockout = [
  {
    value: '16 Teams (Round of 16, Round of 8, Semi-Finals, Finals)',
    key: 1,
  },
  {
    value: '8 Teams (Quarter-Finals, Semi-Finals, Finals)',
    key: 2,
  },
  {
    value: '4 Teams (Semi-Finals, Finals)',
    key: 3,
  }
];

const bestOfOptions = [
  { value: "Best of 1", key: 1 },
  { value: "Best of 3", key: 3 },
  { value: "Best of 5", key: 5 },
  { value: "Best of 7", key: 7 },
];

// Mirrors the SQL function default_playoff_teams(): used as the form default only,
// the server validates whatever is sent.
export const defaultPlayoffTeams = (players) => {
  if (players <= 3) return 2;
  if (players <= 5) return 4;
  if (players <= 8) return 5;
  return 6;
};

export default {
  tournamentTypeOptions,
  sportTypeOptions,
  numberOfTeamsInKnockout,
  bestOfOptions,
}