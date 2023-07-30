
export const generateEliminationStructure = ( data = [] ) => {
 
  const jsonStructure = data.map((game) => ({
    id: game.id,
    nextMatchId: game.nextMatchId,
    tournamentRoundText: game.tournamentRoundText,
    startTime: game.createdAt,
    state: 'SCHEDULED', // You may need to update this based on your actual data
    participants: [
      {
        id: game.team1?.id,
        resultText:
              game.score1 === null
                ? null
                : game.score1 > game.score2
                  ? 'Won'
                  : 'Lost',
        isWinner: game.score1 > game.score2,
        status: game.score1 === null ? null : 'PLAYED',
        name: game.team1?.teamName,
        picture: game.team1?.logoUrl || 'teamlogos/client_team_default_logo',
      },
      {
        id: game.team2?.id,
        resultText:
              game.score2 === null
                ? null
                : game.score2 > game.score1
                  ? 'Won'
                  : 'Lost',
        isWinner: game.score2 > game.score1,
        status: game.score2 === null ? null : 'PLAYED',
        name: game.team2?.teamName,
        picture: game.team2?.logoUrl || 'teamlogos/client_team_default_logo',
      },
    ],
  }));
  
  return jsonStructure;

}
