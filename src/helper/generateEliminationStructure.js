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

  console.log('asdasdas', jsonStructure);

  return jsonStructure;
};
