export const restartTournamentData = async (tournamentData) => {
  let { tournamentName, sport, type, teams } = tournamentData;
  // change name if it's restared more than once

  if (tournamentName.includes('Restarted')) {
    tournamentName = tournamentName.split('Restarted')[0].trim();
  } else {
    tournamentName = tournamentName + ' (Restarted)';
  }

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