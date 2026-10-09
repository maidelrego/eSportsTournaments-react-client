const isPowerOfTwo = (n) => n > 0 && (n & (n - 1)) === 0;

// Round 1 is the "Wild Card" round when some seeds get a bye (playoff teams is not a power of two).
export const getPlayoffRoundName = (round, totalRounds, playoffTeams) => {
  if (round === totalRounds) return "Finals";
  if (round === 1 && !isPowerOfTwo(playoffTeams)) return "Wild Card";

  switch (totalRounds - round) {
  case 1:
    return "Semi-Finals";
  case 2:
    return "Quarter-Finals";
  default:
    return `Round ${round}`;
  }
};
