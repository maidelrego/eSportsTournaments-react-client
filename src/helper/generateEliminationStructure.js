import moment from "moment";

export const generateEliminationStructure = (data = []) => {
  const jsonStructure = data.map((game) => ({
    id: game.id,
    nextMatchId: game.nextMatchId,
    tournamentRoundText: game.tournamentRoundText,
    startTime: moment(game.createdAt).format("MM-DD-YYYY"),
    state: "SCHEDULED",
    participants: [
      {
        id: game.team1?.id,
        resultText: game.score1 === null ? '' : game.score1 + "",
        isWinner: game.score1 > game.score2,
        status: game.score1 === null ? null : "PLAYED",
        name: game.team1?.teamName,
        picture: game.team1?.logoUrl || "teamlogos/client_team_default_logo",
      },
      {
        id: game.team2?.id,
        resultText: game.score2 === null ? '' : game.score2 + "",
        isWinner: game.score2 > game.score1,
        status: game.score2 === null ? null : "PLAYED",
        name: game.team2?.teamName,
        picture: game.team2?.logoUrl || "teamlogos/client_team_default_logo",
      },
    ],
  }));

  return jsonStructure;
};

// Bracket nodes for best-of series (MLB Season + Playoffs). One node per series, the result is the
// number of games won. A slot that is still empty (waiting for the previous round) shows "TBD".
// The bracket library lays columns out from the first round, so every seed that skips round 1
// (a bye) gets a placeholder "vs BYE" node there, which keeps the usual seeded bracket shape.
export const generateSeriesStructure = (series = []) => {
  const teamParticipant = (team, wins, seed, series_, slot) => ({
    id: team?.id ?? `tbd-${series_.id}-${slot}`,
    resultText: team ? String(wins) : "",
    isWinner: !!team && series_.winnerId === team.id,
    status: team && (wins > 0 || series_.winnerId) ? "PLAYED" : null,
    name: team ? `${seed ? `(${seed}) ` : ""}${team.teamName}` : "TBD",
    picture: team?.logoUrl || "teamlogos/client_team_default_logo",
  });

  const nodes = series.map((item) => ({
    order: [item.round, item.slot],
    match: {
      id: item.id,
      nextMatchId: item.nextSeriesId,
      tournamentRoundText: String(item.round),
      startTime: `Best of ${item.bestOf}`,
      state: item.winnerId ? "DONE" : "SCHEDULED",
      participants: [
        teamParticipant(item.team1, item.wins1, item.seed1, item, 1),
        teamParticipant(item.team2, item.wins2, item.seed2, item, 2),
      ],
    },
  }));

  // series of round 2 fed by fewer than two round 1 series: the missing feeders are byes
  series
    .filter((item) => item.round === 2)
    .forEach((item) => {
      const feeders = series.filter((other) => other.nextSeriesId === item.id);
      const feederSlots = feeders.map((feeder) => feeder.slot);
      const byeTeams = [
        { team: item.team1, seed: item.seed1 },
        { team: item.team2, seed: item.seed2 },
      ].filter(
        ({ team }) => team && !feeders.some((feeder) => feeder.winnerId === team.id)
      );

      [item.slot * 2, item.slot * 2 + 1]
        .filter((slot) => !feederSlots.includes(slot))
        .forEach((slot, index) => {
          const bye = byeTeams[index];
          if (!bye) return;
          nodes.push({
            order: [1, slot],
            match: {
              id: `bye-${item.id}-${slot}`,
              nextMatchId: item.id,
              tournamentRoundText: "1",
              startTime: "",
              state: "DONE",
              participants: [
                {
                  id: bye.team.id,
                  resultText: "",
                  isWinner: true,
                  status: "PLAYED",
                  name: `(${bye.seed}) ${bye.team.teamName}`,
                  picture: bye.team.logoUrl || "teamlogos/client_team_default_logo",
                },
                {
                  id: `bye-${item.id}-${slot}`,
                  resultText: "",
                  isWinner: false,
                  status: null,
                  name: "BYE",
                  picture: "teamlogos/client_team_default_logo",
                },
              ],
            },
          });
        });
    });

  return nodes
    .sort((a, b) => a.order[0] - b.order[0] || a.order[1] - b.order[1])
    .map(({ match }) => match);
};
