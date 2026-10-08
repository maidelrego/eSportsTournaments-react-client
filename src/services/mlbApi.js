import axios from "axios";

// Free public MLB Stats API: no key, CORS enabled. A team in MLB The Show is a real MLB club.
const MLB_TEAMS_URL = "https://statsapi.mlb.com/api/v1/teams?sportId=1&activeStatus=Y";
const mlbLogo = (teamId) => `https://www.mlbstatic.com/team-logos/${teamId}.svg`;

let teamsPromise = null;

const loadMlbTeams = () => {
  if (!teamsPromise) {
    teamsPromise = axios
      .get(MLB_TEAMS_URL)
      .then(({ data }) =>
        data.teams
          .map((team) => ({
            name: team.name,
            abbreviation: team.abbreviation,
            logo: mlbLogo(team.id),
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      .catch((error) => {
        teamsPromise = null; // allow a retry on the next search
        throw error;
      });
  }
  return teamsPromise;
};

// Same { name, logo } shape the football search returns.
export const searchMlbTeams = async (query = "") => {
  const teams = await loadMlbTeams();
  const q = query.trim().toLowerCase();
  const filtered = q
    ? teams.filter(
      (team) =>
        team.name.toLowerCase().includes(q) ||
          team.abbreviation.toLowerCase() === q
    )
    : teams;
  return filtered.map(({ name, logo }) => ({ name, logo }));
};
