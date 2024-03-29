const tournamentTypeOptions = [
  {
    value: "League",
    key: 1,
  },
  {
    value: "Knockout",
    key: 2,
  }
];

const sportTypeOptions = [
  {
    value: "FIFA",
    key: 1,
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

export default {
  tournamentTypeOptions,
  sportTypeOptions,
  numberOfTeamsInKnockout
}