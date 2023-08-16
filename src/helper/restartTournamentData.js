export const restartTournamentData = async (tournamentData) => {
  let { tournamentName, sport, type, teams, uniqueId } = tournamentData;
  // change name if it's restared more than once

  const extractUUID = uniqueId.split('-')[0];
  tournamentName = tournamentName + ` ${extractUUID}`;
  let newTeams = [];
  
  for (const team of teams) {
    // just keep team name and user name 
   
    const newTeam = {
      teamName: team.teamName,
      playerName: team.userName,
      logoUrl: team.logoUrl,
    }

    newTeams.push(newTeam);
  }
  const data = {
    tournamentName,
    sport,
    type,
    teams: newTeams,
  };

  return data;

}